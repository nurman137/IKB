const f=(n,d=5)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
const svg=(body,label,h=330)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';
const maxVisualTwist=75*Math.PI/180;

// Visual twist angle (rad) for a given magnification; capped so the drawing stays readable.
export function visualTwist(e,scale){
  if(e.status!=='valid')return 0;
  return Math.min(maxVisualTwist,e.result.theta_rad*scale);
}

export function shaftDiagram(e,scale=20){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,valid=e.status==='valid',tw=visualTwist(e,scale),capped=valid&&r.theta_rad*scale>maxVisualTwist;
  const x0=95,x1=430,cy=150,R=38,ri=R*d.di_mm/d.d_mm,ex=515;
  // A line drawn along the front generator stays straight but tilts: its far end moves by R·sin(θ) in side view (γL = rθ).
  const endY=cy-R*Math.sin(tw);
  const hollow=d.di_mm>0;
  const torque=r.T_Nmm>0?`<path d="M${x1+14} ${cy+R+14}c26-14 26-${2*R+14} 0-${2*R+28}" fill="none" stroke="#c85d35" stroke-width="3"/><path d="m${x1+14} ${cy-R-14}-3 13m3-13 12 5" stroke="#c85d35" stroke-width="3" fill="none"/>`:'';
  const radial=(a,style)=>`<path d="M${ex} ${cy}L${ex+R*Math.sin(a)} ${cy-R*Math.cos(a)}" ${style}/>`;
  return svg(`<path d="M${x0-22} 82V218" stroke="#58734f" stroke-width="3"/>${[0,1,2,3,4,5,6].map(i=>`<path d="M${x0-22} ${92+i*19}l-14 14" stroke="#789573" stroke-width="1.5"/>`).join('')}
    <rect x="${x0-20}" y="${cy-R}" width="${x1-x0+20}" height="${2*R}" fill="#99ae8d" stroke="#405d4c" stroke-width="2"/>
    ${hollow?`<path d="M${x0-20} ${cy-ri}H${x1}M${x0-20} ${cy+ri}H${x1}" stroke="#405d4c" stroke-dasharray="6 5"/>`:''}
    <path d="M${x0-20} ${cy}H${x1}" stroke="#eef3e8" stroke-width="2" stroke-dasharray="7 5"/>
    ${valid?`<path d="M${x0-20} ${cy}L${x1} ${endY}" stroke="#c85d35" stroke-width="3"/>`:''}
    ${torque}
    <circle cx="${ex}" cy="${cy}" r="${R}" fill="#99ae8d" stroke="#405d4c" stroke-width="2"/>${hollow?`<circle cx="${ex}" cy="${cy}" r="${ri}" fill="#f7f8f6" stroke="#405d4c"/>`:''}
    ${radial(0,'stroke="#eef3e8" stroke-width="2" stroke-dasharray="5 4"')}${valid?radial(tw,'stroke="#c85d35" stroke-width="3"'):''}
    ${text(ex,cy+R+30,'Ujung bebas','text-anchor="middle" class="diagram-small"')}
    ${text(x0-28,248,'Ujung tetap','class="diagram-small"')}
    <path d="M${x0-20} 268H${x1}M${x0-20} 262v12M${x1} 262v12" stroke="#93a487"/>${text((x0+x1)/2-10,292,`L = ${f(d.L_mm)} mm`,'text-anchor="middle"')}
    ${text(x0-20,52,`T = ${f(r.T_Nm)} N·m · d = ${f(d.d_mm)} mm${hollow?` · dᵢ = ${f(d.di_mm)} mm`:''}`)}
    ${text(ex,72,valid?`θ = ${f(r.theta_deg,4)}°`:'θ tidak dihitung','text-anchor="middle"')}`,
    valid?`Poros ${hollow?'berongga':'pejal'} dijepit di kiri dan diberi torsi ${f(r.T_Nm)} newton meter di kanan. Sudut puntir ujung ${f(r.theta_deg,4)} derajat, digambar diperbesar ${scale} kali.`:'Di luar domain elastis; bentuk terpuntir disembunyikan.')+
    `<p class="figure-caption">Putih putus-putus: garis acuan sebelum dibebani. Oranye: garis yang sama setelah terpuntir, diperbesar ${scale}×${capped?' dan dibatasi 75° agar tetap terbaca':''}. Garis sejajar sumbu menjadi miring dengan sudut γ, sementara penampang ujung berputar θ (γL = cθ). Skema tidak berskala.</p>`;
}

export function shearDistribution(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,c=d.d_mm/2,ri=d.di_mm/2;
  const X=n=>80+n/c*400,top=Math.max(r.tauMax_MPa,1e-12),Y=n=>250-n/top*170;
  const hollow=ri>0,limit=r.tauYieldShear_MPa;
  const showLimit=limit<=top*1.15;
  return svg(`${text(80,32,'Tegangan geser τ (MPa)')}<path d="M80 60V250H500" fill="none" stroke="#879b7c"/>
    ${hollow?`<rect x="80" y="60" width="${X(ri)-80}" height="190" fill="#f1f3ec"/>${text((80+X(ri))/2,236,'rongga','text-anchor="middle" class="diagram-small"')}<path d="M80 250L${X(ri)} ${Y(r.tauInner_MPa)}" stroke="#a6b59a" stroke-dasharray="6 5" stroke-width="2"/>`:''}
    <path d="M${X(ri)} 250V${Y(r.tauInner_MPa)}L${X(c)} ${Y(r.tauMax_MPa)}V250Z" fill="#dce8d1"/>
    <path d="M${X(ri)} ${Y(r.tauInner_MPa)}L${X(c)} ${Y(r.tauMax_MPa)}" stroke="#405d4c" stroke-width="3"/>
    <circle cx="${X(c)}" cy="${Y(r.tauMax_MPa)}" r="5" fill="#405d4c"/>${text(X(c)-8,Y(r.tauMax_MPa)-12,`τmax = ${f(r.tauMax_MPa)} MPa`,'text-anchor="end"')}
    ${hollow?`<circle cx="${X(ri)}" cy="${Y(r.tauInner_MPa)}" r="5" fill="#405d4c"/>${text(X(ri)+10,Y(r.tauInner_MPa)+24,`τ(rᵢ) = ${f(r.tauInner_MPa)} MPa`)}`:''}
    ${showLimit?`<path d="M80 ${Y(limit)}H500" stroke="#c85d35" stroke-dasharray="7 4"/>${text(500,Y(limit)-8,`Sᵧ/√3 = ${f(limit)} MPa`,'text-anchor="end" class="diagram-small"')}`:''}
    ${text(80,275,'0','text-anchor="middle"')}${hollow?text(X(ri),275,'rᵢ','text-anchor="middle"'):''}${text(X(c),275,`c = ${f(c)} mm`,'text-anchor="middle"')}
    ${text(290,306,'Jarak dari sumbu r (mm)','text-anchor="middle"')}`,
    `Distribusi tegangan geser linier terhadap jarak dari sumbu: nol di sumbu, ${hollow?`${f(r.tauInner_MPa)} MPa di dinding dalam, `:''}${f(r.tauMax_MPa)} MPa di permukaan luar.`,320)+
    `<p class="figure-caption">τ(r) = Tr/J naik linier dari sumbu. ${hollow?'Bagian abu-abu tidak bermaterial; garis putus-putus hanya menunjukkan kelanjutan hubungan linier. ':'Material dekat sumbu menerima tegangan kecil; itulah alasan poros berongga efisien. '}${showLimit?'Garis oranye: batas domain elastis murni geser dari Sᵧ latihan, bukan kriteria aman.':''}</p>`;
}
