// WCAG 2.1.1: a region that scrolls horizontally must be reachable and scrollable by keyboard.
// Only overflowing `.table-scroll` wrappers become focusable regions, so non-scrolling tables add no Tab stops.
const AUTO='auto';

export function regionLabel(el){
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().slice(0,80);
  const caption=clean(el.querySelector?.('caption')?.textContent);
  const host=el.closest?.('details,article,section');
  const heading=caption||clean(host?.querySelector?.(':scope > summary, :scope > h2, :scope > h3, :scope > h4')?.textContent);
  return heading?`Tabel: ${heading} (dapat digeser)`:'Tabel (dapat digeser)';
}

export function syncScrollRegion(el){
  const scrollable=el.scrollWidth>el.clientWidth+1;
  if(scrollable){
    if(!el.hasAttribute('tabindex')){el.setAttribute('tabindex','0');el.dataset.scrollRegion=AUTO;}
    if(!el.hasAttribute('role'))el.setAttribute('role','region');
    if(!el.hasAttribute('aria-label')&&!el.hasAttribute('aria-labelledby'))el.setAttribute('aria-label',regionLabel(el));
  }else if(el.dataset.scrollRegion===AUTO){
    // Undo only what this module added; author-provided attributes are left untouched.
    el.removeAttribute('tabindex');el.removeAttribute('role');el.removeAttribute('aria-label');delete el.dataset.scrollRegion;
  }
  return scrollable;
}

export function watchScrollRegions(doc=document,win=window){
  let queued=false;
  const run=()=>{queued=false;doc.querySelectorAll('.table-scroll').forEach(syncScrollRegion);};
  const schedule=()=>{if(!queued){queued=true;win.requestAnimationFrame(run);}};
  // Re-check after any render, when <details> opens, and on resize. Our own attribute writes are not observed.
  new win.MutationObserver(schedule).observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
  win.addEventListener('resize',schedule);
  doc.addEventListener('toggle',schedule,true);
  schedule();
}
