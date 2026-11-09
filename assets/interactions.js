(() => {
  'use strict';
  const {C,A,B,Q,stash,esc,external,wa,order,sample,money,num,refill,reportTable,process,reviewItems,areaNames,href,documents} = window.JAMI_SITE;
  const one = (selector,scope=document) => scope.querySelector(selector);
  const all = (selector,scope=document) => [...scope.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 900px)');
  const pointer = matchMedia('(pointer: fine)');
  const canMove = () => !reduced.matches;
  const clamp = value => Math.max(0,Math.min(1,value));
  const key = text => text.trim().toLowerCase().replace(/\s+/g,' ');
  const localTime = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',weekday:'long',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function updateHours(){
    const parts = Object.fromEntries(localTime.formatToParts(new Date()).map(x=>[x.type,x.value]));
    const schedule = B.hours[parts.weekday] || '';
    const [start,end] = schedule.split(/[–—-]/).map(x=>x.trim());
    const now = parts.hour+':'+parts.minute;
    const open = end && now>=start && now<end;
    one('[data-open-status]').innerHTML = (open?'Open now':'Closed now')+' · PKT'+sample({sample:B.scheduleSample});
  }
  updateHours();
  setInterval(updateHours,60000);
  const show = (dialog,trigger) => {
    const existing = one('dialog[open]');
    if(existing) existing.close();
    dialog.returnFocus = existing?.returnFocus || trigger;
    if(!dialog.open) dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.querySelector('[data-close]')?.focus();
  };
  const menu = one('#site-menu'), trigger = one('.menu-trigger');
  const sheet = one('#order-sheet'), lightbox = one('#lightbox'), preview = one('[data-preview-content]');
  trigger.addEventListener('click',()=>{
    const box = trigger.getBoundingClientRect();
    menu.style.setProperty('--origin',`${box.left+box.width/2}px ${box.top+box.height/2}px`);
    trigger.setAttribute('aria-expanded','true');
    show(menu,trigger);
  });
  all('dialog').forEach(dialog=>{
    one('[data-close]',dialog).addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target===dialog&&dialog!==menu) dialog.close()});
    dialog.addEventListener('close',()=>{
      if(dialog===menu) trigger.setAttribute('aria-expanded','false');
      if(!one('dialog[open]')){
        document.body.classList.remove('dialog-open');
        dialog.returnFocus?.focus();
      }
      if(dialog===lightbox) preview.replaceChildren();
    });
    dialog.addEventListener('keydown',event=>{
      if(event.key!=='Tab') return;
      const controls = all('a[href],button,input,select,textarea',dialog).filter(x=>!x.disabled&&x.getClientRects().length);
      if(event.shiftKey&&document.activeElement===controls[0]){
        event.preventDefault(); controls.at(-1)?.focus();
      } else if(!event.shiftKey&&document.activeElement===controls.at(-1)){
        event.preventDefault(); controls[0]?.focus();
      }
    });
  });
  all('[data-order-sheet]').forEach(x=>x.addEventListener('click',()=>show(sheet,x)));
  all('[data-document]').forEach(x=>x.addEventListener('click',()=>{
    const code = x.dataset.document;
    preview.innerHTML = `<h3>${esc(documents.find(([key])=>key===code)[1])}</h3><p>${esc(Q[code])}</p><p>[Document to be supplied]</p>`;
    show(lightbox,x);
  }));
  all('[data-preview]').forEach(x=>x.addEventListener('click',()=>{
    const report = C.labReports.find(r=>r.id===x.dataset.preview);
    preview.innerHTML = `<h3>${esc(report.date)}${sample(report)}</h3><p>${esc(report.lab)}</p>${reportTable(report)}${report.file ? external(report.file,'Open report PDF') : '<p>[Report PDF to be supplied]</p>'}`;
    if(report.file&&navigator.onLine){
      const frame=document.createElement('iframe');
      frame.src=report.file; frame.title='Lab report PDF'; frame.className='pdf-preview';
      preview.append(frame);
    }
    show(lightbox,x);
  }));
  all('[data-report-filter]').forEach(x=>x.addEventListener('change',()=>{
    all('[data-report-month]').forEach(report=>{
      report.hidden = Boolean(x.value&&x.value!==report.dataset.reportMonth);
      if(!report.hidden&&canMove()) report.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(0.22, 1, 0.36, 1)'});
    });
  }));
  all('[data-dismiss]').forEach(x=>x.addEventListener('click',()=>{stash.set(x.dataset.dismiss); x.closest('[data-banner]').remove()}));
  all('[data-map]').forEach(x=>x.addEventListener('click',()=>{
    if(!navigator.onLine){x.textContent='Map needs internet';return}
    const iframe = document.createElement('iframe');
    iframe.title = 'Map of '+B.city;
    iframe.loading = 'lazy';
    iframe.src = B.mapEmbed;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    x.closest('.map-frame').replaceChildren(iframe);
  }));
  all('[data-message]').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();
    const error = one('.form-error',form), fallback = one('.form-fallback',form);
    fallback.replaceChildren();
    error.textContent='';
    all('[aria-invalid]',form).forEach(x=>x.removeAttribute('aria-invalid'));
    const fields = [...new FormData(form)].map(([k,v])=>[k,v.trim()]);
    const values = Object.fromEntries(fields);
    const bad = [...form.elements].find(x=>x.name&&(!x.validity.valid||x.required&&!x.value.trim()));
    const invalidPhone = !/^\+?[\d ()-]+$/.test(values.Phone)||!/^.{10,15}$/.test(values.Phone.replace(/\D/g,''));
    const emptyOrder = form.dataset.message==='Water order'&&Number(values['19L bottles'])===0&&!values['Other products'];
    if(bad||invalidPhone||emptyOrder){
      const field = bad || form.elements[invalidPhone?'Phone':'19L bottles'];
      const label = field.labels?.[0]?.childNodes[0].textContent.trim() || field.name;
      error.textContent = bad ? `Please check the ${label.toLowerCase()} field.` : invalidPhone ? 'Please enter a phone number with 10 to 15 digits.' : 'Add at least one refill or another product.';
      field.setAttribute('aria-invalid','true');
      field.focus();
      return;
    }
    const message = `Assalam o Alaikum! ${form.dataset.message} for ${B.name}.\n\n${fields.filter(([,value])=>value!=='').map(([label,value])=>label+': '+value).join('\n')}`;
    const url = wa(message);
    const tab = window.open('about:blank','_blank');
    if(tab){tab.opener=null;tab.location.replace(url)}
    fallback.innerHTML = external(url,'Tap to open WhatsApp','text-link');
  }));
  all('[data-batch]').forEach(form=>{
    const output = one('.batch-result',form.closest('section'));
    one('[data-try-batch]',form)?.addEventListener('click',event=>{
      form.elements.code.value=event.currentTarget.dataset.tryBatch;
      form.requestSubmit();
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const batch = C.batches.find(x=>key(x.code)===key(form.elements.code.value));
      const report = batch && C.labReports.find(x=>x.id===batch.report);
      output.innerHTML = batch ? `<article class="result"><h3>${esc(batch.code)}${sample(batch)}</h3><p>Filled ${esc(batch.date)}${sample(batch)}</p>${report?`<p>Tested ${esc(report.date)}${sample(report)} · ${esc(report.lab)}</p>${reportTable(report)}<a href="${href('lab-reports.html#'+report.id)}">See this report in the library</a>`:'<p>The report for this batch is pending.</p>'}</article>` :
        `<div class="result"><p>We couldn’t find that code. Check the print on your bottle or send us the code on WhatsApp.</p>${external(wa('Assalam o Alaikum! Could you help me check batch '+form.elements.code.value.trim()+'?'),'Ask about this batch','text-link')}</div>`;
    });
  });
  all('[data-area]').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();
    const entered = form.elements.area.value.trim();
    const match = C.deliveryAreas.find(x=>key(x.name)===key(entered));
    one('[data-area-result]',form).innerHTML = `<div class="result"><p>${match?esc(match.name)+' is on the delivery list'+sample(match)+'.':'That area is outside the listed routes.'} Confirm coverage and timing with us.</p>${external(wa('Assalam o Alaikum! Could you confirm water delivery to '+entered+'?'),'Confirm on WhatsApp','text-link')}</div>`;
  }));
  const motionTiming = 'cubic-bezier(0.22, 1, 0.36, 1)';
  function tween(from,to,draw){
    if(!canMove()||from===to){draw(to);return ()=>{}}
    const start = performance.now();
    let frame;
    function tick(time){
      const t = clamp((time-start)/520);
      draw(from+(to-from)*(1-Math.pow(1-t,3)));
      if(t<1) frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  }
  all('[data-plan]').forEach(select=>{
    const output = one('[data-plan-result]',select.closest('.calculators'));
    let last, stop=()=>{};
    function update(){
      const plan=C.plans[Number(select.value)];
      const singles=refill.price*plan.bottles;
      output.innerHTML=`<p>Monthly total<br><strong class="display-price" data-total></strong>${sample(plan)}</p><p>${singles>=plan.price?'Save '+money(singles-plan.price)+' versus buying singles':'Singles would cost '+money(singles)}${sample(plan)}.</p>${order(plan.name+' monthly plan','Order '+plan.name)}`;
      stop();
      stop=tween(last??plan.price,plan.price,value=>one('[data-total]',output).textContent=money(Math.round(value)));
      last=plan.price;
    }
    select.addEventListener('change',update);
    update();
  });
  all('[data-people]').forEach(input=>{
    const output=one('[data-bottle-result]',input.closest('.calculators'));
    function update(){
      if(!input.value||!input.validity.valid){output.textContent='Enter 1 to 100 people.';return}
      const count=Number(input.value);
      const min=Math.ceil(count*2*30/19), max=Math.ceil(count*3*30/19);
      output.innerHTML=`<p><strong>${min}–${max} bottles</strong> per 30 days</p><div class="mini-bottles" aria-hidden="true">${Array.from({length:Math.min(max,8)},(_,i)=>`<i style="--i:${i}"><b></b></i>`).join('')}</div>`;
    }
    input.addEventListener('input',update);update();
  });
  const carousels = all('.review-carousel').map(carousel=>{
    const cards=all('[data-review]',carousel);
    let selected=0, paused=false, visible=false, timer;
    const counter=one('[data-review-counter]',carousel);
    function select(i){
      selected=(i+cards.length)%cards.length;
      cards.forEach((card,j)=>{card.hidden=j!==selected});
      counter.textContent=num(selected+1)+' / '+num(cards.length);
    }
    function schedule(){
      clearInterval(timer);
      if(visible&&!paused&&canMove()&&!document.hidden&&!carousel.matches(':hover, :focus-within')&&cards.length>1) timer=setInterval(()=>select(selected+1),6500);
    }
    one('[data-review-prev]',carousel).onclick=()=>select(selected-1);
    one('[data-review-next]',carousel).onclick=()=>select(selected+1);
    const toggle=one('[data-review-pause]',carousel);
    toggle.onclick=()=>{
      paused=!paused;
      toggle.textContent=paused?'Resume rotation':'Pause rotation';
      schedule();
    };
    carousel.addEventListener('pointerenter',schedule);
    carousel.addEventListener('pointerleave',schedule);
    carousel.addEventListener('focusin',schedule);
    carousel.addEventListener('focusout',()=>setTimeout(schedule,0));
    document.addEventListener('visibilitychange',schedule);
    reduced.addEventListener('change',schedule);
    select(0);
    return {carousel,show(on){visible=on;schedule()}};
  });
  all('details').forEach(details=>{
    one('summary',details).addEventListener('click',event=>{
      if(!canMove())return;
      event.preventDefault();
      const body=one('div',details);
      body.getAnimations().forEach(x=>x.cancel());
      const closing=details.open;
      if(!closing) details.open=true;
      const frames=[{opacity:0,transform:'translateY(-10px) scaleY(.85)'},{opacity:1,transform:'none'}];
      const animation=body.animate(closing?frames.reverse():frames,{duration:420,easing:motionTiming});
      animation.onfinish=()=>{if(closing) details.open=false};
    });
  });
  const preloader=one('.preloader');
  const hero=one('.hero');
  function startHero(){
    document.documentElement.classList.add('ready');
    preloader?.remove();
  }
  if(hero&&canMove()){
    const h=one('h1',hero);
    const nodes=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);
    const words=[];
    while(nodes.nextNode()) words.push(nodes.currentNode);
    let index=0;
    words.forEach(node=>{
      const fragment=document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach(word=>{
        if(!word.trim()){fragment.append(word);return}
        const mask=document.createElement('span');mask.className='word-mask';
        const inner=document.createElement('span');inner.textContent=word;
        inner.style.setProperty('--i',index++);
        mask.append(inner);fragment.append(mask);
      });
      node.replaceWith(fragment);
    });
  }
  if(preloader){
    stash.set('intro');
    if(!canMove()) startHero();
    else {
      tween(0,100,value=>{
        one('span',preloader).textContent=String(Math.round(value)).padStart(3,'0');
        preloader.style.setProperty('--fill-y',(1-value/100)*195+'px');
      });
      setTimeout(()=>{preloader.classList.add('depart');document.documentElement.classList.add('ready')},580);
      setTimeout(startHero,1250);
    }
  } else startHero();
  const reveal = all('.reveal');
  reveal.forEach(el=>{
    [...el.children].forEach((child,i)=>child.style.setProperty('--i',Math.min(i,6)));
    if(canMove()&&el.getBoundingClientRect().top>innerHeight*.88) el.classList.add('waiting');
  });
  const head=one('.head'), footer=one('.footer'), gauge=one('.scroll-gauge i');
  const bar=one('.mobile-bar'), top=one('.back-top'), float=one('.float-order');
  const marquee=one('.marquee');
  if(marquee){
    const pause=one('.marquee-toggle',marquee);
    pause.addEventListener('click',()=>{
      const stopped=marquee.classList.toggle('paused');
      pause.setAttribute('aria-pressed',String(stopped));
      pause.textContent=stopped?'Resume strip':'Pause strip';
    });
  }
  const journeys=all('.journey').map(el=>({el,active:-1,override:null}));
  const ladders=all('.size-track').map(el=>({el,active:-1,override:null}));
  const fill=one('.fill-track');
  const activeVisuals=new Set();
  const visuals=[...all('.hero-art,.marquee,.wave-edge,.journey,.size-track,.fill-track')];
  function changeStage(j,i){
    if(i===j.active) return;
    j.active=i;
    j.el.style.setProperty('--active-step',i);
    all('[data-step]',j.el).forEach((x,k)=>x.setAttribute('aria-pressed',String(k===i)));
    all('[data-stage]',j.el).forEach((x,k)=>x.classList.toggle('active',i===k));
  }
  function changeSize(l,i){
    if(i===l.active) return;
    l.active=i;
    one('[data-size-counter]',l.el).textContent=num(i+1)+' / '+num(C.products.length);
    all('[data-size]',l.el).forEach((x,k)=>x.setAttribute('aria-pressed',String(k===i)));
    all('[data-size-detail]',l.el).forEach((x,k)=>{x.hidden=i!==k});
  }
  journeys.forEach(j=>{
    changeStage(j,0);
    all('[data-step]',j.el).forEach((x,i)=>x.addEventListener('click',()=>{
      if(!wide.matches||!canMove()) one(`[data-stage="${i}"]`,j.el).scrollIntoView({block:'nearest',behavior:'instant'});
      else {j.override=scrollY;changeStage(j,i)}
    }));
  });
  ladders.forEach(l=>{
    changeSize(l,0);
    all('[data-size]',l.el).forEach((x,i)=>{
      const pick=()=>{l.override=scrollY;changeSize(l,i)};
      x.addEventListener('click',pick);
      x.addEventListener('focus',pick);
      x.addEventListener('pointerenter',()=>{if(pointer.matches) pick()});
    });
  });
  let previousScroll=scrollY, frame=0;
  const progress = (track,stage) => {
    const box=track.getBoundingClientRect();
    return clamp((110-box.top)/Math.max(1,box.height-stage.offsetHeight-140));
  };
  function update(){
    frame=0;
    const y=scrollY;
    const footerNear=footer.getBoundingClientRect().top<innerHeight+16;
    head.classList.toggle('scrolled',y>30);
    bar.classList.toggle('away',footerNear);
    float.classList.toggle('away',footerNear||(hero?.getBoundingClientRect().bottom??0)>innerHeight-115);
    top.classList.toggle('visible',y>500);
    top.classList.toggle('at-footer',footerNear);
    gauge.style.setProperty('--progress',clamp(y/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
    if(marquee&&y!==previousScroll) marquee.style.setProperty('--marquee-dir',y>previousScroll?'normal':'reverse');
    if(wide.matches&&canMove()){
      journeys.forEach(j=>{
        if(j.override!==null&&Math.abs(y-j.override)>22) j.override=null;
        if(j.override!==null||!activeVisuals.has(j.el))return;
        const p=progress(j.el,one('.journey-stage',j.el));
        j.el.style.setProperty('--drop-progress',p);
        changeStage(j,Math.min(process.length-1,Math.floor(p*process.length)));
      });
      ladders.forEach(l=>{
        if(l.override!==null&&Math.abs(y-l.override)>34) l.override=null;
        if(l.override!==null||!activeVisuals.has(l.el))return;
        const p=progress(l.el,one('.size-stage',l.el));
        changeSize(l,Math.min(C.products.length-1,Math.floor(p*C.products.length)));
      });
      if(fill&&activeVisuals.has(fill)) fill.style.setProperty('--fill-y',(1-progress(fill,one('.fill-sticky',fill)))*170+'px');
    }
    previousScroll=y;
  }
  function queue(){if(!frame)frame=requestAnimationFrame(update)}
  if('IntersectionObserver' in window){
    const observer = new IntersectionObserver(entries=>{
      entries.forEach(({target,isIntersecting})=>{
        if(visuals.includes(target)){
          if(isIntersecting) activeVisuals.add(target);else activeVisuals.delete(target);
          target.classList.toggle('onscreen',isIntersecting);
        }
        if(isIntersecting&&target.classList.contains('reveal')) target.classList.remove('waiting');
        if(isIntersecting&&target.hasAttribute('data-stat')&&!target.dataset.counted){
          target.dataset.counted='true';
          tween(0,Number(target.dataset.stat),x=>target.textContent=Math.round(x).toLocaleString('en-PK'));
        }
        carousels.find(x=>x.carousel===target)?.show(isIntersecting);
      });
      queue();
    },{rootMargin:'24px'});
    [...new Set([...reveal,...visuals,...carousels.map(x=>x.carousel),...all('[data-stat]')])].forEach(el=>observer.observe(el));
  } else {
    reveal.forEach(el=>el.classList.remove('waiting'));
    visuals.forEach(el=>{activeVisuals.add(el);el.classList.add('onscreen')});
  }
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});queue();
  const heroArt=one('[data-tilt]');
  let lastRipple=0;
  function tilt(x,y){
    if(!heroArt||!canMove())return;
    heroArt.style.setProperty('--rx',y+'deg');
    heroArt.style.setProperty('--ry',x+'deg');
  }
  if(heroArt){
    hero.addEventListener('pointermove',event=>{
      if(!pointer.matches||!wide.matches||!canMove())return;
      const box=hero.getBoundingClientRect();
      tilt(((event.clientX-box.left)/box.width-.5)*12,((event.clientY-box.top)/box.height-.5)*-10);
      if(performance.now()-lastRipple<95||all('.pointer-ripple',hero).length>=6)return;
      lastRipple=performance.now();
      const ripple=document.createElement('span');
      ripple.className='pointer-ripple';
      ripple.style.setProperty('--x',event.clientX-box.left+'px');
      ripple.style.setProperty('--y',event.clientY-box.top+'px');
      ripple.setAttribute('aria-hidden','true');
      hero.append(ripple);
      setTimeout(()=>ripple.remove(),720);
    });
    hero.addEventListener('pointerleave',()=>tilt(0,0));
    if(!('requestPermission' in (window.DeviceOrientationEvent||{}))){
      addEventListener('deviceorientation',e=>{
        if(!pointer.matches&&activeVisuals.has(heroArt)&&e.gamma!==null) tilt(Math.max(-8,Math.min(8,e.gamma/4)),Math.max(-8,Math.min(8,(e.beta-30)/5)));
      },{passive:true});
    }
  }
  all('.btn').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      if(!canMove()||!pointer.matches)return;
      const r=button.getBoundingClientRect();
      button.style.setProperty('--mx',(event.clientX-r.left-r.width/2)*.085+'px');
      button.style.setProperty('--my',(event.clientY-r.top-r.height/2)*.16+'px');
    });
    button.addEventListener('pointerleave',()=>{button.style.removeProperty('--mx');button.style.removeProperty('--my')});
  });
  const wipe=one('.wipe');
  let navigating=false;
  document.addEventListener('click',event=>{
    const button=event.target.closest('.btn,.overlay nav a');
    if(button&&canMove()){
      const r=button.getBoundingClientRect();
      const el=document.createElement('span');
      el.className='tap-ripple';el.setAttribute('aria-hidden','true');
      el.style.setProperty('--x',(event.detail?event.clientX-r.left:r.width/2)+'px');
      el.style.setProperty('--y',(event.detail?event.clientY-r.top:r.height/2)+'px');
      button.append(el);setTimeout(()=>el.remove(),650);
    }
    const anchor=event.target.closest('a[href]');
    if(!anchor||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||!canMove())return;
    const url=new URL(anchor.href);
    if(!['file:','https:','http:'].includes(url.protocol)||url.protocol!==location.protocol||url.host!==location.host||!url.pathname.endsWith('.html')||url.pathname===location.pathname)return;
    event.preventDefault();
    if(navigating)return;
    navigating=true;
    if(menu.open)menu.close();
    wipe.classList.add('on');
    setTimeout(()=>location.assign(url.href),460);
  });
  addEventListener('pageshow',()=>{
    wipe.classList.remove('on');
    navigating=false;
    queue();
  });
})();
