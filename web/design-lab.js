import {shaftDesignFields,beamDesignFields,evaluateShaftDesign,evaluateBeamDesign,designExercises,gradeDesign} from './design-model.js';
import {fmt as f} from './lab-core.js';
import {readNumber} from './model.js';
import {alternativesDrawing,utilizationBars,decisionMatrix,designSummary,verdict} from './design-visuals.js';
const eq=s=>`<div class="equation">${s}</div>`;
const unitOf=k=>k==='T_Nmm'?'N·mm':k==='P_N'?'N':k==='rho_kg_m3'?'kg/m³':k==='theta_limit_deg'?'°':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':'';
const conversion=(fields,d,raw,units)=>eq(Object.entries(fields).map(([k,fl])=>`${fl.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${unitOf(k)}`).join('<br>'));

const shared={
  title:'Studio Desain',headline:'Rancang. Bandingkan. Jelaskan.',
  names:['Poros transmisi pejal–berongga','Alternatif orientasi balok geladak'],
  descriptions:['Dua rancangan poros transmisi dengan diameter luar sama: pejal dan berongga. Bandingkan massa, kekuatan dan sudut puntir terhadap kriteria latihan, lalu tuliskan keputusanmu.','Dua orientasi balok geladak dengan luas (dan massa) sama. Periksa kekuatan dan lendutan secara terpisah, lalu jelaskan mengapa lulus kekuatan belum berarti lulus kekakuan.'],
  prediction:'Sebuah alternatif rancangan memenuhi kriteria kekuatan n ≥ 2. Apakah ia otomatis memenuhi batas deformasi?',
  choices:[['no','Tidak selalu; kekakuan harus diperiksa terpisah'],['yes','Ya, karena tegangannya sudah rendah'],['strength','Kekuatan saja cukup untuk memutuskan rancangan']],correct:'no',
  explanation:'Kekuatan bergantung pada tegangan (M/Z atau Tc/J), sedangkan deformasi bergantung pada kekakuan (EI atau GJ) dan sangat sensitif terhadap panjang. Pada kasus Kapal, orientasi rebah masih memenuhi n ≥ 2 tetapi melendut melebihi batas L/1000. Setiap kriteria dinilai sendiri-sendiri.',
  reflection:'Alternatif mana yang kamu pilih, apa trade-off massa, kekuatan dan kekakuannya, dan verifikasi apa yang masih diperlukan?',
  sources:[['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/48c47be2a2e70576edc4678ec4c099af_lec22.pdf','MIT OCW 2.001, Lecture 24: Torsion (Twisting)'],['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/3734eab076925fc3721f7a79068abf79_lec19.pdf','MIT OCW 2.001, Lecture 21: Moment–curvature dan lendutan balok'],['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/0536dc7d752d099f72b85de5d8876f22_lec17.pdf','MIT OCW 2.001, Lecture 18: Failure of materials (von Mises)']],
  dataNote:'Data awal berasal dari register M0 dan merupakan asumsi latihan.',
};

