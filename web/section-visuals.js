import {fmt as f} from './lab-core.js';
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
const fill='fill="#99ae8d" stroke="#405d4c" stroke-width="2"';

// Draws one profile with its centroid axis. k = px per mm; (cx, base) = centre bottom of the drawn depth.
function profile(shape,d,orientation,cx,base,k){
  const strong=orientation==='strong';
  if(shape==='rect'){const [b,h]=strong?[d.b_mm,d.h_mm]:[d.h_mm,d.b_mm];return `<rect x="${cx-b*k/2}" y="${base-h*k}" width="${b*k}" height="${h*k}" ${fill}/>`;}
  if(shape==='pipe'){const R=d.d_mm*k/2;return `<circle cx="${cx}" cy="${base-R}" r="${R}" ${fill}/>${d.di_mm>0?`<circle cx="${cx}" cy="${base-R}" r="${d.di_mm*k/2}" fill="#fff" stroke="#405d4c" stroke-width="2"/>`:''}`;}
  const {bf_mm:bf,tf_mm:tf,h_mm:h,tw_mm:tw}=d,I=shape==='I';
  if(strong){
    const top=base-h*k,web=`<rect x="${cx-tw*k/2}" y="${top+tf*k}" width="${tw*k}" height="${(h-(I?2:1)*tf)*k}" ${fill}/>`;
    return `${web}<rect x="${cx-bf*k/2}" y="${top}" width="${bf*k}" height="${tf*k}" ${fill}/>${I?`<rect x="${cx-bf*k/2}" y="${base-tf*k}" width="${bf*k}" height="${tf*k}" ${fill}/>`:''}`;
  }
  // Rotated 90°: flanges become vertical plates, the web horizontal; depth is bf.
  const left=cx-h*k/2,web=`<rect x="${left+tf*k}" y="${base-bf*k/2-tw*k/2}" width="${(h-(I?2:1)*tf)*k}" height="${tw*k}" ${fill}/>`;
  return `${web}<rect x="${left}" y="${base-bf*k}" width="${tf*k}" height="${bf*k}" ${fill}/>${I?`<rect x="${left+(h-tf)*k}" y="${base-bf*k}" width="${tf*k}" height="${bf*k}" ${fill}/>`:''}`;
}

export function sectionPair(e){
  if(e.status==='invalid')return empty;
  const d=e.data,{orientation_A:A,orientation_B:B}=e.result;
  const span=Math.max(A.depth_mm,B.depth_mm,sizeW(e,'strong'),sizeW(e,'weak')),k=170/span,base=250;
  const one=(o,r,cx,label)=>`${profile(d.shape,d,o,cx,base,k)}<path d="M${cx-110} ${base-r.yc_mm*k}H${cx+110}" stroke="#c85d35" stroke-width="1.5" stroke-dasharray="6 4"/>${text(cx+112,base-r.yc_mm*k+5,'NA','text-anchor="end" class="diagram-small" dy="-10"')}
    ${text(cx,40,label,'text-anchor="middle"')}${text(cx,base+30,`I = ${f(r.I_mm4,5)} mm⁴`,'text-anchor="middle"')}${text(cx,base+56,`tinggi ${f(r.depth_mm,4)} mm`,'text-anchor="middle" class="diagram-small"')}`;
  return svg(`${one('strong',A,150,'A · seperti digambar')}${one('weak',B,440,'B · diputar 90°')}<path d="M295 70V270" stroke="#d6dfcd"/>`,
    `Dua orientasi penampang ${d.shape} dengan luas sama ${f(A.A_mm2,5)} mm persegi. Momen inersia A ${f(A.I_mm4,5)}, B ${f(B.I_mm4,5)} mm pangkat empat. Beban vertikal; sumbu netral horizontal melalui titik berat.`,320)+
    `<p class="figure-caption">Kedua gambar memakai skala yang sama. Beban bekerja vertikal, sehingga lentur terjadi terhadap sumbu netral horizontal (garis oranye) yang melalui titik berat. Luas sama; yang berbeda adalah sebaran material terhadap sumbu itu.${d.shape==='T'?' Pada profil T, sumbu netral tidak berada di tengah tinggi.':''}</p>`;
}
function sizeW(e,o){const d=e.data;if(d.shape==='rect')return o==='strong'?d.b_mm:d.h_mm;if(d.shape==='pipe')return d.d_mm;return o==='strong'?d.bf_mm:d.h_mm;}

