import {fmt as f} from './lab-core.js';
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
function arrow(x,y,dx,dy,color='#c85d35',w=3){const a=Math.atan2(dy,dx)*180/Math.PI,len=Math.hypot(dx,dy);return `<g transform="translate(${x} ${y}) rotate(${a})" fill="none" stroke="${color}" stroke-width="${w}"><path d="M0 0H${len}m-8-5 8 5-8 5"/></g>`;}

export function shaftLoads(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,x0=120,x1=420,y=120,H=56;
  let body=`<rect x="${x0}" y="${y-H/2}" width="${x1-x0}" height="${H}" rx="6" fill="#99ae8d" stroke="#405d4c" stroke-width="2"/>`;
  if(d.F_N!==0){const t=d.F_N>0;body+=t?arrow(x0-10,y,-60,0)+arrow(x1+10,y,60,0):arrow(x0-70,y,60,0)+arrow(x1+70,y,-60,0);body+=text(x1+20,y-38,`F = ${f(d.F_N/1000,4)} kN`,'class="diagram-small"');}
  if(d.M_Nmm!==0)body+=`<path d="M${x0-28} ${y+44}a40 40 0 0 1 0-88" fill="none" stroke="#405d4c" stroke-width="3"/><path d="m${x0-28} ${y-44} 10 2m-10-2 4 9" stroke="#405d4c" stroke-width="3" fill="none"/><path d="M${x1+28} ${y+44}a40 40 0 0 0 0-88" fill="none" stroke="#405d4c" stroke-width="3"/><path d="m${x1+28} ${y-44}-10 2m10-2-4 9" stroke="#405d4c" stroke-width="3" fill="none"/>`+text(x0-40,y+72,`M = ${f(d.M_Nmm/1e6,4)} kN·m`,'class="diagram-small"');
  if(d.T_Nmm!==0)body+=`<ellipse cx="${(x0+x1)/2}" cy="${y}" rx="22" ry="${H/2+16}" fill="none" stroke="#c85d35" stroke-width="3" stroke-dasharray="70 30"/>`+text((x0+x1)/2,y-H/2-26,`T = ${f(d.T_Nmm/1e6,4)} kN·m`,'text-anchor="middle" class="diagram-small"');
  body+=`<circle cx="${x0+60}" cy="${y-H/2}" r="7" fill="#fff" stroke="#c85d35" stroke-width="3"/>${text(x0+60,y-H/2-14,'A','text-anchor="middle"')}<circle cx="${x0+60}" cy="${y+H/2}" r="7" fill="#fff" stroke="#c85d35" stroke-width="3"/>${text(x0+60,y+H/2+28,'B','text-anchor="middle"')}`;
  // Stress elements at A and B: σ along the axis (horizontal), τ on the faces.
  const element=(cx,label,s,vm)=>{const k=s===0?0:Math.sign(s)*24,tt=r.tau_surface_MPa!==0;
    return `<rect x="${cx-24}" y="230" width="48" height="48" fill="#edf2e6" stroke="#405d4c" stroke-width="2"/>${k>0?arrow(cx+26,254,24,0)+arrow(cx-26,254,-24,0):k<0?arrow(cx+50,254,-22,0)+arrow(cx-50,254,22,0):''}${tt?arrow(cx-22,224,44,0,'#405d4c',2)+arrow(cx+22,284,-44,0,'#405d4c',2):''}
    ${text(cx,215,label,'text-anchor="middle"')}${text(cx,306,`σ = ${f(s,4)} · τ = ${f(r.tau_surface_MPa,4)}`,'text-anchor="middle" class="diagram-small"')}${text(cx,326,`σ_vm = ${f(vm,4)} MPa`,'text-anchor="middle" class="diagram-small"')}`;};
  body+=element(170,'Elemen titik A (atas)',r.sigma_edge_A_MPa,r.vm_A_MPa)+element(420,'Elemen titik B (bawah)',r.sigma_edge_B_MPa,r.vm_B_MPa);
  return svg(body,`Poros diameter ${f(d.d_mm)} mm dengan F ${f(d.F_N)} N, M ${f(d.M_Nmm)} N mm, T ${f(d.T_Nmm)} N mm. Titik A: σ ${f(r.sigma_edge_A_MPa)}, titik B: σ ${f(r.sigma_edge_B_MPa)}, τ ${f(r.tau_surface_MPa)} MPa.`,340)+
    `<p class="figure-caption">A dan B berada di permukaan pada penampang yang sama. σ dari F sama di semua titik; σ dari M bertanda berlawanan di A dan B; τ dari T sama di seluruh permukaan. Satuan elemen dalam MPa; elemen tidak berskala.</p>`;
}

export function criterionBars(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,top=Math.max(d.Sy_MPa*1.1,r.sigma_vm_max_MPa*1.1),X=v=>150+v/top*380;
  const bar=(y,label,v)=>`${text(20,y+17,label,'class="diagram-small"')}<rect x="150" y="${y}" width="${Math.max(2,X(v)-150)}" height="24" rx="3" fill="${v>=d.Sy_MPa?'#c85d35':v>r.allowable_MPa?'#d9a066':'#405d4c'}"/>${text(Math.min(X(v)+8,520),y+17,`${f(v,4)}`,`class="diagram-small"${X(v)+8>470?' text-anchor="end"':''}`)}`;
  return svg(`${text(20,28,'Tegangan ekuivalen von Mises (MPa)')}${bar(55,'Titik A',r.vm_A_MPa)}${bar(95,'Titik B',r.vm_B_MPa)}
    <path d="M${X(d.Sy_MPa)} 45V140" stroke="#c85d35" stroke-width="2"/>${text(X(d.Sy_MPa),165,`Sᵧ = ${f(d.Sy_MPa)}`,'text-anchor="middle" class="diagram-small"')}
    <path d="M${X(r.allowable_MPa)} 45V140" stroke="#405d4c" stroke-dasharray="6 4"/>${text(X(r.allowable_MPa),188,`Sᵧ/n target = ${f(r.allowable_MPa)}`,'text-anchor="middle" class="diagram-small"')}
    ${text(20,230,r.n_yield===null?'n tidak terdefinisi pada tegangan nol':`n = Sᵧ/σ_vm,max = ${f(r.n_yield,4)} · target n ≥ ${f(d.n_required)}`)}
    ${text(20,258,e.checks.yielded?'Melampaui batas luluh: model elastis tidak berlaku.':e.checks.meets?'Memenuhi kriteria latihan n ≥ target (bukan pernyataan aman).':'Belum memenuhi kriteria latihan n ≥ target.','class="diagram-small"')}`,
    `Tegangan von Mises titik A ${f(r.vm_A_MPa)} dan B ${f(r.vm_B_MPa)} MPa dibandingkan dengan Sy ${f(d.Sy_MPa)} dan batas Sy/n ${f(r.allowable_MPa)} MPa.`,280)+
    `<p class="figure-caption">Batang hijau: di bawah Sᵧ/n target; jingga: di antara Sᵧ/n dan Sᵧ; oranye tua: mencapai Sᵧ. Kriteria memakai titik yang paling kritis, bukan penjumlahan maksimum dari lokasi berbeda.</p>`;
}
