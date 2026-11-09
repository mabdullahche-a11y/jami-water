const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = __dirname;
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(base,'assets/config.js'),'utf8'), context);
const config = context.window.JAMI_CONFIG;
const business = config.business;
const pages = {
  index:['Home',`19-litre refills in ${business.city}, with batch codes and dated lab reports.`],
  order:['Order','Prepare a water delivery request and send it through WhatsApp.'],
  plans:['Plans & pricing','Compare per-bottle prices, refundable deposits and monthly refill plans.'],
  products:['Products','Browse bottled water sizes, dispensers, pumps and stands.'],
  home:['For households','Plan 19-litre refills, return empties and book a TDS test.'],
  office:['For offices','Request an office, school, shop or clinic delivery quote.'],
  'water-quality':['Water quality','View licence records, lab measurements, treatment stages and filter changes.'],
  'lab-reports':['Lab reports','Find dated laboratory results with measured values next to their limits.'],
  'batch-check':['Batch check','Look up the code on your bottle and find its report.'],
  'delivery-areas':['Delivery areas',`Check neighbourhoods and delivery slots in ${business.city}.`],
  about:['Our plant','See the plant’s treatment process, facilities and compliance records.'],
  blog:['Water notes','Read practical guides to water reports, bottle storage and dispenser care.'],
  reviews:['Reviews','Read customer delivery experiences.'],
  faq:['FAQs','Find answers about deposits, empty bottles, delivery and testing.'],
  contact:['Contact','Ask about delivery or report an issue with your batch code.'],
  privacy:['Privacy','See how order information is handled.'],
  '404':['Page not found','Find a way back to delivery, water quality or batch lookup.']
};
for (const {slug,title,summary} of config.blog) {
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug in pages) throw Error('Invalid or duplicate article slug: '+slug);
  pages[slug] = [title,summary];
}
const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const message = encodeURIComponent(`Assalam o Alaikum! I'd like to order water from ${business.name}. Could you please confirm delivery for my area?`);
for(const [slug,[title,description]] of Object.entries(pages)){
  const name = slug==='index' ? `${business.name} | Water delivery in ${business.city}` : `${title} | ${business.name}`;
  const article = config.blog.find(x=>x.slug===slug);
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${slug==='404'?"<script>if (location.protocol !== 'file:') { const base = document.createElement('base'); base.href = '/'; document.head.append(base); }</script>":''}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(name)}</title>
  <meta name="description" content="${escape(description)}">
  <meta property="og:type" content="${article?'article':'website'}">
  <meta property="og:title" content="${escape(name)}">
  <meta property="og:description" content="${escape(description)}">
  ${config.demoMode?'<meta name="robots" content="noindex, nofollow">':''}
  <link rel="icon" href="assets/droplet.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/site.css">
  <script defer src="assets/config.js"></script>
  <script defer src="assets/ornaments.js"></script>
  <script defer src="assets/site.js"></script>
  <script defer src="assets/interactions.js"></script>
</head>
<body data-page="${slug}" data-title="${escape(title)}">
  <a class="skip" href="#main">Skip to content</a>
  <div id="app">
    <header class="head"><div class="wrap nav"><a class="brand" href="index.html">${escape(business.name)}</a></div></header>
    <main id="main" class="section"><div class="wrap">
      <h1>${escape(slug==='index'?business.tagline:title)}</h1>
      <p>${escape(description)}</p>
      ${article?article.sections.map(([heading,text])=>`<h2>${escape(heading)}</h2><p>${escape(text)}</p>`).join(''):''}
      <div class="row">
        <a class="btn primary" href="https://wa.me/${business.whatsapp}?text=${message}" target="_blank" rel="noopener">Order on WhatsApp</a>
        <a href="tel:${business.phone.replace(/[^\d+]/g,'')}">${escape(business.phone)}</a>
        <a href="lab-reports.html">Lab reports</a>
        <a href="index.html">Overview</a>
      </div>
    </div></main>
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(base,slug+'.html'),html);
}
const headers = [
  {source:'/assets/config.js',headers:[{key:'Cache-Control',value:'public, max-age=0, must-revalidate'}]},
  {source:'/assets/((?!config\\.js$).*)',headers:[{key:'Cache-Control',value:'public, max-age=3600, stale-while-revalidate=86400'}]}
];
if(config.demoMode) headers.push({source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow'}]});
fs.writeFileSync(path.join(base,'vercel.json'),JSON.stringify({cleanUrls:false,headers},null,2)+'\n');
console.log('Generated '+Object.keys(pages).length+' pages and Vercel headers. Demo mode: '+config.demoMode);

