const f=(n,d=5)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
const label=(x,y,text,extra='')=>`<text x="${x}" y="${y}" ${extra}>${text}</text>`;

export function axialDiagram(evaluation,scale=100){
  const {status,result:r,data}=evaluation;
  if(status==='invalid')return '<div class="visual-empty">Perbaiki data untuk menampilkan diagram dan deformasi.</div>';
  const extension=status==='valid'?r.epsilon*270*scale:0;
  const maxExtension=120,shown=Math.min(extension,maxExtension);
  const x1=110,x2=380,tip=x2+shown,hasLoad=data.F_N>0;
  const arrows=hasLoad?`<path d="M87 146H40m0 0 13-8m-13 8 13 8M${tip+15} 146h42m0 0-13-8m13 8-13 8" fill="none" stroke="#c85d35" stroke-width="3"/>`:'';
  return `<svg viewBox="0 0 590 310" class="axial-diagram" role="img" aria-label="Batang tarik dengan gaya ${f(data.F_N)} N, diameter ${f(data.d_mm)} mm dan panjang awal ${f(data.L_mm)} mm. ${status==='outside'?'Deformasi tidak dihitung.':`Pertambahan panjang ${f(r.delta_mm)} mm; gambar diperbesar ${scale} kali.`}">
    <g fill="none" stroke="#82957b" stroke-width="1.5"><path d="M110 78H380M110 72v12m270-12v12"/></g>
    ${label(245,62,`L₀ = ${f(data.L_mm)} mm`,'text-anchor="middle"')}
    ${status==='valid'?`<rect x="110" y="134" width="${270+shown}" height="24" rx="4" fill="#90a485" stroke="#405d4c" stroke-width="2"/>`:''}
    <rect x="110" y="134" width="270" height="24" fill="none" stroke="#5e7658" stroke-width="1.5" stroke-dasharray="6 5"/>
    <path d="M110 115v62M${tip} 115v62" stroke="#405d4c" stroke-width="5"/>
    ${arrows}${label(44,119,`F = ${f(data.F_N/1000)} kN`)}
    ${label(245,202,`d = ${f(data.d_mm)} mm`,'text-anchor="middle"')}
    ${label(245,233,status==='outside'?'Deformasi tidak dihitung di luar domain elastis':`δ = ${f(r.delta_mm)} mm`,'text-anchor="middle"')}
    ${label(245,273,'Garis putus-putus: bentuk awal · hijau: bentuk terdeformasi','text-anchor="middle" class="diagram-small"')}
  </svg><p class="figure-caption">Skema panjang dan diameter tidak berskala. ${status==='valid'?`Deformasi aksial diperbesar ${scale}×${extension>maxExtension?' dan dibatasi pada ruang gambar; baca δ numerik untuk nilai sebenarnya':''}.`:'Bentuk terdeformasi disembunyikan.'} Kontraksi lateral belum dimodelkan.</p>`;
}

export function elasticGraph(evaluation){
  const {status,data,result:r}=evaluation;
  if(status==='invalid')return '<div class="visual-empty">Grafik diperbarui setelah data valid.</div>';
  const upperSigma=Math.min(data.Sy_MPa,data.E_MPa*.01);
  if(!Number.isFinite(upperSigma)||upperSigma<=0)return '<p>Skala grafik tidak dapat ditampilkan.</p>';
  const upperEpsilonPercent=upperSigma/data.E_MPa*100;
  // Keep the same axes for the common E=70/200 GPa comparison so stiffness changes are visible.
  const axisEpsilonPercent=Math.max(.5,Math.ceil(upperEpsilonPercent*2)/2);
  const axisSigma=Math.max(250,upperSigma);
  const x0=76,y0=236,w=410,h=170;
  const xEnd=x0+(upperEpsilonPercent/axisEpsilonPercent)*w,yEnd=y0-(upperSigma/axisSigma)*h;
  const dot=status==='valid'?`<circle cx="${x0+(r.epsilon_percent/axisEpsilonPercent)*w}" cy="${y0-(r.sigma_MPa/axisSigma)*h}" r="6" fill="#c85d35" stroke="white" stroke-width="2"/>`:'';
  const ticks=[0,.25,.5,.75,1].map(t=>`<path d="M${x0} ${y0-t*h}h${w}" stroke="#e0e7da"/>${label(x0-9,y0-t*h+4,f(axisSigma*t,3),'text-anchor="end"')}${label(x0+t*w,y0+22,f(axisEpsilonPercent*t,3),'text-anchor="middle"')}`).join('');
  return `<svg viewBox="0 0 590 310" class="elastic-graph" role="img" aria-label="Hubungan elastis tegangan–regangan, modulus E ${f(data.E_MPa/1000)} GPa. Sumbu horizontal regangan persen, vertikal tegangan MPa. ${status==='valid'?`Titik aktif ${f(r.epsilon_percent)} persen, ${f(r.sigma_MPa)} MPa.`:'Titik aktif tidak ditampilkan karena di luar domain model.'}"><g>${ticks}<path d="M76 56v180h425" fill="none" stroke="#7d9173"/><path d="M76 236 ${xEnd} ${yEnd}" fill="none" stroke="#405d4c" stroke-width="3"/>${dot}${label(76,29,'Tegangan σ (MPa)')}${label(280,293,'Regangan ε (%)','text-anchor="middle"')}${label(xEnd,yEnd-16,'Batas domain model',`text-anchor="${xEnd>390?'end':'start'}" class="diagram-small"`)}</g></svg><p class="figure-caption">Garis: hubungan model σ = Eε. Titik oranye: kondisi aktif. Ujung garis dibatasi oleh Sᵧ atau ε = 1%; bukan kurva hasil uji tarik. Sumbu tetap untuk perbandingan E = 70 dan 200 GPa dengan Sᵧ = 250 MPa; skala dapat meluas untuk input lain.</p>`;
}
