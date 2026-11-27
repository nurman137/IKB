import {sectionFields,shapes,inactiveSectionFields,profilePresets,evaluateSection,sectionExercises,gradeSection,slendernessLimit} from './section-model.js';
import {fmt as f} from './lab-core.js';
import {readNumber} from './model.js';
import {sectionPair,stressComparison,stiffnessBars} from './section-visuals.js';
const eq=s=>`<div class="equation">${s}</div>`;
const unitOf=k=>k==='P_N'?'N':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':'';

function propertySteps(d,A,B){
  if(d.shape==='rect')return eq(`A = bh = ${f(d.b_mm)} × ${f(d.h_mm)} = ${f(A.A_mm2)} mm²<br>A: I = bh³/12 = ${f(d.b_mm)} × ${f(d.h_mm)}³/12 = <strong>${f(A.I_mm4)} mm⁴</strong><br>B: I = hb³/12 = ${f(d.h_mm)} × ${f(d.b_mm)}³/12 = <strong>${f(B.I_mm4)} mm⁴</strong>`)+`<p>Memutar penampang menukar dimensi yang searah beban. I sebanding dengan pangkat tiga dimensi vertikal, sehingga I_A/I_B = (h/b)² = ${f(A.I_mm4/B.I_mm4)}.</p>`;
  if(d.shape==='pipe')return eq(`A = π(d² − dᵢ²)/4 = ${f(A.A_mm2)} mm²<br>I = π(d⁴ − dᵢ⁴)/64 = <strong>${f(A.I_mm4)} mm⁴</strong>`)+'<p>Penampang lingkaran simetris terhadap setiap sumbu yang melalui pusat: orientasi A dan B identik. Dibandingkan bujur sangkar berluas sama, pipa menempatkan material jauh dari sumbu.</p>';
  if(d.shape==='I')return eq(`A = 2b_f t_f + (h − 2t_f)t_w = ${f(A.A_mm2)} mm²<br>A (sumbu kuat): I = [b_f h³ − (b_f − t_w)(h − 2t_f)³]/12 = <strong>${f(A.I_mm4)} mm⁴</strong><br>B (sumbu lemah): I = [2t_f b_f³ + (h − 2t_f)t_w³]/12 = <strong>${f(B.I_mm4)} mm⁴</strong>`)+'<p>Sumbu kuat: kedua flens jauh dari sumbu netral sehingga kontribusinya besar (persegi panjang luar dikurangi rongga di kiri–kanan badan). Sumbu lemah: flens berdiri dan hanya badan tipis yang menghubungkan; I turun drastis.</p>';
  const {Af,yf,Aw,yw}=A.parts;
  return eq(`Flens: A_f = b_f t_f = ${f(Af)} mm², y_f = h − t_f/2 = ${f(yf)} mm<br>Badan: A_w = t_w(h − t_f) = ${f(Aw)} mm², y_w = (h − t_f)/2 = ${f(yw)} mm<br>ȳ = (A_f y_f + A_w y_w)/(A_f + A_w) = <strong>${f(A.yc_mm)} mm dari bawah</strong><br>I = Σ[I_sendiri + A(y − ȳ)²]<br>I = ${f(d.bf_mm)}×${f(d.tf_mm)}³/12 + ${f(Af)}×(${f(yf)} − ${f(A.yc_mm)})² + ${f(d.tw_mm)}×${f(d.h_mm-d.tf_mm)}³/12 + ${f(Aw)}×(${f(yw)} − ${f(A.yc_mm)})²<br><strong>I_A = ${f(A.I_mm4)} mm⁴</strong> · B (diputar): I = [t_f b_f³ + (h − t_f)t_w³]/12 = <strong>${f(B.I_mm4)} mm⁴</strong>`)+'<p>Profil T tak simetris terhadap sumbu horizontal. Cari titik berat lebih dulu, lalu pindahkan I tiap persegi panjang ke sumbu itu dengan teorema sumbu sejajar. Memakai bh³/12 secara langsung untuk seluruh profil adalah keliru.</p>';
}

