import {torsionFields,inactiveFields} from './torsion-model.js';
import {readNumber} from './model.js';
const f=n=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:7}).format(n);
const eq=s=>`<div class="equation">${s}</div>`;
const canonicalUnit=k=>k==='T_Nmm'?'N·mm':k==='P_W'?'W':k==='n_rpm'?'rpm':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':'';

export const torsionContent={
  title:'Torsi & Poros',headline:'Putar poros. Baca puntirannya.',names:['Poros transmisi motor ke mesin','Segmen poros propeler'],
  descriptions:['Poros meneruskan torsi dari motor listrik ke mesin produksi. Masukkan torsi langsung atau daya dan putaran motor, lalu amati tegangan geser dan sudut puntir.','Segmen poros propeler diidealkan sebagai poros bulat seragam di antara dua penampang tinjauan. Bandingkan poros pejal dan berongga tanpa menganggap ini desain poros kapal lengkap.'],
  assumption:'Poros bulat seragam, torsi statis murni, elastis linier isotropik. Tanpa alur pasak, konsentrasi tegangan, lentur, gaya aksial propeler atau beban dinamis. G dihitung dari E dan ν.',
  prediction:'Panjang poros L digandakan pada T, d, dᵢ dan material yang sama. Apa yang terjadi?',
  choices:[['theta','τmax tetap; sudut puntir θ menjadi dua kali lipat'],['both','τmax dan θ sama-sama menjadi dua kali lipat'],['tau','τmax menjadi dua kali lipat; θ tetap']],correct:'theta',
  explanation:'τmax = Tc/J tidak memuat L, sehingga tegangan geser tetap. θ = TL/(GJ) sebanding dengan L: poros dua kali lebih panjang terpuntir dua kali lebih besar. Regangan geser γ = cθ/L juga tetap.',
  answerLabels:['Tegangan geser maksimum τmax (MPa)','Sudut puntir θ (derajat)'],
  reflection:'Mengapa memperpanjang poros memperbesar puntiran, tetapi tidak memperbesar tegangan geser?',
  source:'https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf',sourceLabel:'David Roylance, Shear and Torsion, MIT OCW 3.11',
  limitation:'Rumus τ = Tr/J dan θ = TL/(GJ) hanya untuk penampang lingkaran pejal atau cincin konsentris dengan torsi dan penampang seragam sepanjang L. Penampang tak melingkar, alur pasak, bahu poros dan sambungan flens memerlukan faktor konsentrasi atau analisis lain. Deformasi disembunyikan bila √3·τmax ≥ Sᵧ latihan atau γ > 1%. Dinding sangat tipis dapat tertekuk sebelum luluh; tekuk, fatigue, getaran torsional dan putaran kritis belum dievaluasi. Bukan pemeriksaan aturan klasifikasi poros propeler.',
};

