import {beamAt} from './bending-model.js';
const f=(n,d=5)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
function arrow(x,y,dx,dy,color='#c85d35',width=3){
  const angle=Math.atan2(dy,dx)*180/Math.PI,len=Math.hypot(dx,dy);
  return `<g transform="translate(${x} ${y}) rotate(${angle})" fill="none" stroke="${color}" stroke-width="${width}"><path d="M0 0H${len}m-9-5 9 5-9 5"/></g>`;
}
const maxDrawn=60;
export const X0=80,X1=510;

// Drawn midspan deflection in px for a magnification; capped so the sketch stays inside the frame.
export function drawnDeflection(e,scale){
  if(e.status!=='valid')return 0;
  return Math.min(maxDrawn,e.result.deltaMax_mm/e.data.L_mm*(X1-X0)*scale);
}

export function loadedBeam(e,scale=500){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,udl=d.load==='udl',y=135,valid=e.status==='valid';
  const drawn=drawnDeflection(e,scale),capped=valid&&r.deltaMax_mm/d.L_mm*(X1-X0)*scale>maxDrawn;
  const I=r.I_mm4,k=valid&&r.deltaMax_mm>0?drawn/r.deltaMax_mm:0;
  const pts=Array.from({length:41},(_,i)=>{const x=d.L_mm*i/40;return `${X0+(X1-X0)*i/40} ${y+beamAt(d,I,x).v*k}`;}).join(' ');
  const load=udl?(d.w_N_per_mm>0?Array.from({length:11},(_,i)=>arrow(X0+(X1-X0)*i/10,y-55,0,47,'#c85d35',2)).join('')+`<path d="M${X0} ${y-55}H${X1}" stroke="#c85d35" stroke-width="2"/>`:'')
    :(d.P_N>0?arrow((X0+X1)/2,y-75,0,67):'');
  return svg(`<path d="M${X0} ${y}H${X1}" stroke="#a9b99d" stroke-width="12" opacity="${valid?.45:1}"/>
    ${valid?`<polyline points="${pts}" fill="none" stroke="#405d4c" stroke-width="7" stroke-linejoin="round"/>`:''}
    <path d="m${X0} ${y+8}-17 29h34Z" fill="#789573"/><circle cx="${X1}" cy="${y+21}" r="13" fill="#b7c8aa" stroke="#58734f"/><path d="M${X0-22} ${y+43}h44m${X1-X0-22} 0h44" stroke="#789573"/>
    ${text((X0+X1)/2,y-(udl?66:84),udl?`w = ${f(d.w_N_per_mm)} kN/m (total ${f(r.total_N/1000)} kN)`:`P = ${f(d.P_N/1000)} kN`,'text-anchor="middle"')}
    ${r.R_N>0?arrow(X0,y+105,0,-50,'#405d4c')+arrow(X1,y+105,0,-50,'#405d4c'):''}
    ${text(X0,y+128,`Rᴀ = ${f(r.R_N/1000)} kN`,'text-anchor="middle"')}${text(X1,y+128,`Rʙ = ${f(r.R_N/1000)} kN`,'text-anchor="middle"')}
    <path d="M${X0} ${y+150}H${X1}M${X0} ${y+144}v12M${X1} ${y+144}v12" stroke="#93a487"/>${text((X0+X1)/2,y+175,`L = ${f(d.L_mm)} mm`,'text-anchor="middle"')}
    ${valid?text((X0+X1)/2,y+drawn+38,`δmax = ${f(r.deltaMax_mm,4)} mm`,'text-anchor="middle" class="diagram-small"'):text((X0+X1)/2,y+40,'Lendutan tidak dihitung','text-anchor="middle" class="diagram-small"')}`,
    valid?`Balok sendi–rol dengan ${udl?'beban merata penuh':'beban titik di tengah'}; reaksi masing-masing ${f(r.R_N)} newton; lendutan tengah ${f(r.deltaMax_mm,4)} milimeter, digambar diperbesar ${scale} kali.`:'Balok sendi–rol; lendutan di luar domain model sehingga tidak digambar.',330)+
    `<p class="figure-caption">Pita pucat: sumbu balok sebelum dibebani. Hijau tua: kurva lendutan dari rumus aktif, diperbesar ${scale}×${capped?' dan dibatasi ruang gambar':''}. Lendutan terbesar di tengah karena pembebanan dan tumpuan simetris. Berat sendiri tidak dihitung.</p>`;
}

