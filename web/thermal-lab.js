import {thermalFields,supports,evaluateThermal,thermalVariants,thermalExercises,gradeThermal} from './thermal-model.js';
import {fmt as f} from './lab-core.js';
import {readNumber} from './model.js';
import {pipeDiagram,stressTemperatureGraph} from './thermal-visuals.js';
const eq=s=>`<div class="equation">${s}</div>`;
const unitOf=k=>k==='deltaT_C'?'°C':k==='alpha_per_C'?'/°C':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':'';
const sense=s=>s<0?'tekan':s>0?'tarik':'nol';

export const thermalConfig={
  id:'08',prefix:'thermal',fields:thermalFields,
  mode:{key:'support',label:'Kondisi tumpuan',note:'Hasil kedua kondisi tetap dihitung; pilihan ini menentukan gambar dan hasil aktif.',options:supports,inactive:()=>[]},
  content:{
    title:'Pengaruh Temperatur',headline:'Memuai bebas atau tertahan?',names:['Pipa lurus instalasi mesin','Pipa lurus kamar mesin kapal'],
    descriptions:['Pipa baja lurus di instalasi mesin mengalami kenaikan temperatur saat beroperasi. Bandingkan pipa yang bebas memuai dengan pipa yang kedua ujungnya ditahan.','Segmen pipa lurus di kamar mesin dipanaskan atau didinginkan. Amati tanda tegangan dan gaya pada tumpuan tanpa memodelkan tekanan fluida atau sistem perpipaan lengkap.'],
    assumption:'Pipa lurus seragam, ΔT merata di seluruh volume, tanpa tekanan internal. E dan α konstan. Bebas: satu ujung dapat bergerak aksial tanpa hambatan. Terkekang: kedua ujung ditahan kaku tanpa kelonggaran.',
    prediction:'Pipa baja dipanaskan sementara kedua ujungnya ditahan kaku. Tegangan aksial apa yang muncul?',
    choices:[['compression','Tekan, karena pipa ingin memanjang tetapi ditahan'],['tension','Tarik, karena pipa memuai'],['zero','Nol, karena tidak ada beban luar']],correct:'compression',
    explanation:'Pipa ingin memanjang αΔT·L, tetapi tumpuan menahannya pada panjang awal. Tumpuan harus mendorong pipa kembali, sehingga σ = −EαΔT bernilai negatif (tekan). Pada pipa bebas tidak ada yang menahan, sehingga σ = 0 walaupun pipa memuai.',
    reflection:'Mengapa pipa yang bebas memuai tidak mengalami tegangan termal aksial, sedangkan pipa yang ditahan mengalaminya?',
    sources:[['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/bd0c65066e01f2a16313d1903725b14d_lec14.pdf','MIT OCW 2.001, Lecture 15: Stress–strain–temperature relationships'],['https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/8ee771f4edfda8df0e9f1b38c491dc46_lec7.pdf','MIT OCW 2.001, Lecture 7: Force–deformation dan struktur statis tak tentu']],
    limitation:'Hanya dua kondisi ekstrem: bebas penuh dan terkekang penuh. Tumpuan parsial atau elastis tidak diinterpolasi; memerlukan model pegas. σ terkekang disembunyikan bila |σ| ≥ Sᵧ latihan. Pipa tekan dapat tertekuk sebelum luluh; tekuk belum dievaluasi. Tidak menghitung tekanan internal, gradien temperatur melintasi dinding, gesekan tumpuan, belokan atau ekspansi loop, fatigue termal, atau gaya pada nozel peralatan. Bukan analisis tegangan sistem perpipaan.',
    dataNote:'Data d, dᵢ, L, ΔT, E dan α berasal dari register M0 dan merupakan asumsi latihan.',
  },
  preset(context,dataset){return {support:'fixed',Sy_MPa:250,...dataset.cases.find(x=>x.id===`08-${context==='mesin'?'M':'K'}`).input};},
  presetNote:()=>'ΔT boleh positif (pemanasan), nol, atau negatif (pendinginan). α harus positif. Sᵧ 250 MPa adalah batas luluh latihan untuk menandai batas domain elastis, bukan sertifikat material.',
  evaluate:evaluateThermal,
  status:e=>e.status==='outside'?`Di luar domain elastis. ${e.reason}`:e.data.support==='free'?'Pipa bebas: berubah panjang tanpa tegangan aksial termal.':`Pipa terkekang: tegangan ${sense(e.result.sigma_fully_fixed_MPa)} dalam domain elastis latihan. Tekuk belum dievaluasi; tidak menyatakan pipa aman.`,
  lab:{title:'Pipa, tumpuan, dan perubahan panjang',render:pipeDiagram},
  scale:{label:'Perbesar perubahan panjang (mode bebas)',values:[1,50,200,500],default:200},
  buttons:[
    {id:'free',label:'Bebas memuai',run(api){api.setMode('free');}},
    {id:'fixed',label:'Terkekang penuh',run(api){api.setMode('fixed');}},
    {id:'flip',label:'Balik tanda ΔT',text:true,run(api){const t=api.get().deltaT_C;if(Number.isFinite(t))api.set('deltaT_C',-t);}},
  ],
  release:()=> 'deltaT_C',releaseLabel:'Kembalikan ke temperatur awal (ΔT = 0)',restoreLabel:'Pulihkan ΔT',
  graphs:[{title:'Tegangan terkekang terhadap perubahan temperatur',render:stressTemperatureGraph}],
  results(e){const r=e.result,fx=e.fixedElastic;return [['Luas penampang A',r.A_mm2,'mm²'],['Regangan termal bebas αΔT',r.thermal_strain,''],['δ bebas',r.delta_free_mm,'mm'],['σ bebas',r.sigma_free_MPa,'MPa'],['σ terkekang',fx?r.sigma_fully_fixed_MPa:null,'MPa'],['Sifat tegangan terkekang',fx?sense(r.sigma_fully_fixed_MPa):null,''],['|R| pada tumpuan',fx?r.reactionMagnitude_N/1000:null,'kN'],['δ terkekang',r.delta_fully_fixed_mm,'mm']];},
  variants:thermalVariants,
  variantIntro:()=>'Setiap baris mengubah satu hal dari kondisi aktif. Rasio terhadap kondisi aktif ditampilkan dalam kurung; rasio negatif berarti tanda berbalik.',
  variantColumns:[{title:'δ bebas',value:x=>x.result.delta_free_mm,unit:'mm'},{title:'σ terkekang',value:x=>x.fixedElastic?x.result.sigma_fully_fixed_MPa:null,unit:'MPa',missing:()=>'Di luar domain (|σ| ≥ Sᵧ)'},{title:'|R|',value:x=>x.fixedElastic?x.result.reactionMagnitude_N/1000:null,unit:'kN',missing:()=>'—'}],
  variantNote:'Perhatikan: L × 2 menggandakan δ bebas tetapi tidak mengubah σ terkekang. Dinding lebih tebal tidak menurunkan σ terkekang, tetapi memperbesar gaya pada tumpuan. Material dengan Eα lebih kecil memberi tegangan terkekang lebih kecil.',
  steps(e,raw,units){
    const d=e.data,r=e.result,fixed=d.support==='fixed';
    const conv=Object.entries(thermalFields).map(([k,fl])=>`${fl.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${unitOf(k)}`).join('<br>');
    return [
      ['Samakan satuan dan tetapkan tanda',eq(conv)+'<p>ΔT positif berarti dipanaskan, negatif berarti didinginkan. Konvensi tegangan: tarik positif, tekan negatif.</p>'],
      ['Hitung luas penampang pipa',eq(`A = π(d² − dᵢ²)/4 = π(${f(d.d_mm)}² − ${f(d.di_mm)}²)/4<br><strong>A = ${f(r.A_mm2)} mm²</strong>`)+'<p>Luas dibutuhkan untuk gaya pada tumpuan, tetapi tidak untuk tegangan terkekang.</p>'],
      ['Kondisi bebas: perubahan panjang tanpa tegangan',eq(`ε termal = αΔT = ${f(d.alpha_per_C)} × ${f(d.deltaT_C)} = ${f(r.thermal_strain)}<br>δ bebas = αΔT·L = ${f(r.thermal_strain)} × ${f(d.L_mm)}<br><strong>δ bebas = ${f(r.delta_free_mm)} mm</strong> · σ bebas = 0`)+'<p>Tanpa penahan, regangan termal terjadi sepenuhnya dan tidak ada gaya yang melawannya. Tegangan aksial nol.</p>'],
      ['Kondisi terkekang: kompatibilitas panjang',eq(`Panjang total ditahan: ε total = ε termal + ε mekanis = 0<br>ε mekanis = −αΔT = ${f(-r.thermal_strain)}<br>δ terkekang = 0`)+'<p>Tumpuan memaksa pipa kembali ke panjang awal. Regangan mekanis yang dibutuhkan sama besar dan berlawanan tanda dengan regangan termal.</p>'],
      ['Hitung tegangan dan gaya tumpuan terkekang',e.fixedElastic?eq(`σ = E·ε mekanis = −EαΔT = −${f(d.E_MPa)} × ${f(d.alpha_per_C)} × ${f(d.deltaT_C)}<br><strong>σ = ${f(r.sigma_fully_fixed_MPa)} MPa (${sense(r.sigma_fully_fixed_MPa)})</strong><br>|R| = |σ|·A = ${f(Math.abs(r.sigma_fully_fixed_MPa))} × ${f(r.A_mm2)} = <strong>${f(r.reactionMagnitude_N)} N</strong>`)+`<p>σ tidak bergantung pada L atau luas. ${r.reactionSense==='push'?'Pipa mendorong kedua tumpuan ke luar; tumpuan menekan pipa.':r.reactionSense==='pull'?'Pipa menarik kedua tumpuan ke dalam; tumpuan menarik pipa.':'Tanpa perubahan temperatur, tidak ada gaya tumpuan.'}</p>`:`<p class="outside-text">σ terkekang elastis akan mencapai ${f(r.sigma_fully_fixed_MPa)} MPa, yaitu ≥ Sᵧ latihan. Model elastis tidak berlaku, sehingga σ dan R tidak dilaporkan sebagai hasil.</p>`],
      ['Bandingkan kondisi aktif',`<p>Kondisi aktif: <strong>${supports[d.support]}</strong>. ${fixed?'Pipa tidak berubah panjang, tetapi menyimpan tegangan dan memberi gaya pada tumpuan.':'Pipa berubah panjang tanpa tegangan; tumpuan tidak menerima gaya aksial termal.'} Kenyataan biasanya berada di antara keduanya (tumpuan dan sambungan sedikit lentur), tetapi kondisi parsial memerlukan model kekakuan tumpuan.</p>`],
      ['Tafsirkan hasil dan batas kesimpulan','<p>Tegangan termal muncul karena pengekangan, bukan karena temperatur saja. Untuk mengurangi tegangan, perancang memberi ruang muai (loop, sambungan ekspansi, tumpuan geser). Pipa yang tertekan dapat tertekuk; tekuk, tekanan internal, fatigue termal dan gaya pada nozel belum dihitung. Hasil ini tidak menyatakan pipa aman.</p>'],
    ];
  },
  exercise:{
    data:thermalExercises,grade:gradeThermal,signNote:'Tuliskan tanda tegangan: tekan negatif, tarik positif.',
    labels:c=>c==='mesin'?['Perubahan panjang bebas δ (mm)','Tegangan terkekang σ (MPa, dengan tanda)']:['Tegangan terkekang σ (MPa, dengan tanda)','Gaya tumpuan |R| (kN)'],
    summary:x=>`Pipa baja d = ${f(x.d_mm)} mm, dᵢ = ${f(x.di_mm)} mm, L = ${f(x.L_mm)} mm; ΔT = ${f(x.deltaT_C)} °C (${x.deltaT_C>0?'dipanaskan':'didinginkan'}); E = ${f(x.E_MPa/1000)} GPa; α = ${f(x.alpha_per_C*1e6)} × 10⁻⁶/°C. Tinjau kondisi bebas dan terkekang penuh`,
    hint:(c,k)=>c==='mesin'?(k==='first'?'Belum tepat. δ = αΔT·L; tidak memerlukan E atau luas.':'Belum tepat. σ = −EαΔT; pemanasan pada pipa terkekang memberi tegangan tekan (negatif).'):(k==='first'?'Belum tepat. σ = −EαΔT; ΔT negatif (pendinginan) memberi tarik (positif).':'Belum tepat. |R| = |σ|·A dengan A = π(d² − dᵢ²)/4; ubah N menjadi kN.'),
  },
};