export function torsionSteps(e,raw,units){
  if(e.status==='invalid')return [];
  const d=e.data,r=e.result,power=d.mode==='power',hollow=d.di_mm>0,skip=new Set(inactiveFields(d.mode));
  const conversion=Object.entries(torsionFields).filter(([k])=>!skip.has(k)).map(([k,field])=>`${field.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${canonicalUnit(k)}`).join('<br>');
  const valid=e.status==='valid';
  return [
    ['Samakan satuan dan pilih sumber torsi',eq(conversion)+`<p>Hitungan inti memakai N, mm dan MPa (1 MPa = 1 N/mm²). Sumber torsi aktif: <strong>${power?'daya dan putaran':'torsi langsung'}</strong>. Hanya satu sumber T yang dipakai agar tidak ada dua nilai torsi yang saling bertentangan.</p>`],
    power?['Ubah daya dan putaran menjadi torsi',eq(`ω = 2πn/60 = 2π × ${f(d.n_rpm)}/60<br>ω = ${f(r.omega_rad_s)} rad/s<br>T = P/ω = ${f(d.P_W)}/${f(r.omega_rad_s)}<br>T = ${f(r.T_Nm)} N·m<br><strong>T = ${f(r.T_Nmm)} N·mm</strong>`)+'<p>Daya adalah torsi dikali kecepatan sudut. Pada daya yang sama, putaran yang lebih rendah menghasilkan torsi lebih besar; itulah sebabnya poros propeler yang lambat umumnya lebih besar. Konversi tidak terdefinisi pada n = 0.</p>']
      :['Tetapkan torsi yang bekerja',eq(`<strong>T = ${f(r.T_Nmm)} N·mm = ${f(r.T_Nm)} N·m</strong>`)+'<p>Torsi diberikan langsung dan dianggap sama di setiap penampang sepanjang L. Mode daya–putaran tidak aktif.</p>'],
    ['Hitung modulus geser',eq(`G = E/[2(1+ν)] = ${f(d.E_MPa)}/[2(1+${f(d.nu)})]<br><strong>G = ${f(r.G_MPa)} MPa</strong>`)+'<p>Puntiran adalah deformasi geser, sehingga kekakuannya ditentukan oleh G, bukan langsung oleh E. Hubungan ini berlaku untuk material isotropik.</p>'],
    ['Hitung momen inersia polar penampang',eq(`J = π(d⁴ − dᵢ⁴)/32<br>J = π(${f(d.d_mm)}⁴ − ${f(d.di_mm)}⁴)/32<br><strong>J = ${f(r.J_mm4)} mm⁴</strong><br>c = d/2 = ${f(d.d_mm/2)} mm · Zp = J/c = ${f(r.Zp_mm3)} mm³`)+`<p>J mengukur sebaran luas penampang terhadap sumbu putar. Karena memuat pangkat empat diameter, material yang jauh dari sumbu paling berpengaruh. ${hollow?'Rongga mengurangi J sedikit, tetapi mengurangi luas (dan massa) lebih banyak.':'Untuk poros pejal, dᵢ = 0 sehingga J = πd⁴/32.'}</p>`],
    ['Hitung tegangan geser',eq(`τmax = Tc/J = ${f(r.T_Nmm)} × ${f(d.d_mm/2)}/${f(r.J_mm4)}<br><strong>τmax = ${f(r.tauMax_MPa)} MPa</strong>${hollow?`<br>τ(rᵢ) = T(dᵢ/2)/J = <strong>${f(r.tauInner_MPa)} MPa</strong>`:''}`)+'<p>Tegangan geser naik linier dari nol di sumbu hingga maksimum di permukaan luar. Lokasi kritis untuk model ini adalah serat terluar, di seluruh panjang segmen seragam.</p>'],
    ['Hitung sudut puntir',valid?eq(`θ = TL/(GJ) = ${f(r.T_Nmm)} × ${f(d.L_mm)}/(${f(r.G_MPa)} × ${f(r.J_mm4)})<br>θ = ${f(r.theta_rad)} rad<br><strong>θ = ${f(r.theta_deg)}°</strong> · ${f(r.theta_deg_per_m)}°/m<br>γmax = τmax/G = cθ/L = ${f(r.gammaMax)}`)+'<p>Ubah radian ke derajat dengan mengalikan 180/π. θ bertambah sebanding dengan L dan T; berbanding terbalik dengan kekakuan puntir GJ.</p>':`<p class="outside-text">Sudut puntir tidak dihitung. ${e.reason}</p><p>Hubungan linier θ = TL/(GJ) tidak berlaku setelah material luluh.</p>`],
    ['Tafsirkan hasil dan batas kesimpulan',`<p>L × 2 → θ × 2 dengan τmax tetap. Poros pejal d × 2 → J × 16, sehingga τmax menjadi 1/8 dan θ menjadi 1/16. Pemeriksaan √3·τmax terhadap Sᵧ latihan (${f(r.tauYieldShear_MPa)} MPa sebagai batas geser) hanya menandai batas domain elastis model, bukan faktor keamanan atau pernyataan poros aman. Alur pasak, bahu poros, lentur akibat berat dan sabuk, gaya dorong propeler, fatigue dan getaran torsional belum dihitung.</p>`],
  ];
}