export function sectionStress(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,ratio=d.b_mm/d.h_mm;
  // Keep the drawn proportion b:h inside a 150×170 box (a minimum width keeps very narrow sections visible).
  const W=ratio>150/170?150:Math.max(24,170*ratio),Hd=ratio>150/170?150/ratio:170;
  const cx=130,cy=170,top=cy-Hd/2,bot=cy+Hd/2,gx=350,sy=r.sigmaMax_MPa>0,s=sy?110:0;
  return svg(`${text(cx,26,'Penampang','text-anchor="middle"')}${text(gx,26,'Tegangan lentur σ(y)','text-anchor="middle"')}
    <rect x="${cx-W/2}" y="${top}" width="${W}" height="${Hd}" fill="#99ae8d" stroke="#405d4c" stroke-width="2"/>
    <path d="M${cx-W/2-10} ${cy}H${gx}" stroke="#c85d35" stroke-dasharray="6 4"/>
    ${text(cx,bot+28,`b = ${f(d.b_mm)} mm`,'text-anchor="middle"')}${text(0,0,`h = ${f(d.h_mm)} mm`,`text-anchor="middle" class="diagram-small" transform="translate(${cx-W/2-14} ${cy}) rotate(-90)"`)}
    <path d="M${gx} ${top}V${bot}" stroke="#879b7c"/>
    ${sy?`<path d="M${gx} ${top}H${gx-s}L${gx+s} ${bot}H${gx}Z" fill="#dce8d1" stroke="#405d4c" stroke-width="2"/>`:`<path d="M${gx} ${top}V${bot}" stroke="#405d4c" stroke-width="3"/>`}
    ${text(gx-8,top-10,`tekan ${f(r.sigmaTop_MPa)} MPa`,'text-anchor="middle" class="diagram-small"')}${text(gx+8,bot+24,`tarik +${f(r.sigmaBottom_MPa)} MPa`,'text-anchor="middle" class="diagram-small"')}
    ${text(gx+16,cy-8,'σ = 0','class="diagram-small"')}${text(gx+16,cy+14,'sumbu netral','class="diagram-small"')}`,
    `Penampang persegi panjang lebar ${f(d.b_mm)} mm dan tinggi ${f(d.h_mm)} mm. Tegangan lentur linier: tekan ${f(r.sigmaMax_MPa)} MPa di serat atas, tarik ${f(r.sigmaMax_MPa)} MPa di serat bawah, nol di sumbu netral, pada lokasi momen maksimum.`,320)+
    `<p class="figure-caption">σ(y) = My/I di lokasi momen maksimum (tengah bentang). Momen positif (sagging) menekan serat atas dan menarik serat bawah. Proporsi penampang mengikuti b:h; tinggi h adalah dimensi searah beban.</p>`;
}

export function shearMomentCharts(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,udl=d.load==='udl',X=x=>X0+x/d.L_mm*(X1-X0),mid=X(d.L_mm/2);
  const y1=120,vs=r.Vmax_N>0?55/r.Vmax_N:0,y2=335,ms=r.Mmax_Nmm>0?80/r.Mmax_Nmm:0;
  const V=udl?`M${X0} ${y1}V${y1-55*(r.Vmax_N>0)}L${X1} ${y1+55*(r.Vmax_N>0)}V${y1}`:`M${X0} ${y1}V${y1-r.Vmax_N*vs}H${mid}V${y1+r.Vmax_N*vs}H${X1}V${y1}`;
  const Mpts=udl?Array.from({length:41},(_,i)=>{const x=d.L_mm*i/40;return `${X(x)} ${y2-beamAt(d,r.I_mm4,x).M*ms}`;}).join(' '):`${X0} ${y2} ${mid} ${y2-r.Mmax_Nmm*ms} ${X1} ${y2}`;
  return svg(`${text(X0,30,'Gaya geser V (kN)')}<path d="M${X0} ${y1}H${X1}" stroke="#a6b59a"/><path d="${V}" fill="none" stroke="#c85d35" stroke-width="3"/>
    ${text(X0+8,y1-62,`+${f(r.Vmax_N/1000)}`)}${text(X1-8,y1+78,`−${f(r.Vmax_N/1000)}`,'text-anchor="end"')}
    ${text(X0,218,'Momen lentur M (kN·m)')}<path d="M${X0} ${y2}H${X1}" stroke="#a6b59a"/><polyline points="${Mpts}" fill="none" stroke="#405d4c" stroke-width="3"/>
    ${text(mid+10,y2-90,`Mmax = ${f(r.Mmax_Nmm/1e6)} kN·m`)}
    <path d="M${mid} 60V${y2}" stroke="#b99c63" stroke-dasharray="4 5"/>${text(X0,y2+28,'0')}${text(X1,y2+28,`L = ${f(d.L_mm)} mm`,'text-anchor="end"')}`,
    `Diagram gaya geser dan momen lentur. V maksimum ${f(r.Vmax_N)} newton di tumpuan; M maksimum ${f(r.Mmax_Nmm)} newton milimeter di tengah bentang.`,375)+
    `<p class="figure-caption">${udl?'Beban merata: V turun linier dan nol di tengah; M berbentuk parabola dengan puncak wL²/8.':'Beban titik: V konstan ±P/2 dengan loncatan sebesar P di tengah; M segitiga dengan puncak PL/4.'} Momen maksimum terjadi di lokasi V = 0 atau V berganti tanda. V positif digambar di atas garis nol; M positif sagging.</p>`;
}
