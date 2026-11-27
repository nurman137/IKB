const f=(n,d=5)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
function arrow(x,y,dx,dy,color='#c85d35'){
  const angle=Math.atan2(dy,dx)*180/Math.PI,len=Math.hypot(dx,dy);
  return `<g transform="translate(${x} ${y}) rotate(${angle})" fill="none" stroke="${color}" stroke-width="3"><path d="M0 0H${len}m-10-6 10 6-10 6"/></g>`;
}
const svg=(body,label,h=310)=>`<svg class="foundation-svg" viewBox="0 0 590 ${h}" role="img" aria-label="${label}">${body}</svg>`;
const empty='<p class="visual-empty">Perbaiki input untuk menampilkan gambar dan hasil yang baru.</p>';

export function beamDiagram(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,X=n=>80+n/d.L_mm*430,load=X(d.a_mm),cut=X(d.x_mm);
  return svg(`<path d="M80 145H510" stroke="#6b866a" stroke-width="15"/><path d="m80 155-17 29h34Z" fill="#789573"/><circle cx="510" cy="173" r="13" fill="#b7c8aa" stroke="#58734f"/><path d="M58 190h44m387 0h42" stroke="#789573"/>
    ${d.P_N>0?arrow(load,65,0,65):''}${text(load,48,`P = ${f(d.P_N/1000)} kN`,'text-anchor="middle"')}
    ${r.RA_N>0?arrow(80,260,0,-56,'#405d4c'):''}${r.RB_N>0?arrow(510,260,0,-56,'#405d4c'):''}
    ${text(80,283,`Rᴀ = ${f(r.RA_N/1000)} kN`,'text-anchor="middle"')}${text(510,283,`Rʙ = ${f(r.RB_N/1000)} kN`,'text-anchor="middle"')}
    <path d="M80 218H510M80 212v12m430-12v12" stroke="#93a487"/>${text(295,240,`L = ${f(d.L_mm)} mm`,'text-anchor="middle"')}
    <path d="M${cut} 112v87" stroke="#b37a42" stroke-width="2" stroke-dasharray="5 4"/>${text(cut,104,`x = ${f(d.x_mm)} mm`,'text-anchor="middle"')}
    ${text(295,312,`Beban luar: P · Reaksi: Rᴀ, Rʙ · a = ${f(d.a_mm)} mm`,'text-anchor="middle"')}`,`Diagram benda bebas: P ${f(d.P_N)} N di a ${f(d.a_mm)} mm, RA ${f(r.RA_N)} N dan RB ${f(r.RB_N)} N. Potongan x ${f(d.x_mm)} mm.`,330);
}
export function beamCharts(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,X=n=>80+n/d.L_mm*430,a=X(d.a_mm),cut=X(d.x_mm);
  const shearScale=55/Math.max(d.P_N,1),y1=120,rY=y1-r.RA_N*shearScale,nY=y1+(d.P_N-r.RA_N)*shearScale;
  const y2=300,peak=r.M_at_load_Nmm?y2-75:y2;
  const edge=d.a_mm===0||d.a_mm===d.L_mm;
  return svg(`${text(80,30,'Gaya geser V (kN)')}<path d="M80 ${y1}H510" stroke="#a6b59a"/>
    <path d="${edge?`M80 ${y1}H510`:`M80 ${y1}V${rY}H${a}V${nY}H510V${y1}`}" fill="none" stroke="#c85d35" stroke-width="3"/>
    ${text(80,62,edge?'Beban tepat di tumpuan: V = 0 pada bentang':`Kiri beban: +${f(r.RA_N/1000)} kN`)}${edge?'':text(510,190,`Kanan beban: ${f((r.RA_N-d.P_N)/1000)} kN`,'text-anchor="end"')}
    ${text(80,226,'Momen lentur M (kN·m)')}<path d="M80 ${y2}H510" stroke="#a6b59a"/><path d="M80 ${y2} ${a} ${peak} 510 ${y2}" fill="none" stroke="#405d4c" stroke-width="3"/>
    ${text(510,250,`M maksimum = ${f(r.M_at_load_Nmm/1e6)} kN·m`,'text-anchor="end"')}
    <path d="M${cut} 65v110m0 85v60" stroke="#b99c63" stroke-dasharray="4 5"/>
    ${text(80,345,'0')}${text(510,345,`L = ${f(d.L_mm)} mm`,'text-anchor="end"')}`,`Diagram gaya geser dan momen. Potongan x ${f(d.x_mm)} mm: V kiri ${f(r.V_left_N)} N, V kanan ${f(r.V_right_N)} N, M ${f(r.M_at_x_Nmm)} N mm.`,365)+`<p class="figure-caption">V positif digambar di atas garis nol; M positif adalah sagging. V memiliki loncatan pada gaya titik. Kurva M kontinu; nilai sisi kiri/kanan V ditampilkan terpisah pada potongan.</p>`;
}

