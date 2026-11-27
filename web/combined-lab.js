import {combinedFields,evaluateCombined,combinedVariants,combinedExercises,gradeCombined} from './combined-model.js';
import {fmt as f} from './lab-core.js';
import {readNumber} from './model.js';
import {shaftLoads,criterionBars} from './combined-visuals.js';
const eq=s=>`<div class="equation">${s}</div>`;
const unitOf=k=>k==='F_N'?'N':k.endsWith('_Nmm')?'N·mm':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':'';

export const combinedConfig={
  id:'09',prefix:'combined',fields:combinedFields,mode:null,
  content:{
    title:'Beban Gabungan & Keamanan',headline:'Gabungkan beban. Nilai kriterianya.',names:['Poros mesin: lentur dan torsi','Poros propeler: gaya dorong dan torsi'],
    descriptions:['Poros mesin menerima momen lentur dari puli dan torsi dari motor sekaligus. Gabungkan tegangan pada titik permukaan yang sama, lalu bandingkan dengan kriteria luluh latihan.','Segmen poros propeler menerima gaya dorong tekan dan torsi. Evaluasi tegangan ekuivalen pada permukaan tanpa memeriksa tekuk, fatigue, atau aturan klasifikasi poros.'],
    assumption:'Poros pejal bulat, elastis linier, tegangan bidang di permukaan. Material ulet latihan dengan kriteria luluh von Mises. Titik A di serat atas dan B di serat bawah pada penampang yang sama. Tanpa konsentrasi tegangan, alur pasak, atau beban dinamis.',
    prediction:'Poros menerima M dan T, tanpa gaya aksial. Di titik A σ = +47,7 MPa, di titik B σ = −47,7 MPa, dan τ sama di keduanya. Titik mana yang lebih kritis menurut von Mises?',
    choices:[['both','Sama kritis, karena σ dikuadratkan dalam von Mises'],['A','Titik A, karena tegangannya tarik'],['B','Titik B, karena tegangannya tekan']],correct:'both',
    explanation:'σ_vm = √(σ² + 3τ²). Tanda σ hilang saat dikuadratkan, sehingga A dan B sama kritis bila F = 0. Jika ada gaya aksial, σ_aksial menambah satu sisi dan mengurangi sisi lain; titik yang kritis harus dihitung, bukan ditebak. Untuk material ulet, kriteria ini tidak membedakan tarik dan tekan; tekuk dan fatigue tetap perlu dicek terpisah.',
    reflection:'Mengapa σ dan τ harus diambil dari titik fisik yang sama sebelum digabungkan?',
    source:'https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/',sourceLabel:'MIT OCW 2.001 Mechanics & Materials I, materi tegangan gabungan dan kriteria luluh',
    limitation:'Kriteria von Mises untuk material ulet isotropik dalam domain elastis. n luluh = Sᵧ/σ_vm,max adalah faktor keamanan statis terhadap luluh awal, bukan terhadap fatigue, tekuk, getaran torsional atau konsentrasi tegangan. Status hanya "memenuhi/belum memenuhi kriteria latihan"; tidak menyatakan poros aman. Gaya aksial tekan dapat menyebabkan tekuk yang belum dihitung. Tegangan geser akibat gaya lintang diabaikan (nol di serat atas/bawah). Bukan pemeriksaan aturan klasifikasi poros propeler.',
    dataNote:'Data F, M, T, d, Sᵧ dan target n berasal dari register M0 dan merupakan asumsi latihan.',
  },
  preset(context,dataset){return {...dataset.cases.find(x=>x.id===`09-${context==='mesin'?'M':'K'}`).input};},
  presetNote:()=>'F positif = tarik, negatif = tekan. M dan T dimasukkan sebagai besaran; M positif membuat titik A tarik. Target n harus > 1 dan Sᵧ 250 MPa adalah nilai latihan.',
  evaluate:evaluateCombined,
  status:e=>e.status==='outside'?`Di luar domain elastis. ${e.reason}`:e.result.n_yield===null?'Tegangan nol: n tidak terdefinisi pada tegangan nol.':`${e.checks.meets?'Memenuhi':'Belum memenuhi'} kriteria latihan n ≥ ${f(e.data.n_required)} (n = ${f(e.result.n_yield,4)}). ${e.checks.compression?'Ada gaya tekan: tekuk belum dievaluasi. ':''}Tidak menyatakan poros aman.`,
  lab:{title:'Beban pada poros dan elemen tegangan',render:shaftLoads},
  buttons:[
    {id:'no-torque',label:'Hilangkan T',run(api){api.set('T_Nmm',0);}},
    {id:'no-bending',label:'Hilangkan M',run(api){api.set('M_Nmm',0);}},
    {id:'flip-axial',label:'Balik tanda F',text:true,run(api){const F=api.get().F_N;if(Number.isFinite(F))api.set('F_N',-F);}},
  ],
  release:null,
  graphs:[{title:'Kriteria luluh von Mises',render:criterionBars}],
  results(e){const r=e.result;return [['σ aksial F/A',r.sigma_axial_MPa,'MPa'],['σ lentur Mc/I',r.sigma_bending_MPa,'MPa'],['τ permukaan Tc/J',r.tau_surface_MPa,'MPa'],['σ titik A',r.sigma_edge_A_MPa,'MPa'],['σ titik B',r.sigma_edge_B_MPa,'MPa'],['σ_vm titik A',r.vm_A_MPa,'MPa'],['σ_vm titik B',r.vm_B_MPa,'MPa'],['Titik kritis',r.critical==='both'?'A dan B sama':r.critical==='none'?'—':`Titik ${r.critical}`,''],['Faktor keamanan luluh n',r.n_yield,''],['Status kriteria latihan',r.n_yield===null?'Tidak terdefinisi':e.checks.yielded?'Melampaui Sᵧ':e.checks.meets?'Memenuhi':'Belum memenuhi','']];},
  variants:combinedVariants,
  variantIntro:()=>'Setiap baris menghilangkan atau mengubah satu beban dari kondisi aktif. Rasio terhadap kondisi aktif ditampilkan dalam kurung.',
  variantColumns:[{title:'σ_vm,max',value:x=>x.result.sigma_vm_max_MPa,unit:'MPa'},{title:'n luluh',value:x=>x.result.n_yield,unit:'',missing:()=>'Tidak terdefinisi (tegangan nol)'}],
  variantNote:'T = 0 mereduksi von Mises menjadi |σ|; M = 0 dan F = 0 mereduksinya menjadi √3·τ. Diameter × 1,2 menurunkan σ lentur dan τ dengan faktor 1,2³ ≈ 1,73, tetapi σ aksial hanya 1,2² = 1,44.',
  steps(e,raw,units){
    const d=e.data,r=e.result;
    const conv=Object.entries(combinedFields).map(([k,fl])=>`${fl.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${unitOf(k)}`).join('<br>');
    const [p1A,p2A]=r.principal_A_MPa,[p1B,p2B]=r.principal_B_MPa;
    return [
      ['Samakan satuan dan tetapkan titik tinjauan',eq(conv)+'<p>Titik A di serat atas dan B di serat bawah, pada penampang yang sama. Keduanya di permukaan, tempat tegangan lentur dan torsi terbesar.</p>'],
      ['Hitung properti penampang',eq(`A = πd²/4 = ${f(r.A_mm2)} mm²<br>I = πd⁴/64 = ${f(r.I_mm4)} mm⁴<br>J = πd⁴/32 = 2I = ${f(r.J_mm4)} mm⁴<br>c = d/2 = ${f(d.d_mm/2)} mm`)+'<p>I dipakai untuk lentur, J untuk torsi, dan A untuk gaya aksial.</p>'],
      ['Hitung tiap komponen tegangan',eq(`σ aksial = F/A = ${f(d.F_N)}/${f(r.A_mm2)} = ${f(r.sigma_axial_MPa)} MPa<br>σ lentur = Mc/I = ${f(d.M_Nmm)} × ${f(d.d_mm/2)}/${f(r.I_mm4)} = ${f(r.sigma_bending_MPa)} MPa<br>τ = Tc/J = ${f(d.T_Nmm)} × ${f(d.d_mm/2)}/${f(r.J_mm4)} = ${f(r.tau_surface_MPa)} MPa`)+'<p>Ketiganya dihitung terpisah dulu dengan model masing-masing (superposisi elastis).</p>'],
      ['Gabungkan σ pada titik yang sama',eq(`σ_A = σ aksial + σ lentur = ${f(r.sigma_axial_MPa)} + ${f(r.sigma_bending_MPa)} = <strong>${f(r.sigma_edge_A_MPa)} MPa</strong><br>σ_B = σ aksial − σ lentur = ${f(r.sigma_axial_MPa)} − ${f(r.sigma_bending_MPa)} = <strong>${f(r.sigma_edge_B_MPa)} MPa</strong><br>τ_A = τ_B = ${f(r.tau_surface_MPa)} MPa`)+'<p>σ normal hanya dapat dijumlahkan bila bekerja pada titik dan arah yang sama. Menjumlahkan maksimum dari lokasi berbeda memberi hasil yang tidak mewakili titik fisik mana pun.</p>'],
      ['Hitung tegangan ekuivalen von Mises',eq(`σ_vm = √(σ² + 3τ²)<br>A: √(${f(r.sigma_edge_A_MPa)}² + 3 × ${f(r.tau_surface_MPa)}²) = <strong>${f(r.vm_A_MPa)} MPa</strong><br>B: √(${f(r.sigma_edge_B_MPa)}² + 3 × ${f(r.tau_surface_MPa)}²) = <strong>${f(r.vm_B_MPa)} MPa</strong><br>σ_vm,max = <strong>${f(r.sigma_vm_max_MPa)} MPa</strong> (${r.critical==='both'?'A dan B sama':r.critical==='none'?'tegangan nol':`titik ${r.critical}`})`)+`<p>Pengayaan: tegangan utama A = ${f(p1A)} dan ${f(p2A)} MPa; B = ${f(p1B)} dan ${f(p2B)} MPa, dari σ₁,₂ = σ/2 ± √((σ/2)² + τ²).</p>`],
      ['Hitung faktor keamanan luluh',r.n_yield===null?'<p>Semua tegangan nol: n tidak terdefinisi pada tegangan nol (bukan tak hingga).</p>':eq(`n = Sᵧ/σ_vm,max = ${f(d.Sy_MPa)}/${f(r.sigma_vm_max_MPa)}<br><strong>n = ${f(r.n_yield)}</strong><br>Target latihan: n ≥ ${f(d.n_required)} → <strong>${e.checks.yielded?'melampaui Sᵧ':e.checks.meets?'memenuhi':'belum memenuhi'}</strong>`)+`<p>${e.checks.yielded?'n ≤ 1 berarti luluh awal tercapai; hasil elastis tidak lagi berlaku.':'n membandingkan kekuatan luluh latihan dengan tegangan ekuivalen di titik paling kritis.'}</p>`],
      ['Tafsirkan hasil dan batas kesimpulan',`<p>Memenuhi kriteria latihan bukan berarti poros aman. ${e.checks.compression?'Gaya tekan memerlukan pemeriksaan tekuk. ':''}Poros berputar mengalami tegangan lentur bolak-balik sehingga fatigue biasanya menentukan; alur pasak, bahu poros dan getaran torsional juga belum dihitung.</p>`],
    ];
  },
  exercise:{
    data:combinedExercises,grade:gradeCombined,
    labels:()=>['Tegangan von Mises maksimum σ_vm,max (MPa)','Faktor keamanan luluh n (tanpa satuan)'],
    summary:x=>`Poros pejal d = ${f(x.d_mm)} mm; F = ${f(x.F_N/1000)} kN; M = ${f(x.M_Nmm/1000)} N·m; T = ${f(x.T_Nmm/1000)} N·m; Sᵧ = ${f(x.Sy_MPa)} MPa. Tinjau titik A (atas) dan B (bawah)`,
    hint:(c,k)=>k==='first'?(c==='mesin'?'Belum tepat. σ = Mc/I, τ = Tc/J (J = 2I), lalu σ_vm = √(σ² + 3τ²).':'Belum tepat. Hitung σ_A = F/A + Mc/I dan σ_B = F/A − Mc/I (F negatif), lalu ambil σ_vm terbesar.'):'Belum tepat. n = Sᵧ/σ_vm,max.',
  },
};