export function stressComparison(e){
  if(e.status==='invalid')return empty;
  const {orientation_A:A,orientation_B:B}=e.result,max=Math.max(A.sigmaMax_MPa,B.sigmaMax_MPa,1e-12),Sy=e.data.Sy_MPa;
  const col=(r,x,label)=>{const top=78,bot=258,na=top+r.ctop_mm/r.depth_mm*180,sT=r.sigmaTop_MPa/max*90,sB=r.sigmaBottom_MPa/max*90;
    return `${text(x,26,label,'text-anchor="middle"')}<path d="M${x} ${top}V${bot}" stroke="#879b7c"/><path d="M${x} ${top}H${x+sT}L${x+sB} ${bot}H${x}Z" fill="#dce8d1" stroke="#405d4c" stroke-width="2"/>
    <path d="M${x-60} ${na}H${x+100}" stroke="#c85d35" stroke-dasharray="5 4"/>${text(x,top-12,`atas ${f(r.sigmaTop_MPa,5)} MPa`,'text-anchor="middle" class="diagram-small"')}${text(x,bot+24,`bawah +${f(r.sigmaBottom_MPa,5)} MPa`,'text-anchor="middle" class="diagram-small"')}`;};
  return svg(`${col(A,160,'Orientasi A')}${col(B,430,'Orientasi B')}`,`Tegangan lentur di tengah bentang. A: atas ${f(A.sigmaTop_MPa)} dan bawah ${f(A.sigmaBottom_MPa)} MPa. B: atas ${f(B.sigmaTop_MPa)} dan bawah ${f(B.sigmaBottom_MPa)} MPa.`,320)+
    `<p class="figure-caption">σ(y) = My/I dengan skala yang sama untuk kedua orientasi. Serat atas tekan (negatif), serat bawah tarik. ${e.data.shape==='T'?'Profil T tak simetris terhadap sumbu horizontal: c atas ≠ c bawah, sehingga Z atas ≠ Z bawah dan serat terjauh (bawah) paling kritis.':'Penampang simetris: |σ atas| = |σ bawah|.'} Sᵧ latihan = ${f(Sy)} MPa hanya batas domain elastis.</p>`;
}

export function stiffnessBars(e){
  if(e.status==='invalid')return empty;
  const {orientation_A:A,orientation_B:B,square:S}=e.result,rows=[['A · seperti digambar',A],['B · diputar 90°',B],['Bujur sangkar luas sama',S]];
  const maxI=Math.max(...rows.map(([,r])=>r.I_mm4)),W=200,bar=(y,w,c)=>`<rect x="240" y="${y}" width="${Math.max(2,w)}" height="22" rx="3" fill="${c}"/>`;
  return svg(`${text(20,30,'Momen inersia I (panjang batang relatif)')}${rows.map(([label,r],i)=>`${text(20,72+i*44,label,'class="diagram-small"')}${bar(56+i*44,r.I_mm4/maxI*W,i===0?'#405d4c':i===1?'#c85d35':'#a6b59a')}${text(248+Math.max(2,r.I_mm4/maxI*W),73+i*44,`${f(r.I_mm4,4)} mm⁴`,'class="diagram-small"')}`).join('')}
    ${text(20,220,'Lendutan tengah δ (mm)')}${rows.map(([label,r],i)=>text(20,252+i*24,`${label}: ${r.deltaMax_mm===null?(r.slender?'tidak dihitung (σ ≥ Sᵧ)':`tidak dihitung (L/tinggi = ${f(r.slenderness,3)} < 10)`):`${f(r.deltaMax_mm,4)} mm`}`,'class="diagram-small"')).join('')}`,
    `Perbandingan momen inersia dan lendutan untuk orientasi A, B dan bujur sangkar berluas sama.`,330)+
    `<p class="figure-caption">Ketiga penampang mempunyai luas (dan massa per panjang) yang sama. δ ∝ 1/I pada beban, bentang dan E yang sama: batang terpanjang adalah yang paling kaku.</p>`;
}
