const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {pathToFileURL,fileURLToPath} = require('node:url');
const {chromium} = require('playwright');
const root = __dirname;
const htmlFiles = fs.readdirSync(root).filter(file=>file.endsWith('.html')).sort();
const errors = new Set(), references = new Set();
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const deployment = require('./vercel.json');
const vm = require('node:vm');
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),sandbox);
const config = sandbox.window.JAMI_CONFIG;
const seedPresent = config.demoMode && config.batches.some(x=>x.code==='JW-DEMO-001'&&x.sample)
  && config.plans[1]?.price===2475 && config.products.length===4 && config.faqs.length>0
  && config.reviews.sampleReviewsEnabled && config.reviews.items.length>1
  && config.deliveryAreas.some(x=>x.name==='Model Town') && config.labReports.some(x=>x.id==='sample-oct');
const demoHeader = deployment.headers.some(group=>group.headers.some(h=>h.key==='X-Robots-Tag'));
const server = http.createServer((req,res)=>{
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)||!fs.statSync(file,{throwIfNoEntry:false})?.isFile()){res.writeHead(404).end();return}
  if(demoHeader)res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const localFile = url => url.protocol==='file:' ? fileURLToPath(url) : path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
const exists = file => fs.statSync(file,{throwIfNoEntry:false})?.isFile();
function checkCSS(file,seen=new Set()){
  if(seen.has(file))return;
  seen.add(file);
  const css = fs.readFileSync(file,'utf8');
  for(const [,ref] of css.matchAll(/url\(["']?([^'")]+)["']?\)/g)){
    if(ref.startsWith('#')||ref.startsWith('data:'))continue;
    const asset=path.resolve(path.dirname(file),ref);
    references.add(path.relative(root,asset));
    if(!exists(asset))errors.add('Missing CSS asset '+asset);
    else if(asset.endsWith('.css'))checkCSS(asset,seen);
  }
}
const optional = ['config.addons.*.use','config.blog.*.sourceNote','config.stats.*.sample','config.stats.*.unit','config.timeline.*.sample'];
async function auditDocument(page,address,base,label){
  const source = new URL(address);
  const result = await page.evaluate(()=>{
    const refs = [...document.querySelectorAll('[href],[src],[srcset]')].flatMap(el=>{
      const items=['href','src'].map(key=>el.getAttribute(key)).filter(Boolean);
      if(el.hasAttribute('srcset'))items.push(...el.getAttribute('srcset').split(',').map(x=>x.trim().split(/\s+/)[0]));
      return items.map(ref=>({ref,tag:el.tagName,target:el.target,rel:el.rel}));
    });
    const config=window.JAMI_CONFIG;
    return {refs,baseURI:document.baseURI,width:document.documentElement.scrollWidth,viewport:innerWidth,ids:[...document.querySelectorAll('[id]')].map(x=>x.id), missing:[...window.missingConfig],name:config.business.name,phone:config.business.whatsapp,demo:config.demoMode,robots:document.querySelector('meta[name=robots]')?.content, badAlt:[...document.images].some(x=>!x.hasAttribute('alt')), main:document.querySelectorAll('main').length};
  });
  if(result.width>result.viewport)errors.add(`${label}: horizontal overflow (${result.width} > ${result.viewport})`);
  if(result.main!==1||result.badAlt)errors.add(label+': missing semantic main or image alt');
  if(Boolean(result.robots?.includes('noindex'))!==result.demo||demoHeader!==result.demo)errors.add(label+': demo indexing metadata mismatch. Run node build.cjs.');
  if(new Set(result.ids).size!==result.ids.length)errors.add(label+': duplicate ids');
  for(const missing of result.missing) if(!optional.includes(missing)) errors.add(label+': missing '+missing);
  for(const {ref,tag,target,rel} of result.refs){
    const url = new URL(ref,result.baseURI);
    if(!['file:','http:','https:','tel:','mailto:'].includes(url.protocol)){
      errors.add(label+': unexpected URL '+ref);continue;
    }
    if(url.protocol==='tel:'&&!/^\+\d{10,15}$/.test(url.pathname)) errors.add(label+': malformed phone '+ref);
    if(url.hostname==='wa.me'&&(url.pathname!=='/'+result.phone||!url.searchParams.get('text')))errors.add(label+': malformed WhatsApp URL');
    if(url.protocol==='file:'||url.origin===base){
      const file=localFile(url);
      references.add(path.relative(root,file));
      if(!exists(file))errors.add(label+': missing '+ref);
      else if(url.hash&&url.pathname===source.pathname&&!result.ids.includes(decodeURIComponent(url.hash.slice(1))))errors.add(label+': broken local fragment '+ref);
    } else if(tag==='A'&&url.protocol==='https:'&&(target!=='_blank'||!rel?.split(' ').includes('noopener')))errors.add(label+': external link lacks safe target '+ref);
    if(url.hash&&url.pathname!==source.pathname&&(url.protocol==='file:'||url.origin===base)){
      const hash=decodeURIComponent(url.hash.slice(1));
      fragments.push({file:path.basename(localFile(url)),hash,label});
    }
  }
  return result.ids;
}
const fragments=[];
async function run(){
  checkCSS(path.join(root,'assets','site.css'));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.JAMI_BROWSER || undefined,headless:true});
  const ids=new Map();
  try{
    for(const width of [375,768,1280]){
      const context=await browser.newContext({viewport:{width,height:width===375?812:800},reducedMotion:'reduce'});
      await context.addInitScript(()=>{
        window.missingConfig=new Set();
        const wrap=(value,label)=>{
          if(!value||typeof value!=='object')return value;
          return new Proxy(value,{get(obj,key,receiver){
            if(typeof key==='symbol')return Reflect.get(obj,key,receiver);
            const next=label+'.'+(/^\d+$/.test(key)?'*':key);
            if(!(key in obj)&&!Array.isArray(obj)&&key!=='toJSON')window.missingConfig.add(next);
            return wrap(Reflect.get(obj,key,receiver),next);
          }});
        };
        Object.defineProperty(window,'JAMI_CONFIG',{configurable:true,set(value){
          Object.defineProperty(window,'JAMI_CONFIG',{value:wrap(value,'config'),configurable:true});
        }});
      });
      const page=await context.newPage();
      let label='';
      page.on('pageerror',error=>errors.add(label+': '+error.message));
      page.on('console',message=>{if(message.type()==='error')errors.add(label+': '+message.text())});
      page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')errors.add(label+': failed request '+request.url())});
      for(const file of htmlFiles){
        for(const scheme of width===1280?['http','disk']:['disk']){
          label=`${file} / ${width}px / ${scheme}`;
          const address=scheme==='http'?base+'/'+file:pathToFileURL(path.join(root,file)).href;
          const response=await page.goto(address,{waitUntil:'load'});
          if(scheme==='http') assert.equal(response.headers()['x-robots-tag']?.includes('noindex')||false,demoHeader);
          const found=await auditDocument(page,address,base,label);
          ids.set(file,found);
        }
      }
      console.log('Audited pages at '+width+' px.');
      if(!seedPresent){await context.close();continue}
      label=`interactive smoke / ${width}px`;
      const home=pathToFileURL(path.join(root,'index.html')).href+'?theme=aqua';
      await page.goto(home);
      await page.locator('.menu-trigger').click();
      assert.equal(await page.locator('#site-menu').evaluate(el=>el.open),true);
      await page.keyboard.press('Escape');
      await page.locator('[data-try-batch]').click();
      assert.match(await page.locator('.batch-result').innerText(),/112 mg\/L/);
      const batchLink=await page.locator('.batch-result a').getAttribute('href');
      assert.match(batchLink,/lab-reports\.html\?theme=aqua#sample-oct$/);
      await page.locator('[data-size="3"]').click();
      assert.equal(await page.locator('[data-size-counter]').innerText(),'04 / 04');
      await page.locator('[data-plan]').selectOption('1');
      assert.match(await page.locator('[data-plan-result]').innerText(),/2,475/);
      await page.locator('[data-people]').fill('6');
      assert.match(await page.locator('[data-bottle-result]').innerText(),/19–29/);
      await page.locator('[data-area] input').fill('model town');
      await page.locator('[data-area] button').click();
      assert.match(await page.locator('[data-area-result]').innerText(),/on the delivery list/);
      await page.locator('[data-review-next]').click();
      assert.match(await page.locator('[data-review-counter]').innerText(),/^02/);
      await page.locator('summary').first().click();
      assert.equal(await page.locator('details').first().evaluate(el=>el.open),true);
      await page.locator('main [data-order-sheet]').click();
      const form=page.locator('#order-sheet form');
      await form.locator('button[type=submit], button.btn.primary').click();
      assert.match(await form.locator('.form-error').innerText(),/name/);
      await page.evaluate(()=>{window.open=()=>null});
      for(const [name,value] of Object.entries({Name:'Test order',Phone:'03215928003',Address:'House 5', 'Preferred start date':'2027-01-01'}))await form.locator(`input[name="${name}"]`).fill(value);
      for(const [name,value] of Object.entries({Area:'Model Town','Delivery slot':'Morning',Frequency:'One-off'}))await form.locator(`select[name="${name}"]`).selectOption({label:value});
      await form.locator('button.btn.primary').click();
      const orderUrl=new URL(await form.locator('.form-fallback a').getAttribute('href'));
      assert.match(orderUrl.searchParams.get('text'),/Address: House 5\n19L bottles: 1/);
      await page.goto(new URL(batchLink,home).href);
      await page.locator('[data-report-filter]').selectOption('2026-09');
      assert.equal(await page.locator('#sample-oct').isHidden(),true);
      await page.locator('[data-report-filter]').selectOption('');
      await page.locator('[data-preview="sample-oct"]').click();
      assert.match(await page.locator('#lightbox').innerText(),/500 mg\/L/);
      await page.keyboard.press('Escape');
      const missing=await page.evaluate(()=>[...window.missingConfig]);
      missing.filter(x=>!optional.includes(x)).forEach(x=>errors.add(label+': missing '+x));
      await context.close();
    }
    const page=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'});
    page.on('pageerror',e=>errors.add('motion: '+e.message));
    page.on('console',m=>{if(m.type()==='error')errors.add('motion: '+m.text())});
    await page.goto(base+'/index.html');
    await page.locator('.preloader').waitFor({state:'detached'});
    if(await page.locator('.step-card').count()>1){
      await page.evaluate(()=>{const track=document.querySelector('.journey');scrollTo(0,track.offsetTop+track.offsetHeight*.45)});
      await page.waitForTimeout(220);
      assert.notEqual(await page.locator('.step-card.active').getAttribute('data-stage'),'0');
    }
    await page.locator('.menu-trigger').click();
    await page.locator('#site-menu nav a').filter({hasText:'Water quality'}).click();
    await page.waitForURL('**/water-quality.html');
    await page.goBack();
    assert.equal(await page.locator('.wipe.on').count(),0);
    await page.close();
  } finally {await browser.close();server.close()}
  for(const {file,hash,label} of fragments)if(!ids.get(file)?.includes(hash))errors.add(label+': broken fragment '+file+'#'+hash);
  if(errors.size)throw Error([...errors].join('\n'));
  console.log(`Playwright passed: ${htmlFiles.length} pages at 375, 768 and 1280 px from disk, plus ${htmlFiles.length} HTTP loads at 1280 px. ${references.size} distinct local targets. No broken links, missing assets/config keys, console errors or horizontal overflow. Menu and scroll motion passed.`);
  if(seedPresent) console.log('Sample batch, order, delivery, pricing, reviews, FAQ and preview checks passed.');
}
run().catch(error=>{server.close();console.error(error);process.exitCode=1});

