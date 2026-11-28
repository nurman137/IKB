// Analytic pages hand their inputs to the FE page without bundling FE code up front: the transfer module is
// fetched when the FE link is approached (hover/focus/touch) and awaited on click before navigating.
export function bindFELink(link,prepare,onInvalid,warm=()=>{}){
  if(!link)return;
  let warmed=false;const preload=()=>{if(!warmed){warmed=true;try{Promise.resolve(warm()).catch(()=>{});}catch{}}};
  for(const type of ['pointerenter','focus','touchstart'])link.addEventListener(type,preload,{passive:true,once:true});
  link.addEventListener('click',async event=>{
    // Modified clicks (new tab/window) keep native behaviour; the FE page then starts from its preset.
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    let ok=false;try{ok=Boolean(await prepare());}catch{ok=false;}
    if(ok)location.assign(link.href);else onInvalid();
  });
}