export function hookeDiagram(e,scale=500){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,valid=e.status==='valid';
  const extension=valid?Math.min(100,r.epsilon*270*scale):0;
  const height=valid?Math.max(12,44*(1+r.epsilon_lateral*scale)):44,top=150-height/2;
  return svg(`${text(280,55,`L₀ = ${f(d.L_mm)} mm`,'text-anchor="middle"')}
    ${valid?`<rect x="110" y="${top}" width="${270+extension}" height="${height}" fill="#91a483" stroke="#405d4c" stroke-width="2"/>`:''}
    <rect x="110" y="128" width="270" height="44" fill="none" stroke="#5e7658" stroke-width="1.5" stroke-dasharray="6 5"/>
    ${d.F_N>0?arrow(98,150,-55,0)+arrow(395+extension,150,55,0):''}
    ${text(280,220,valid?`δ = ${f(r.delta_mm)} mm · Δd = ${f(r.delta_d_mm)} mm`:'Deformasi tidak dihitung','text-anchor="middle"')}
    ${text(280,255,`F = ${f(d.F_N/1000)} kN · d = ${f(d.d_mm)} mm · ν = ${f(d.nu)}`,'text-anchor="middle"')}`,valid?`Deformasi aksial dan lateral diperbesar ${scale} kali; delta panjang ${f(r.delta_mm)} mm, perubahan diameter ${f(r.delta_d_mm)} mm.`:'Di luar domain elastis; bentuk terdeformasi disembunyikan.')+`<p class="figure-caption">Garis putus-putus: bentuk awal. Deformasi aksial/lateral diperbesar ${scale}× dan dibatasi ruang gambar; baca angka untuk nilai aktual. Skema bukan ukuran komponen sesungguhnya.</p>`;
}
export function energyGraph(e){
  if(e.status==='invalid')return empty;
  if(e.status!=='valid')return '<p class="visual-empty">Grafik gaya–deformasi dan energi tidak dihitung di luar domain elastis.</p>';
  const r=e.result,d=e.data,compare=e.comparison.result?.delta_mm;
  const maxDelta=Math.max(r.delta_mm,compare??0,.01)*1.1,maxF=Math.max(d.F_N,1000)*1.1;
  const x=n=>78+n/maxDelta*430,y=n=>240-n/maxF*170,xx=x(r.delta_mm),yy=y(d.F_N);
  return svg(`${text(78,30,'Gaya F (kN)')}<path d="M78 55v185h440" fill="none" stroke="#879b7c"/>
    <path d="M78 240 ${xx} ${yy} ${xx} 240Z" fill="#dce8d1"/><path d="M78 240 ${xx} ${yy}" stroke="#405d4c" stroke-width="3"/>
    ${compare===null||compare===undefined?'':`<path d="M78 240 ${x(compare)} ${yy}" stroke="#bd7649" stroke-dasharray="7 4" stroke-width="2"/>`}
    <circle cx="${xx}" cy="${yy}" r="5" fill="#405d4c"/>${text(85,75,`U = ${f(r.U_J)} J`)}${text(505,270,`${f(maxDelta)} mm`,'text-anchor="end"')}${text(70,60,`${f(maxF/1000)}`,'text-anchor="end"')}${text(280,300,'Pertambahan panjang δ (mm)','text-anchor="middle"')}`,`Grafik gaya versus pertambahan panjang; luas segitiga di bawah garis aktif adalah energi ${f(r.U_J)} joule.`,320)+`<p class="figure-caption">Hijau: E aktif. Garis putus-putus oranye: E = 70 GPa jika masih dalam domain elastis. Luas segitiga aktif = ½Fδ; N·mm dibagi 1.000 menjadi joule. Beban nol memberi energi nol.</p>`;
}