const shaftConfig={
  id:'10',prefix:'design',fields:shaftDesignFields,mode:null,
  content:{...shared,
    assumption:'Poros bulat seragam dengan diameter luar sama, torsi statis murni, elastis linier isotropik (model modul 05). Massa m = ρAL. Kriteria latihan: n = Sᵧ/(√3·τmax) ≥ target dan θ ≤ batas.',
    limitation:'Kriteria n ≥ 2 dan θ ≤ 2° adalah kriteria latihan untuk kasus ini, bukan standar. Tidak memeriksa alur pasak, bahu poros, lentur akibat puli/roda gigi/bantalan, fatigue, getaran torsional, putaran kritis, tekuk dinding tipis atau biaya pembuatan. Rekomendasi mengikuti aturan keputusan latihan yang dinyatakan; keputusan rekayasa nyata memerlukan verifikasi lanjutan.'},
  preset:(context,dataset)=>({...dataset.cases.find(x=>x.id==='10-M').input}),
  presetNote:()=>'ρ = 7.850 kg/m³, Sᵧ = 250 MPa, n ≥ 2 dan θ ≤ 2° berasal dari register M0 sebagai asumsi dan kriteria latihan. Diameter dalam 0 berarti pejal.',
  evaluate:evaluateShaftDesign,
  status:e=>e.status==='outside'?`Di luar domain model. ${e.reason}`:e.result.decision.choice?`Rekomendasi latihan: alternatif ${e.result.decision.choice}. Bukan pernyataan aman.`:'Belum ada alternatif yang memenuhi semua kriteria latihan.',
  lab:{title:'Dua alternatif poros',render:alternativesDrawing},
  buttons:[
    {id:'thin',label:'B: dinding lebih tipis (dᵢ = 0,8d)',run(api){const d=api.get().d_mm;if(Number.isFinite(d))api.set('di_B_mm',.8*d);}},
    {id:'strict',label:'Perketat batas θ menjadi 0,5°',run(api){api.set('theta_limit_deg',.5);}},
  ],
  release:()=>'T_Nmm',
  graphs:[{title:'Pemakaian kriteria',render:utilizationBars},{title:'Matriks keputusan',render:decisionMatrix}],
  results(e){const {alternative_A:A,alternative_B:B,massSaving}=e.result;return [['Massa A',A.mass_kg,'kg'],['Massa B',B.mass_kg,'kg'],['Penghematan massa B',massSaving*100,'%'],['τmax A',A.tauMax_MPa,'MPa'],['τmax B',B.tauMax_MPa,'MPa'],['n luluh A',A.n_yield,''],['n luluh B',B.n_yield,''],['θ A',A.theta_deg,'°'],['θ B',B.theta_deg,'°'],['Rekomendasi latihan',e.result.decision.choice?`Alternatif ${e.result.decision.choice}`:'Belum ada','']];},
  variants(e){if(e.status==='invalid')return null;const d=e.data,wrap=a=>({status:'valid',result:a});const thin=evaluateShaftDesign({...d,di_B_mm:.8*d.d_mm});return [['A · pejal',wrap(e.result.alternative_A)],['B · aktif',wrap(e.result.alternative_B)],...(thin.status==='invalid'?[]:[['B dengan dᵢ = 0,8d',wrap(thin.result.alternative_B)]])];},
  variantTitle:'Bandingkan rongga yang berbeda',
  variantIntro:()=>'Diameter luar, torsi, panjang dan material sama. Rasio terhadap alternatif A ditampilkan dalam kurung.',
  variantColumns:[{title:'Massa',value:x=>x.result.mass_kg,unit:'kg'},{title:'n luluh',value:x=>x.result.n_yield,unit:''},{title:'θ',value:x=>x.result.theta_deg,unit:'°'}],
  variantNote:'Memperbesar rongga menurunkan massa jauh lebih cepat daripada menurunkan kekuatan dan kekakuan, tetapi dinding yang sangat tipis berisiko tekuk lokal yang belum dihitung di sini.',
  steps(e,raw,units){
    const d=e.data,{alternative_A:A,alternative_B:B}=e.result,th=a=>a.theta_deg===null?'tidak dihitung':`${f(a.theta_deg)}°`;
    return [
      ['Samakan satuan dan tetapkan kriteria',conversion(shaftDesignFields,d,raw,units)+'<p>Kriteria ditetapkan sebelum menghitung agar keputusan tidak disesuaikan dengan hasil.</p>'],
      ['Hitung luas dan massa',eq(`A = π(d² − dᵢ²)/4 · m = ρAL<br>A: ${f(A.area_mm2)} mm² → m = ${f(d.rho_kg_m3)} × ${f(A.area_mm2)} × 10⁻⁶ × ${f(d.L_mm)} × 10⁻³ = <strong>${f(A.mass_kg)} kg</strong><br>B: ${f(B.area_mm2)} mm² → <strong>${f(B.mass_kg)} kg</strong>`)+'<p>Ubah mm² dan mm ke m² dan m agar ρ (kg/m³) menghasilkan kilogram.</p>'],
      ['Hitung J dan tegangan geser maksimum',eq(`J = π(d⁴ − dᵢ⁴)/32 · τmax = T(d/2)/J<br>A: J = ${f(A.J_mm4)} mm⁴ → τmax = <strong>${f(A.tauMax_MPa)} MPa</strong><br>B: J = ${f(B.J_mm4)} mm⁴ → τmax = <strong>${f(B.tauMax_MPa)} MPa</strong>`)+'<p>Rongga menghilangkan material dekat sumbu yang hanya menahan tegangan kecil; J turun sedikit, τmax naik sedikit.</p>'],
      ['Periksa kekuatan',eq(`n = Sᵧ/(√3·τmax)<br>A: n = ${f(d.Sy_MPa)}/(√3 × ${f(A.tauMax_MPa)}) = <strong>${A.n_yield===null?'tak terdefinisi':f(A.n_yield)}</strong> → ${verdict(A.strength)}<br>B: n = <strong>${B.n_yield===null?'tak terdefinisi':f(B.n_yield)}</strong> → ${verdict(B.strength)}`)+'<p>Untuk geser murni, von Mises memberi σ_vm = √3·τ. n dibandingkan dengan target latihan.</p>'],
      ['Periksa kekakuan puntir',eq(`G = E/[2(1+ν)] = ${f(d.E_MPa/(2*(1+d.nu)))} MPa · θ = TL/(GJ)<br>A: θ = <strong>${th(A)}</strong> → ${verdict(A.stiffness)}<br>B: θ = <strong>${th(B)}</strong> → ${verdict(B.stiffness)} (batas ${f(d.theta_limit_deg)}°)`)+'<p>Sudut puntir menentukan ketepatan transmisi dan dinilai terpisah dari kekuatan.</p>'],
      ['Bandingkan dan putuskan',`<p>Penghematan massa B: <strong>${f(e.result.massSaving*100)}%</strong>; J_B/J_A = ${f(e.result.stiffnessRatio)}. ${e.result.decision.choice?`Menurut aturan keputusan latihan, pilih <strong>alternatif ${e.result.decision.choice}</strong>.`:'Belum ada alternatif yang memenuhi semua kriteria.'} Poros berongga sering dipilih karena rasio kekakuan-terhadap-massa yang tinggi, tetapi biaya pembuatan dan dinding tipis perlu dipertimbangkan.</p>`],
      ['Rencanakan verifikasi lanjutan','<p>Bandingkan dengan SolidWorks memakai geometri, material dan kondisi batas yang sama (lihat pendamping di ringkasan). Periksa juga alur pasak, lentur dari puli atau roda gigi, fatigue dan putaran kritis sebelum keputusan nyata.</p>'],
    ];
  },
  exercise:{data:designExercises,grade:gradeDesign,labels:()=>['Massa alternatif B (kg)','Sudut puntir alternatif B θ (derajat)'],
    summary:x=>`T = ${f(x.T_Nmm/1000)} N·m; d = ${f(x.d_mm)} mm; A pejal; B dengan dᵢ = ${f(x.di_B_mm)} mm; L = ${f(x.L_mm)} mm; E = ${f(x.E_MPa/1000)} GPa; ν = ${f(x.nu)}; ρ = ${f(x.rho_kg_m3)} kg/m³`,
    hint:(c,k)=>k==='first'?'Belum tepat. m = ρ·π(d² − dᵢ²)/4·L dengan satuan meter.':'Belum tepat. θ = TL/(GJ) dengan J = π(d⁴ − dᵢ⁴)/32 dan G = E/[2(1+ν)]; ubah radian ke derajat.'},
};

