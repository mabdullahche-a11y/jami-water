(() => {
  let nextId = 0;
  const svg = (content, view='0 0 240 340', cls='') => `<svg aria-hidden="true" focusable="false" class="${cls}" viewBox="${view}" ${cls==='wave-edge'?'preserveAspectRatio="none"':''}>${content}</svg>`;
  const drop = svg('<path d="M12 1C9 7 4 11 4 16a8 8 0 0 0 16 0C20 11 15 7 12 1Z" fill="currentColor"/>','0 0 24 25','drop');
  const rings = svg('<g fill="none" stroke="currentColor" stroke-width="1"><circle cx="40" cy="40" r="12"/><circle cx="40" cy="40" r="25"/><circle cx="40" cy="40" r="38"/></g>','0 0 80 80','rings');
  const bottle = (size='19L', animated=false) => {
    const id = 'bottle-' + ++nextId;
    const big = size==='19L';
    const shape = big ? 'M87 42H153V61C153 76 170 84 195 101Q216 116 216 143V290Q216 322 187 324H53Q24 322 24 290V143Q24 116 45 101C70 84 87 76 87 61Z' : 'M95 42H145V70Q145 88 168 103Q183 113 183 143V297Q183 324 157 324H83Q57 324 57 297V143Q57 113 72 103Q95 88 95 70Z';
    const wave = (cls,y) => `<path class="${cls}" d="M-240 ${y}q30 -18 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0v370h-720z"/>`;
    const bubbles = Array.from({length:animated?14:0},(_,i)=>`<circle class="bubble" cx="${42+(i*37)%151}" cy="${229+i%5*16}" r="${2+i%5}" style="--delay:${-i*.63}s;--speed:${5+i%6}s"/>`).join('');
    return svg(`<defs><clipPath id="${id}"><path d="${shape}"/></clipPath></defs><path class="bottle-shell" d="${shape}"/><g clip-path="url(#${id})"><g class="liquid">${wave('wave-back',animated?122:145)}${wave('wave-front',animated?136:156)}${bubbles}</g><path class="bottle-seams" d="M19 140H221M20 151H220M20 179H220M20 265H220M20 275H220M20 298H220M53 115v42m0 130v14m134-182v33m0 129v17"/></g><path class="bottle-outline" d="${shape}"/><rect class="cap" x="${big?81:89}" y="23" width="${big?78:62}" height="22" rx="5"/><path class="cap-lines" d="M98 28v12m11-12v12m11-12v12m11-12v12m11-12v12"/><rect class="bottle-label" x="${big?25:58}" y="187" width="${big?190:124}" height="66"/><text class="bottle-name" x="120" y="218" text-anchor="middle" textLength="${big?142:108}" lengthAdjust="spacingAndGlyphs"></text><text class="bottle-size" x="120" y="240" text-anchor="middle">${size}</text>`,'0 0 240 340','bottle-art');
  };
  const wave = (variant=0) => svg(`<path class="wave-edge-back" d="M-200 24Q-100 0 0 24T200 24T400 24T600 24T800 24T1000 24T1200 24T1400 24T1600 24V80H-200Z"/><path class="wave-edge-front" d="M-200 ${39-variant*4}Q-100 63 0 ${39-variant*4}T200 ${39-variant*4}T400 ${39-variant*4}T600 ${39-variant*4}T800 ${39-variant*4}T1000 ${39-variant*4}T1200 ${39-variant*4}T1400 ${39-variant*4}T1600 ${39-variant*4}V80H-200Z"/>`,'0 0 1200 80','wave-edge');
  const stagePaths = {
    source:'M8 17q14-10 28 0t28 0m-56 14q14-10 28 0t28 0m-56 14q14-10 28 0t28 0',
    sediment:'M8 32h56m-56 5h56M15 14v6m12-9v6m14 3v6m13-13v6M22 45v7m25-7v7',
    carbon:'M12 12h48v42H12zM21 20h2m12 0h2m12 0h2m-30 12h2m12 0h2m12 0h2m-30 12h2m12 0h2m12 0h2',
    membrane:'M32 8v48m8-48v48M12 19h13m-13 13h13m-13 13h13m22-13h13',
    uv:'M36 7v10m0 30v10M11 32h10m30 0h10M18 14l8 8m20 20 8 8m0-36-8 8M26 42l-8 8M36 23a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
    minerals:'M36 9v16m-8-8h16M20 34v16m-8-8h16m24-8v16m-8-8h16',
    bottle:'M30 8h12v11l10 10v23a5 5 0 0 1-5 5H25a5 5 0 0 1-5-5V29l10-10zM21 38q7-6 15 0t15 0'
  };
  const stage = id => svg(`<path d="${stagePaths[id]||stagePaths.source}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle class="stage-particle" cx="36" cy="32" r="3" fill="currentColor"/>`,'0 0 72 64','stage-icon '+id);
  const pattern = svg('<g fill="none" stroke="currentColor"><circle cx="30" cy="30" r="10"/><circle cx="30" cy="30" r="20"/><circle cx="30" cy="30" r="29"/></g>','0 0 60 60','pattern');
  const mask = 'path("M120 0 C90 60 10 130 10 210 C10 350 230 350 230 210 C230 130 150 60 120 0Z")';
  window.JAMI_ART = {bottle,drop,rings,wave,stage,pattern,mask};
})();