export function pinDiagram(e){
  if(e.status==='invalid')return empty;
  const d=e.data,r=e.result,two=d.n_planes===2;
  const plates=two?'<rect x="100" y="85" width="230" height="30" fill="#bccbac"/><rect x="270" y="115" width="230" height="50" fill="#8fa57e"/><rect x="100" y="165" width="230" height="30" fill="#bccbac"/>':'<rect x="100" y="100" width="230" height="35" fill="#bccbac"/><rect x="270" y="135" width="230" height="35" fill="#8fa57e"/>';
  const shearLines=two?[115,165]:[135];
  return svg(`${text(295,30,two?'Potongan sambungan clevis: dua bidang geser':'Potongan sambungan lap: satu bidang geser','text-anchor="middle"')}${plates}<rect x="282" y="65" width="26" height="150" rx="6" fill="#658173" stroke="#405d4c"/>
    ${shearLines.map(y=>`<path d="M260 ${y}h70" stroke="#c85d35" stroke-width="3" stroke-dasharray="5 3"/>`).join('')}
    ${d.F_N>0?(two?arrow(100,100,-55,0)+arrow(100,180,-55,0):arrow(100,117,-55,0))+arrow(500,two?140:153,55,0):''}
    ${text(45,65,two?`F/2 = ${f(d.F_N/2000)} kN`:`F = ${f(d.F_N/1000)} kN`)}${text(545,235,`F = ${f(d.F_N/1000)} kN`,'text-anchor="end"')}
    ${text(295,260,`d = ${f(d.d_mm)} mm · ${d.n_planes} bidang · F/bidang = ${f(r.force_per_plane_N/1000)} kN`,'text-anchor="middle"')}
    ${text(295,294,two?`t tengah = ${f(d.t_center_mm)} mm · tiap t luar = ${f(d.t_each_outer_mm)} mm`:`Kedua pelat diasumsikan sama tebal: t = ${f(d.t_center_mm)} mm`,'text-anchor="middle"')}`,`Potongan pin dengan ${d.n_planes} bidang geser. Pelat tengah menerima F; ${two?'masing-masing pelat luar menerima F/2.':'kedua pelat menerima besar gaya F.'}`,320)+`<p class="figure-caption">Oranye putus-putus menunjukkan bidang geser pada pin. Skema tidak berskala. ${two?'Distribusi dua bidang diasumsikan simetris.':'Eksentrisitas sambungan lap dan lentur pin diabaikan pada model rata-rata ini.'}</p>`;
}

export const loadKinds={
  tarik:['Tarik','Gaya aksial berlawanan arah cenderung memperpanjang batang.'],
  tekan:['Tekan','Gaya aksial menuju batang cenderung memperpendeknya; stabilitas tekuk memerlukan pemeriksaan tersendiri.'],
  geser:['Geser','Gaya sejajar bidang cenderung menggeser lapisan. Contoh ini menunjukkan gaya pada empat sisi elemen untuk menjaga keseimbangan.'],
  lentur:['Lentur','Beban melintang membangkitkan gaya geser dan momen lentur di dalam balok.'],
  torsi:['Torsi','Pasangan momen puntir yang berlawanan arah membebani poros.'],
};
export function loadGallery(kind){
  let body='';
  if(kind==='tarik'||kind==='tekan')body='<rect x="160" y="120" width="270" height="35" fill="#99ae8d"/>'+ (kind==='tarik'?arrow(150,137,-70,0)+arrow(440,137,70,0):arrow(80,137,70,0)+arrow(510,137,-70,0));
  if(kind==='geser')body='<rect x="245" y="90" width="100" height="100" fill="#c8d7bd"/>'+arrow(252,73,80,0)+arrow(332,207,-80,0)+arrow(228,98,0,80)+arrow(362,178,0,-80);
  if(kind==='lentur')body='<path d="M120 140H470" stroke="#789573" stroke-width="16"/><path d="m130 150-18 30h36Z" fill="#789573"/><circle cx="460" cy="170" r="13" fill="#b7c8aa"/>'+arrow(295,50,0,70)+arrow(130,240,0,-45,'#405d4c')+arrow(460,240,0,-45,'#405d4c');
  if(kind==='torsi')body='<rect x="150" y="110" width="290" height="60" rx="20" fill="#99ae8d"/><path d="M122 96c-50 40-50 70 0 100m0 0-20-2m20 2-1-20M468 196c50-40 50-70 0-100m0 0 20 2m-20-2 1 20" fill="none" stroke="#c85d35" stroke-width="3"/>';
  return svg(body,`Ilustrasi konseptual jenis pembebanan ${loadKinds[kind][0]}`,270);
}