const beamConfig={
  id:'10',prefix:'design',fields:beamDesignFields,mode:null,
  content:{...shared,
    assumption:'Balok persegi panjang sendi–rol, beban titik di tengah, elastis linier, Euler–Bernoulli (model modul 06). Kedua alternatif mempunyai luas yang sama. Kriteria latihan: n = Sᵧ/σmax ≥ target dan δ ≤ batas.',
    limitation:'Batas lendutan 2,5 mm (L/1000) dan n ≥ 2 adalah kriteria latihan yang dipilih untuk membedakan alternatif, bukan kutipan aturan kelas kapal. Lendutan tidak diklaim bila L/h < 10 atau σ ≥ Sᵧ. Tidak memeriksa tegangan geser, tekuk lateral-torsional (penting untuk balok tinggi dan sempit), pelat geladak yang ikut bekerja, sambungan, berat sendiri atau beban dinamis/gelombang.'},
  preset:(context,dataset)=>{const {deflection_limit_basis,...input}=dataset.cases.find(x=>x.id==='10-K').input;return {rho_kg_m3:7850,...input};},
  presetNote:()=>'Batas lendutan default 2,5 mm = L/1000 untuk bentang awal; jika L diubah, batas tidak ikut berubah otomatis dan harus dinyatakan sendiri. ρ = 7.850 kg/m³ adalah preset latihan untuk menghitung massa (data M0 kasus ini tidak menetapkannya).',
  evaluate:evaluateBeamDesign,
  status:e=>e.status==='outside'?`Di luar domain model. ${e.reason}`:e.result.decision.choice?`Rekomendasi latihan: alternatif ${e.result.decision.choice}. Bukan pernyataan aman.`:'Belum ada alternatif yang memenuhi semua kriteria latihan.',
  lab:{title:'Dua orientasi balok',render:alternativesDrawing},
  buttons:[
    {id:'hmin',label:'B: pakai tinggi minimum untuk δ ≤ batas',run(api){const r=evaluateBeamDesign(api.get());if(r.status!=='invalid')api.set('h_B_mm',Math.ceil(r.result.hMinB_mm));}},
    {id:'limit',label:'Batas δ = L/1000',run(api){const L=api.get().L_mm;if(Number.isFinite(L))api.set('deflection_limit_mm',L/1000);}},
  ],
  release:()=>'P_N',
  graphs:[{title:'Pemakaian kriteria',render:utilizationBars},{title:'Matriks keputusan',render:decisionMatrix}],
  results(e){const {alternative_A:A,alternative_B:B}=e.result;return [['Massa A = B (luas sama)',A.mass_kg,'kg'],['I A',A.I_mm4,'mm⁴'],['I B',B.I_mm4,'mm⁴'],['σmax A',A.sigmaMax_MPa,'MPa'],['σmax B',B.sigmaMax_MPa,'MPa'],['n luluh A',A.n_yield,''],['n luluh B',B.n_yield,''],['δ A',A.deltaMax_mm,'mm'],['δ B',B.deltaMax_mm,'mm'],['Rekomendasi latihan',e.result.decision.choice?`Alternatif ${e.result.decision.choice}`:'Belum ada','']];},
  variants(e){if(e.status==='invalid')return null;const d=e.data,wrap=a=>({status:'valid',result:a});const fix=evaluateBeamDesign({...d,h_B_mm:Math.ceil(e.result.hMinB_mm)});return [['A · tegak',wrap(e.result.alternative_A)],['B · aktif',wrap(e.result.alternative_B)],...(fix.status==='invalid'?[]:[[`B dengan h = ${f(Math.ceil(e.result.hMinB_mm))} mm`,wrap(fix.result.alternative_B)]])];},
  variantTitle:'Apa yang dibutuhkan B agar memenuhi lendutan?',
  variantIntro:()=>'Beban, bentang dan material sama. Baris ketiga menaikkan tinggi B ke nilai minimum (dibulatkan ke atas) agar δ ≤ batas, dengan lebar tetap. Rasio terhadap A dalam kurung.',
  variantColumns:[{title:'Massa',value:x=>x.result.mass_kg,unit:'kg'},{title:'n luluh',value:x=>x.result.n_yield,unit:''},{title:'δ',value:x=>x.result.deltaMax_mm,unit:'mm',missing:x=>x.result.slender?'Tidak dihitung (σ ≥ Sᵧ)':`Tidak dihitung (L/h = ${f(x.result.slenderness,3)} &lt; 10)`}],
  variantNote:'Membuat B memenuhi lendutan dengan orientasi rebah membutuhkan material jauh lebih banyak daripada sekadar memutar balok ke orientasi tegak. Balok tinggi dan sempit perlu diperiksa terhadap tekuk lateral-torsional.',
  steps(e,raw,units){
    const d=e.data,{alternative_A:A,alternative_B:B}=e.result,dl=a=>a.deltaMax_mm===null?'tidak dihitung':`${f(a.deltaMax_mm)} mm`;
    return [
      ['Samakan satuan dan tetapkan kriteria',conversion(beamDesignFields,d,raw,units)+'<p>Kriteria ditetapkan sebelum menghitung. Batas lendutan latihan dinyatakan eksplisit, bukan dikutip dari aturan kelas.</p>'],
      ['Hitung reaksi, momen dan massa',eq(`R = P/2 = ${f(A.R_N)} N · Mmax = PL/4 = <strong>${f(A.Mmax_Nmm)} N·mm</strong><br>A = bh: A = ${f(A.A_mm2)} mm², B = ${f(B.A_mm2)} mm²<br>m = ρAL: A = <strong>${f(A.mass_kg)} kg</strong>, B = <strong>${f(B.mass_kg)} kg</strong>`)+'<p>Beban, tumpuan dan luas sama, sehingga momen dan massa sama untuk kedua orientasi.</p>'],
      ['Hitung momen inersia',eq(`I = bh³/12<br>A: ${f(A.b_mm)} × ${f(A.h_mm)}³/12 = <strong>${f(A.I_mm4)} mm⁴</strong><br>B: ${f(B.b_mm)} × ${f(B.h_mm)}³/12 = <strong>${f(B.I_mm4)} mm⁴</strong>`)+`<p>I_B/I_A = ${f(e.result.stiffnessRatio)}: dimensi vertikal menentukan kekakuan.</p>`],
      ['Periksa kekuatan',eq(`σmax = Mmax(h/2)/I · n = Sᵧ/σmax<br>A: σ = ${f(A.sigmaMax_MPa)} MPa → n = <strong>${A.n_yield===null?'tak terdefinisi':f(A.n_yield)}</strong> → ${verdict(A.strength)}<br>B: σ = ${f(B.sigmaMax_MPa)} MPa → n = <strong>${B.n_yield===null?'tak terdefinisi':f(B.n_yield)}</strong> → ${verdict(B.strength)}`)+'<p>Tegangan lentur uniaksial di serat terluar; untuk kasus ini σ_vm = |σ|.</p>'],
      ['Periksa lendutan',eq(`δ = PL³/(48EI)<br>A: δ = <strong>${dl(A)}</strong> → ${verdict(A.stiffness)}<br>B: δ = <strong>${dl(B)}</strong> → ${verdict(B.stiffness)} (batas ${f(d.deflection_limit_mm)} mm)`)+'<p>Lendutan bergantung pada EI dan L³, bukan pada σ. Karena itu alternatif yang lulus kekuatan dapat gagal kekakuan.</p>'],
      ['Bandingkan dan putuskan',`<p>${e.result.decision.choice?`Menurut aturan keputusan latihan, pilih <strong>alternatif ${e.result.decision.choice}</strong>.`:'Belum ada alternatif yang memenuhi semua kriteria.'} Agar B memenuhi lendutan pada lebar ${f(B.b_mm)} mm, tinggi minimum ≈ ${f(e.result.hMinB_mm)} mm.</p>`],
      ['Rencanakan verifikasi lanjutan','<p>Bandingkan dengan SolidWorks memakai geometri, material dan tumpuan yang sama; baca tegangan jauh dari titik gaya. Periksa juga tekuk lateral-torsional, pelat geladak yang ikut bekerja, sambungan dan beban gelombang sebelum keputusan nyata.</p>'],
    ];
  },
  exercise:{data:designExercises,grade:gradeDesign,labels:()=>['Lendutan alternatif B δ_B (mm)','Faktor keamanan luluh alternatif A n_A'],
    summary:x=>`P = ${f(x.P_N/1000)} kN di tengah bentang L = ${f(x.L_mm)} mm; A = ${f(x.b_A_mm)} × ${f(x.h_A_mm)} mm (tegak); B = ${f(x.b_B_mm)} × ${f(x.h_B_mm)} mm (rebah); E = ${f(x.E_MPa/1000)} GPa; Sᵧ = ${f(x.Sy_MPa)} MPa; batas δ = ${f(x.deflection_limit_mm)} mm`,
    hint:(c,k)=>k==='first'?'Belum tepat. δ = PL³/(48EI) dengan I = bh³/12, h = dimensi vertikal B.':'Belum tepat. n = Sᵧ/σmax dengan σmax = (PL/4)(h/2)/I.'},
};

export const designConfig=context=>context==='mesin'?shaftConfig:beamConfig;
export const designSummaryFor=context=>e=>designSummary(e,context);
shaftConfig.graphs.push({title:'Ringkasan rancangan',render:designSummaryFor('mesin')});
beamConfig.graphs.push({title:'Ringkasan rancangan',render:designSummaryFor('kapal')});