export const sectionConfig={
  id:'07',prefix:'section',fields:sectionFields,
  mode:{key:'shape',label:'Bentuk penampang',note:'Ukuran yang tidak dipakai bentuk ini disembunyikan.',options:shapes,inactive:inactiveSectionFields},
  content:{
    title:'Bentuk Penampang',headline:'Luas sama. Kekakuan berbeda.',names:['Orientasi profil rangka mesin','Orientasi balok penegar geladak'],
    descriptions:['Batang rangka mesin menerima beban di tengah bentang. Bandingkan orientasi tegak dan rebah, lalu coba profil I, T atau pipa dengan luas yang sebanding.','Penegar geladak diidealkan sebagai balok sendi–rol tunggal. Bandingkan orientasi dan bentuk profil tanpa memodelkan pelat geladak yang ikut bekerja.'],
    assumption:'Balok sendi–rol, beban titik vertikal di tengah, elastis linier, Euler–Bernoulli. Profil ideal bersudut tajam tanpa fillet. Lentur terhadap sumbu horizontal yang melalui titik berat; profil simetris terhadap sumbu vertikal.',
    prediction:'Penampang persegi panjang 40 × 100 mm diputar sehingga sisi 40 mm menjadi tinggi. Luas tetap. Apa yang terjadi pada lendutan?',
    choices:[['bigger','Lendutan bertambah besar (sekitar 6,25 kali)'],['same','Lendutan sama karena luas sama'],['smaller','Lendutan berkurang']],correct:'bigger',
    explanation:'I = bh³/12. Tinggi turun dari 100 menjadi 40 mm, sedangkan lebar naik dari 40 menjadi 100 mm, sehingga I turun dengan faktor (100/40)² = 6,25. δ = PL³/(48EI) naik dengan faktor yang sama. Luas menentukan massa; sebaran material terhadap sumbu netral menentukan kekakuan lentur.',
    reflection:'Mengapa luas yang sama tidak berarti kekakuan lentur yang sama?',
    sources:[['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/3734eab076925fc3721f7a79068abf79_lec19.pdf','MIT OCW 2.001, Lecture 21: Moment–curvature dan momen inersia'],['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/1340543ced026dab5c8444a53fe92153_lec20.pdf','MIT OCW 2.001, Lecture 22: Letak sumbu netral dan teorema sumbu sejajar']],
    limitation:`Profil L dan penampang lain yang tak simetris terhadap dua sumbu tidak disediakan: lenturnya tidak dapat dimodelkan dengan satu I horizontal karena sumbu utamanya miring. Profil T dibebani searah sumbu simetrinya. Lendutan tidak diklaim bila L/tinggi < ${slendernessLimit} atau σ ≥ Sᵧ latihan. Tidak menghitung tekuk lokal flens/badan, tekuk lateral-torsional (penting untuk profil I/T pada sumbu kuat), tegangan geser, puntir, atau lebar efektif pelat geladak. Bukan pemilihan profil standar atau aturan klasifikasi.`,
    dataNote:'Data persegi panjang P, L, b, h dan E berasal dari register M0 dan merupakan asumsi latihan. Ukuran profil I, T dan pipa adalah preset latihan baru.',
  },
  preset(context,dataset){return {shape:'rect',...profilePresets[context],Sy_MPa:250,...dataset.cases.find(x=>x.id===`07-${context==='mesin'?'M':'K'}`).input};},
  presetNote:p=>`Ukuran profil I/T (b_f ${f(p.bf_mm)}, t_f ${f(p.tf_mm)}, t_w ${f(p.tw_mm)} mm, tinggi h sama dengan persegi panjang) dan pipa (${f(p.d_mm)}/${f(p.di_mm)} mm) adalah preset latihan; data M0 kasus ini hanya menetapkan persegi panjang.`,
  evaluate:evaluateSection,
  status:e=>e.status==='outside'?`Di luar domain model. ${e.reason}`:'Dalam domain model latihan. Perbandingan kekakuan dan tegangan; tidak menyatakan profil aman.',
  lab:{title:'Dua orientasi, luas yang sama',render:sectionPair},
  buttons:[{id:'rotate',label:'Persegi panjang: tukar b ↔ h',run(api){const d=api.get();if(api.mode()==='rect'){const b=d.b_mm,h=d.h_mm;api.set('b_mm',h);api.set('h_mm',b);}}}],
  release:()=> 'P_N',
  graphs:[{title:'Tegangan lentur di tengah bentang',render:stressComparison},{title:'Momen inersia dan lendutan',render:stiffnessBars}],
  results(e){const {orientation_A:A,orientation_B:B,ratio_delta}=e.result;return [['Luas A (sama untuk A dan B)',A.A_mm2,'mm²'],['Titik berat ȳ dari bawah (A)',A.yc_mm,'mm'],['I orientasi A',A.I_mm4,'mm⁴'],['I orientasi B',B.I_mm4,'mm⁴'],['Z atas (A)',A.Ztop_mm3,'mm³'],['Z bawah (A)',A.Zbot_mm3,'mm³'],['σ serat bawah A (tarik)',A.sigmaBottom_MPa,'MPa'],['σ serat bawah B (tarik)',B.sigmaBottom_MPa,'MPa'],['Lendutan δ A',A.deltaMax_mm,'mm'],['Lendutan δ B',B.deltaMax_mm,'mm'],['Rasio δ_B/δ_A',ratio_delta,'']];},
  variantTitle:'Bandingkan dengan dasar yang adil',
  variants(e){if(e.status==='invalid')return null;const r=e.result,wrap=o=>({status:'valid',result:o});return [['A · seperti digambar',wrap(r.orientation_A)],['B · diputar 90°',wrap(r.orientation_B)],['Bujur sangkar luas sama',wrap(r.square)]];},
  variantIntro:e=>`Ketiga baris memakai luas ${f(e.result.orientation_A.A_mm2)} mm², beban, bentang dan E yang sama. Rasio terhadap orientasi A ditampilkan dalam kurung.`,
  variantColumns:[{title:'I',value:x=>x.result.I_mm4,unit:'mm⁴'},{title:'σmax',value:x=>x.result.sigmaMax_MPa,unit:'MPa'},{title:'δmax',value:x=>x.result.deltaMax_mm,unit:'mm',missing:x=>x.result.slender?'Tidak dihitung (σ ≥ Sᵧ)':`Tidak dihitung (L/tinggi = ${f(x.result.slenderness,3)} &lt; 10)`}],
  variantNote:'Perbandingan hanya adil bila luas, beban, bentang dan material sama. Bujur sangkar menjadi acuan netral; profil yang lebih kaku daripadanya memanfaatkan material lebih efisien terhadap arah beban ini.',
  steps(e,raw,units){
    const d=e.data,{orientation_A:A,orientation_B:B}=e.result,skip=new Set(inactiveSectionFields(d.shape));
    const conv=Object.entries(sectionFields).filter(([k])=>!skip.has(k)).map(([k,fl])=>`${fl.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${unitOf(k)}`).join('<br>');
    const dl=r=>r.deltaMax_mm===null?'tidak dihitung':`${f(r.deltaMax_mm)} mm`;
    return [
      ['Samakan satuan dan tetapkan arah beban',eq(conv)+`<p>Bentuk aktif: <strong>${shapes[d.shape]}</strong>. Beban vertikal, sehingga yang menentukan adalah dimensi searah beban dan sumbu netral horizontal.</p>`],
      ['Hitung reaksi dan momen maksimum',eq(`R = P/2 = <strong>${f(A.R_N)} N</strong><br>Mmax = PL/4 = ${f(d.P_N)} × ${f(d.L_mm)}/4 = <strong>${f(A.Mmax_Nmm)} N·mm</strong>`)+'<p>Beban dan tumpuan sama untuk kedua orientasi, sehingga momen yang harus ditahan juga sama. Yang berbeda hanya penampangnya.</p>'],
      ['Hitung luas, titik berat dan momen inersia',propertySteps(d,A,B)],
      ['Hitung jarak serat terjauh dan modulus penampang',eq(`A: c atas = ${f(A.ctop_mm)} mm · c bawah = ${f(A.cbot_mm)} mm<br>Z atas = I/c atas = ${f(A.Ztop_mm3)} mm³ · Z bawah = I/c bawah = ${f(A.Zbot_mm3)} mm³<br>B: c = ${f(B.ctop_mm)} mm · Z = ${f(B.Ztop_mm3)} mm³`)+'<p>Z menggabungkan I dan jarak serat terjauh. Untuk penampang tak simetris, Z atas dan bawah berbeda; Z yang lebih kecil memberi tegangan lebih besar.</p>'],
      ['Hitung tegangan lentur',eq(`A: σ atas = −Mmax/Z atas = ${f(A.sigmaTop_MPa)} MPa · σ bawah = +Mmax/Z bawah = <strong>${f(A.sigmaBottom_MPa)} MPa</strong><br>B: σ atas = ${f(B.sigmaTop_MPa)} MPa · σ bawah = <strong>${f(B.sigmaBottom_MPa)} MPa</strong>`)+'<p>Momen positif menekan serat atas dan menarik serat bawah. Lokasi kritis: serat terjauh di tengah bentang.</p>'],
      ['Hitung lendutan dan bandingkan',eq(`δ = PL³/(48EI)<br>A: δ = ${f(d.P_N)} × ${f(d.L_mm)}³/(48 × ${f(d.E_MPa)} × ${f(A.I_mm4)}) = <strong>${dl(A)}</strong><br>B: δ = <strong>${dl(B)}</strong>${e.result.ratio_delta?`<br>δ_B/δ_A = I_A/I_B = <strong>${f(e.result.ratio_delta)}</strong>`:''}`)+`<p>Lendutan berbanding terbalik dengan I. Klaim lendutan memerlukan L/tinggi ≥ ${slendernessLimit} dan σ < Sᵧ latihan pada orientasi tersebut.</p>`],
      ['Tafsirkan hasil dan batas kesimpulan','<p>Luas sama berarti massa per panjang sama, tetapi kekakuan bergantung pada seberapa jauh material dari sumbu netral. Profil I dan pipa efisien karena memindahkan material ke serat luar. Orientasi harus dibaca bersama arah beban. Tekuk lokal, tekuk lateral-torsional, geser dan sambungan belum dihitung; hasil bukan pemilihan profil atau pernyataan aman.</p>'],
    ];
  },
  exercise:{
    data:sectionExercises,grade:gradeSection,
    labels:c=>c==='mesin'?['Momen inersia orientasi A, I_A (mm⁴)','Rasio lendutan δ_B/δ_A (tanpa satuan)']:['Titik berat ȳ dari serat bawah (mm)','Tegangan serat bawah σ_bawah (MPa)'],
    summary:x=>x.shape==='rect'?`Persegi panjang b = ${f(x.b_mm)} mm, h = ${f(x.h_mm)} mm (orientasi A tegak); P = ${f(x.P_N/1000)} kN di tengah bentang L = ${f(x.L_mm)} mm; E = ${f(x.E_MPa/1000)} GPa`:`Profil T dengan flens di atas: b_f = ${f(x.bf_mm)} mm, t_f = ${f(x.tf_mm)} mm, h = ${f(x.h_mm)} mm, t_w = ${f(x.tw_mm)} mm; P = ${f(x.P_N/1000)} kN di tengah bentang L = ${f(x.L_mm)} mm; E = ${f(x.E_MPa/1000)} GPa`,
    hint:(c,k)=>c==='mesin'?(k==='first'?'Belum tepat. I = bh³/12 dengan h = dimensi vertikal.':'Belum tepat. δ ∝ 1/I, jadi δ_B/δ_A = I_A/I_B = (h/b)².'):(k==='first'?'Belum tepat. ȳ = (A_f y_f + A_w y_w)/(A_f + A_w), diukur dari serat bawah.':'Belum tepat. Hitung I dengan teorema sumbu sejajar, lalu σ = Mmax·ȳ/I dengan Mmax = PL/4.'),
  },
};
