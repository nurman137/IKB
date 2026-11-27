import {fmt as f} from './lab-core.js';
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
function arrow(x,y,dx,color='#c85d35'){const len=Math.abs(dx),r=dx<0?180:0;return `<g transform="translate(${x} ${y}) rotate(${r})" fill="none" stroke="${color}" stroke-width="3"><path d="M0 0H${len}m-9-6 9 6-9 6"/></g>`;}
const wall=x=>`<path d="M${x} 100V210" stroke="#58734f" stroke-width="3"/>${[0,1,2,3,4].map(i=>`<path d="M${x} ${106+i*20}l${x<300?-14:14} 14" stroke="#789573" stroke-width="1.5"/>`).join('')}`;
const maxDrawn=110;

export function drawnExpansion(e,scale){
  if(e.status==='invalid'||e.data.support!=='free')return 0;
  const v=e.result.delta_free_mm/e.data.L_mm*330*scale;
  return Math.max(-maxDrawn,Math.min(maxDrawn,v));
}

export function pipeDiagram(e,scale=200){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,fixed=d.support==='fixed',heat=d.deltaT_C>0,cool=d.deltaT_C<0;
  const tint=heat?'#e7b08f':cool?'#9fbfd6':'#99ae8d',x0=110,x1=440,y=155,H=46,Hi=H*d.di_mm/d.d_mm;
  const ext=drawnExpansion(e,scale),capped=!fixed&&Math.abs(r.delta_free_mm/d.L_mm*330*scale)>maxDrawn;
  const pipe=xe=>`<rect x="${x0}" y="${y-H/2}" width="${xe-x0}" height="${H}" fill="${tint}" stroke="#405d4c" stroke-width="2"/>${Hi>0?`<path d="M${x0} ${y-Hi/2}H${xe}M${x0} ${y+Hi/2}H${xe}" stroke="#405d4c" stroke-dasharray="6 5"/>`:''}`;
  let body=wall(x0)+pipe(fixed?x1:x1+ext);
  body+=`<rect x="${x0}" y="${y-H/2}" width="${x1-x0}" height="${H}" fill="none" stroke="#5e7658" stroke-dasharray="6 5"/>`;
  if(fixed){
    body+=wall(x1);
    if(r.reactionSense!=='none'){const push=r.reactionSense==='push';body+=push?arrow(x0-75,y,60,'#405d4c')+arrow(x1+75,y,-60,'#405d4c'):arrow(x0+70,y-50,-55,'#405d4c')+arrow(x1-70,y-50,55,'#405d4c');}
    body+=text(295,y+85,e.fixedElastic?`σ = ${f(r.sigma_fully_fixed_MPa,5)} MPa (${r.sigma_fully_fixed_MPa<0?'tekan':r.sigma_fully_fixed_MPa>0?'tarik':'nol'}) · |R| = ${f(r.reactionMagnitude_N/1000,5)} kN`:'σ terkekang di luar domain elastis','text-anchor="middle"');
    body+=text(295,y+111,'δ = 0: panjang ditahan tetap','text-anchor="middle" class="diagram-small"');
  }else{
    body+=text(295,y+85,`δ bebas = ${f(r.delta_free_mm,5)} mm · σ = 0`,'text-anchor="middle"');
    body+=text(295,y+111,`Ujung kanan bebas bergerak aksial; gambar diperbesar ${scale}×${capped?' (dibatasi)':''}`,'text-anchor="middle" class="diagram-small"');
  }
  body+=text(295,60,`ΔT = ${f(d.deltaT_C)} °C · ${heat?'dipanaskan':cool?'didinginkan':'tanpa perubahan temperatur'}`,'text-anchor="middle"');
  body+=`<path d="M${x0} 288H${x1}M${x0} 282v12M${x1} 282v12" stroke="#93a487"/>`+text(275,312,`L = ${f(d.L_mm)} mm`,'text-anchor="middle"');
  return svg(body,fixed?`Pipa terkekang di kedua ujung, ΔT ${f(d.deltaT_C)} derajat Celsius. ${e.fixedElastic?`Tegangan ${f(r.sigma_fully_fixed_MPa)} MPa, reaksi ${f(r.reactionMagnitude_N)} newton.`:'Di luar domain elastis.'}`:`Pipa bebas memuai, ΔT ${f(d.deltaT_C)} derajat Celsius; perubahan panjang ${f(r.delta_free_mm)} mm tanpa tegangan.`,325)+
    `<p class="figure-caption">Garis putus-putus: panjang awal. Warna hangat menandai pemanasan, warna dingin pendinginan. ${fixed?'Panah hijau: gaya pipa pada tumpuan (mendorong saat dipanaskan, menarik saat didinginkan); tumpuan memberi reaksi yang sama besar dan berlawanan arah.':'Tanpa penahan, pipa berubah panjang dengan bebas sehingga tidak ada tegangan aksial termal.'} Skema tidak berskala.</p>`;
}

export function stressTemperatureGraph(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,k=d.E_MPa*d.alpha_per_C,Sy=d.Sy_MPa;
  const span=Math.max(Math.abs(d.deltaT_C)*1.4,Sy/k*1.15,10),X=t=>295+t/span*215,sMax=k*span,Y=s=>165-s/sMax*120;
  const dot=e.fixedElastic?`<circle cx="${X(d.deltaT_C)}" cy="${Y(r.sigma_fully_fixed_MPa)}" r="6" fill="#405d4c"/>`:`<circle cx="${X(d.deltaT_C)}" cy="${Y(r.sigma_fully_fixed_MPa)}" r="6" fill="#fff" stroke="#c85d35" stroke-width="2"/>`;
  return svg(`${text(80,24,'σ terkekang (MPa)')}<path d="M80 165H510M295 40V290" stroke="#879b7c"/>
    <path d="M${X(-span)} ${Y(k*span)}L${X(span)} ${Y(-k*span)}" stroke="#405d4c" stroke-width="3"/>
    <path d="M80 ${Y(Sy)}H510M80 ${Y(-Sy)}H510" stroke="#c85d35" stroke-dasharray="7 4"/>${text(505,Y(Sy)-7,`+Sᵧ = ${f(Sy)}`,'text-anchor="end" class="diagram-small"')}${text(505,Y(-Sy)+20,`−Sᵧ`,'text-anchor="end" class="diagram-small"')}
    ${dot}${text(X(d.deltaT_C)+12,Y(r.sigma_fully_fixed_MPa)-14,`${f(r.sigma_fully_fixed_MPa,4)} MPa`,'class="diagram-small"')}
    ${text(510,186,'ΔT (°C)','text-anchor="end"')}${text(300,58,'tarik','class="diagram-small"')}${text(300,282,'tekan','class="diagram-small"')}${text(100,186,'didinginkan','class="diagram-small"')}${text(430,150,'dipanaskan','class="diagram-small"')}`,
    `Grafik tegangan terkekang terhadap ΔT: garis lurus dengan kemiringan −Eα = ${f(-k)} MPa per derajat. Titik aktif ΔT ${f(d.deltaT_C)}, σ ${f(r.sigma_fully_fixed_MPa)} MPa.`,300)+
    `<p class="figure-caption">σ = −EαΔT: pemanasan memberi tekan, pendinginan memberi tarik, tidak bergantung pada L atau luas. Di luar ±Sᵧ (garis oranye) garis elastis tidak berlaku${e.fixedElastic?'':'; titik berongga menandai nilai elastis hipotetis yang tidak dipakai sebagai hasil'}. Tekuk pipa tekan belum dievaluasi.</p>`;
}
