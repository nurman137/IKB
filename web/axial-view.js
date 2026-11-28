import {bindFELink} from './fe-link.js';
import {progress} from './progress.js';
import {axialFields,defaultUnits,toCanonical,convertUnit,evaluateAxial,exercises,gradeExercise,prediction} from './axial-model.js';
import {axialDiagram,elasticGraph} from './axial-visuals.js';
import {icon} from './figures.js';
import {readNumber} from './model.js';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d=6)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:d}).format(n);
const plain=n=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:16,useGrouping:false}).format(n);
const names={mesin:'Batang pengikat mesin',kapal:'Tie rod struktur kapal'};
const source='https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/96d197323da3b199ebd978a8cb06757d_lec8.pdf';

function sources(){return `<details class="model-note"><summary>Sumber, asumsi, dan batas model</summary><p>Batang pejal melingkar seragam, gaya tarik sentris, material homogen dan elastis linier. Panjang dan diameter mengacu pada keadaan awal; pengaruh ulir, lubang, konsentrasi tegangan, temperatur, dan kontraksi lateral tidak dihitung.</p><p>Sᵧ = 250 MPa pada preset hanyalah batas luluh latihan yang dapat diubah, bukan sertifikat material. Deformasi dihentikan saat σ ≥ Sᵧ atau ε > 1% (batas regangan kecil pedagogis). Pemeriksaan ini tidak menyatakan komponen aman untuk digunakan.</p><p>Data awal: register kasus M0 IKB (02-M dan 02-K). Model dasar dapat ditelusuri pada <a href="${source}" target="_blank" rel="noopener">MIT OpenCourseWare, Mechanics & Materials I, Lecture 8, halaman 4–6</a>. Penjelasan dan gambar situs disusun sendiri.</p></details>`;}

function steps(evaluation,raw,units,opened){
  if(evaluation.status==='invalid')return '<p class="empty-result">Langkah perhitungan menunggu input yang valid. Nilai lama tidak dipakai.</p>';
  const {data:d,result:r,status}=evaluation;
  const data=[
    ['Samakan satuan',`<div class="equation">F = ${esc(raw.F_N)} ${units.F_N} = ${fmt(d.F_N)} N<br>d = ${esc(raw.d_mm)} ${units.d_mm} = ${fmt(d.d_mm)} mm<br>L₀ = ${esc(raw.L_mm)} ${units.L_mm} = ${fmt(d.L_mm)} mm<br>E = ${esc(raw.E_MPa)} ${units.E_MPa} = ${fmt(d.E_MPa)} N/mm²</div><p>Gunakan N, mm, dan N/mm² secara konsisten. Satu MPa sama dengan satu N/mm²; satu GPa sama dengan 1.000 MPa.</p>`],
    ['Hitung luas penampang',`<div class="equation">A = πd² / 4<br>A = π × (${fmt(d.d_mm)} mm)² / 4<br><strong>A = ${fmt(r.A_mm2)} mm²</strong></div><p>Batang pejal berbentuk lingkaran. Luas bertambah sebanding kuadrat diameter, sehingga perubahan diameter berpengaruh besar pada hasil.</p>`],
    ['Hitung tegangan normal',`<div class="equation">σ = F / A<br>σ = ${fmt(d.F_N)} N / ${fmt(r.A_mm2)} mm²<br><strong>σ = ${fmt(r.sigma_MPa)} MPa</strong></div><p>Ini tegangan normal nominal pada bagian seragam, jauh dari penjepit atau sambungan. Angka tidak mencakup konsentrasi tegangan lokal.</p>`],
    ['Hitung regangan elastis',status==='valid'?`<div class="equation">ε = σ / E<br>ε = ${fmt(r.sigma_MPa)} / ${fmt(d.E_MPa)}<br><strong>ε = ${fmt(r.epsilon)} = ${fmt(r.epsilon_percent)}%</strong></div><p>Hukum Hooke menghubungkan tegangan dan regangan dalam daerah elastis linier. Regangan tidak bersatuan; kalikan 100 untuk menampilkannya dalam persen.</p>`:`<p class="outside-text">Tidak dihitung: ${evaluation.reason} Hubungan elastis tidak digunakan untuk memprediksi deformasi kondisi ini.</p>`],
    ['Hitung perubahan panjang',status==='valid'?`<div class="equation">δ = εL₀ = FL₀ / (AE)<br>δ = (${fmt(d.F_N)} × ${fmt(d.L_mm)}) / (${fmt(r.A_mm2)} × ${fmt(d.E_MPa)})<br><strong>δ = ${fmt(r.delta_mm)} mm</strong><br>L akhir = L₀ + δ = ${fmt(r.final_length_mm)} mm</div><p>Untuk beban dan penampang yang sama, batang lebih panjang memanjang lebih besar. Perhitungan memakai presisi penuh, meskipun angka tampilan dibulatkan.</p>`:'<p class="outside-text">Deformasi dan panjang akhir tidak ditampilkan di luar domain model. Perlu model material atau analisis lanjutan.</p>'],
    ['Baca makna hasil',status==='valid'?`<p>Pada F = <strong>${fmt(d.F_N/1000)} kN</strong>, batang menerima tegangan nominal <strong>${fmt(r.sigma_MPa)} MPa</strong> dan bertambah panjang <strong>${fmt(r.delta_mm)} mm</strong>.</p><p>${d.F_N===0?'Beban nol memberi tegangan, regangan, dan perubahan panjang nol. Dalam model elastis, melepas beban mengembalikan panjang awal.':'Mengubah L₀ mengubah δ, tetapi tidak mengubah σ untuk gaya tarik sentris yang ditentukan. Memperbesar d mengurangi σ dan δ.'}</p><p>Hasil berada dalam domain latihan yang ditetapkan. Ini belum pemeriksaan keselamatan atau kelayakan komponen nyata.</p>`:`<p>${evaluation.reason} Luas dan tegangan nominal masih ditampilkan; regangan, deformasi dan titik aktif grafik disembunyikan. Tidak ada prediksi perilaku plastis.</p>`],
  ];
  return data.map(([title,body],i)=>`<details class="step axial-step" data-step="${i}" ${opened.has(String(i))?'open':''}><summary><span class="step-number">${i+1}</span><span>${title}</span></summary><div class="step-body">${body}</div></details>`).join('');
}

function predictionHTML(context){
  const q=context==='mesin'?'Diameter batang diperbesar dua kali lipat. Pada F, L₀, dan E tetap, bagaimana tegangan dan pertambahan panjang berubah?':'Panjang tie rod menjadi dua kali lipat. Pada F, d, dan E tetap, apa yang berubah?';
  const options=context==='mesin'?[['same','Keduanya tetap'],['half','Keduanya menjadi setengah'],['quarter','Keduanya menjadi seperempat']]:[['same','Tegangan dan pertambahan panjang tetap'],['double-length','Tegangan tetap; pertambahan panjang dua kali lipat'],['double-both','Keduanya menjadi dua kali lipat']];
  return `<section class="learning-box"><p class="eyebrow">PREDIKSI SEBELUM MENCOBA</p><h2>${q}</h2><form id="prediction-form"><fieldset><legend class="sr-only">Pilih prediksimu</legend>${options.map(([value,label])=>`<label class="choice"><input type="radio" name="prediction" value="${value}" required><span>${label}</span></label>`).join('')}</fieldset><button class="button secondary" type="submit">Periksa prediksi</button><p id="prediction-feedback" class="feedback" role="status"></p></form></section>`;
}

function exerciseHTML(context){const d=exercises[context];return `<section class="learning-box practice"><p class="eyebrow">LATIHAN MANDIRI · ${context==='mesin'?'MESIN':'KAPAL'}</p><h2>Hitung dahulu, lalu periksa.</h2><p>${context==='mesin'?'Batang pengikat mesin':'Tie rod kapal'} menerima F = ${fmt(d.F_N/1000)} kN, d = ${d.d_mm} mm, L₀ = ${fmt(d.L_mm)} mm dan E = ${d.E_MPa/1000} GPa. Model elastis dan tarik sentris. Soal ini memakai data berbeda dari contoh interaktif.</p><form id="exercise-form" novalidate><div class="practice-fields"><div class="input-field"><label for="answer-sigma">Tegangan σ (MPa)</label><div class="input-wrap"><input id="answer-sigma" name="sigma" type="text" inputmode="decimal" autocomplete="off" aria-describedby="feedback-sigma"><span>MPa</span></div><p id="feedback-sigma" class="answer-feedback"></p></div><div class="input-field"><label for="answer-delta">Pertambahan panjang δ (mm)</label><div class="input-wrap"><input id="answer-delta" name="delta" type="text" inputmode="decimal" autocomplete="off" aria-describedby="feedback-delta"><span>mm</span></div><p id="feedback-delta" class="answer-feedback"></p></div></div><p class="small muted">Toleransi jawaban 1%. Koma dan titik desimal diterima; jangan gunakan pemisah ribuan.</p><button class="button primary" type="submit">Periksa jawaban</button><button id="show-solution" class="button secondary" type="button" hidden>Lihat pembahasan</button><p class="feedback" id="exercise-feedback" role="status"></p></form><div id="exercise-solution" hidden></div><label class="reflection-label" for="reflection">Refleksi: mengapa luas penampang memengaruhi kedua hasil itu?</label><textarea id="reflection" rows="3" placeholder="Tuliskan alasan fisiknya dengan bahasamu sendiri."></textarea><p class="small muted">Catatan ini disimpan sementara pada sesi perangkat, bukan dikirim sebagai nilai kelas.</p></section>`;}

export function mountAxial({shell,context,session,dataset,url,isCalculation}){
  const caseId=`02-${context==='mesin'?'M':'K'}`;
  const preset={...dataset.cases.find(c=>c.id===caseId).input,Sy_MPa:250};
  const key=`ikb-axial-${context}`;
  let saved;try{saved=JSON.parse(session.get(key)||'null');}catch{}
  let legacy;try{legacy=JSON.parse(session.get(`ikb-input-02-${context}`)||'null');}catch{}
  const units={...defaultUnits};
  const raw={};
  for(const [k,field] of Object.entries(axialFields)){
    if(saved?.units&&field.units[saved.units[k]])units[k]=saved.units[k];
    const legacyNumber=readNumber(legacy?.[k]);
    const n=legacy?.[k]!==undefined&&Number.isFinite(legacyNumber)?legacyNumber:preset[k];
    raw[k]=typeof saved?.raw?.[k]==='string'?saved.raw[k]:plain(n/field.units[units[k]]);
  }
  let scale=[1,100,500].includes(saved?.scale)?saved.scale:100;
  let savedForce=preset.F_N;
  const moduleURL=url(`modul/02/?kasus=${context}`);
  const calculationURL=url(`modul/02/perhitungan/${context}/`);
  const contextButtons=`<div class="segmented" role="group" aria-label="Pilih konteks kasus"><button data-context="mesin" aria-pressed="${context==='mesin'}">${icon('gear')}Teknik Mesin</button><button data-context="kapal" aria-pressed="${context==='kapal'}">${icon('ship')}Perkapalan</button></div>`;
  const fields=Object.entries(axialFields).map(([k,field])=>`<div class="input-field"><label for="axial-${k}">${field.label}</label><div class="input-wrap"><input id="axial-${k}" data-axial="${k}" value="${esc(raw[k])}" type="text" inputmode="decimal" autocomplete="off" aria-describedby="err-${k}"><select data-unit="${k}" aria-label="Satuan ${field.label}">${Object.keys(field.units).map(u=>`<option value="${u}" ${u===units[k]?'selected':''}>${u}</option>`).join('')}</select></div><p id="err-${k}" class="field-error" hidden></p></div>`).join('');
  shell(`<a class="back-link" href="${isCalculation?moduleURL:url('')+'#modules'}">${isCalculation?'Kembali ke Tegangan–Regangan':'Semua modul'}</a><div class="module-heading"><div><p class="eyebrow">${isCalculation?'CONTOH PERHITUNGAN':'LABORATORIUM INTERAKTIF'} · TEGANGAN–REGANGAN</p><h1>${isCalculation?names[context]:'Tarik. Amati. Pahami.'}</h1><p class="lead">${isCalculation?'Ikuti alur dari data hingga makna hasil. Semua langkah mengikuti angka yang kamu ubah.':'Hubungkan gaya, diameter, dan panjang dengan respons batang.'}</p></div><span class="outline-pill">Model elastis aktif</span></div><div class="module-toolbar">${contextButtons}<a id="axial-fe-link" class="button secondary" href="${url(`modul/02/fe/${context}/`)}">Eksplorasi FE AX2</a><a class="button ${isCalculation?'secondary':'primary'}" href="${isCalculation?moduleURL:calculationURL}">${isCalculation?'Buka laboratorium':'Contoh Perhitungan'}</a></div>${!isCalculation?`<section class="context-brief"><div><p class="eyebrow">KASUS ${context==='mesin'?'TEKNIK MESIN':'PERKAPALAN'}</p><h2>${names[context]}</h2><p>${context==='mesin'?'Batang pengikat menjaga dua bagian mesin tetap terhubung saat menerima gaya tarik. Tinjau bagian batang yang lurus dan seragam, jauh dari sambungannya.':'Tie rod menyalurkan gaya tarik pada struktur kapal. Tinjau segmen pejal seragam; pengaruh ulir, sambungan, dan lingkungan belum dimasukkan.'}</p></div><div class="objective-compact"><strong>Yang akan kamu pahami</strong><p>Gaya ≠ tegangan.<br>Regangan ≠ pertambahan panjang.<br>Dimensi ikut menentukan respons.</p></div></section>${predictionHTML(context)}`:''}<div class="axial-assumptions">${icon('info')}Tarik sentris · batang seragam · elastis linier · data latihan. Batas luluh bukan data material tersertifikasi.</div><div class="calculation-layout axial-layout"><section class="input-panel"><div class="panel-heading"><h2>Atur percobaan</h2><button class="text-button" id="axial-reset" type="button">Reset contoh</button></div><p class="small muted">Angka tanpa pemisah ribuan. Pilihan satuan mengubah penulisan, bukan besaran fisiknya.</p><form id="axial-form" novalidate>${fields}</form><div id="axial-input-state" class="input-state" role="status" aria-live="polite"></div><details class="input-bounds"><summary>Batas input latihan</summary><p>F: 0–10 juta N; d: &gt;0–100.000 mm; L₀: &gt;0–10 juta mm; E: &gt;0–10 juta MPa; Sᵧ: &gt;0–1 juta MPa. Ini batas numerik, bukan rekomendasi desain. Kombinasi ekstrem dapat ditolak.</p></details></section><div class="calculation-main"><section class="axial-lab"><div class="panel-heading"><h2>Beban dan perubahan bentuk</h2><label class="scale-control" for="deformation-scale">Perbesar deformasi<select id="deformation-scale">${[1,100,500].map(s=>`<option value="${s}" ${s===scale?'selected':''}>${s}×</option>`).join('')}</select></label></div><div id="axial-diagram"></div><div class="load-controls"><label for="force-range">Geser gaya tarik <strong id="load-label"></strong></label><input id="force-range" type="range" min="0" max="${preset.F_N*2}" step="100" value="0"><div class="experiment-buttons"><button type="button" class="button secondary" id="release-force">Lepas beban</button><button type="button" class="text-button" id="double-diameter">Coba diameter ×2</button></div></div></section><div id="axial-results" class="axial-results"></div><section class="graph-panel"><div class="panel-heading"><h2>Hubungan tegangan–regangan</h2><span class="small muted">σ = Eε</span></div><div id="axial-graph"></div></section><section class="steps"><div class="panel-heading"><h2>Penyelesaian bertahap</h2><button type="button" class="text-button" id="toggle-steps">Tampilkan semua langkah</button></div><div id="axial-steps"></div></section>${sources()}</div></div>${!isCalculation?`<section class="lesson-panel"><h2>Bedakan tiga besaran ini</h2><div class="concept-grid"><div><strong>Tegangan σ</strong><p>Gaya per luas penampang. Satuannya MPa atau N/mm²; besar gaya saja belum menjelaskan tingkat tegangan.</p></div><div><strong>Regangan ε</strong><p>Perubahan panjang dibagi panjang awal. Tidak bersatuan; misalnya 0,0003 setara 0,03%.</p></div><div><strong>Perubahan panjang δ</strong><p>Pertambahan ukuran dalam mm. Dua batang dengan regangan sama bisa memanjang berbeda jika panjang awalnya berbeda.</p></div></div></section>${exerciseHTML(context)}`:`<section class="learning-box"><h2>Coba jelaskan perubahan hasilnya</h2><p>Gunakan tombol diameter ×2 lalu amati σ dan δ. Kembalikan contoh awal, kemudian ubah hanya L₀. Parameter mana yang mengubah tegangan, dan mana yang hanya mengubah pertambahan panjang?</p><a class="button secondary" href="${moduleURL}#latihan">Kerjakan latihan mandiri</a></section>`}`);

  const byId=id=>document.getElementById(id);
  bindFELink(byId('axial-fe-link'),async()=>{const {saveAxisTransfer}=await import('./fe/axisymmetric-transfer.js');const {axisPreset}=await import('./fe/axisymmetric-case.js');return saveAxisTransfer(session,'02',context,{...axisPreset('02',context,dataset),...toCanonical(raw,units)});},()=>{byId('axial-input-state').textContent='Perbaiki input sebelum memindahkan data ke AX2.';},()=>Promise.all([import('./fe/axisymmetric-transfer.js'),import('./fe/axisymmetric-case.js')]));
  const persist=()=>session.set(key,JSON.stringify({raw,units,scale}));
  function update(){
    const e=evaluateAxial(toCanonical(raw,units));
    for(const k of Object.keys(axialFields)){
      const field=byId(`axial-${k}`),error=byId(`err-${k}`);
      field.setAttribute('aria-invalid',String(Boolean(e.errors[k])));error.hidden=!e.errors[k];error.textContent=e.errors[k]||'';
    }
    const state=byId('axial-input-state');
    state.textContent=e.status==='invalid'?(e.errors.numeric||'Perbaiki input yang ditandai.'):e.status==='outside'?`Di luar domain model. ${e.reason}`:'Dalam domain model latihan. Tidak menyatakan komponen aman.';
    state.classList.toggle('invalid',e.status!=='valid');
    byId('axial-diagram').innerHTML=axialDiagram(e,scale);
    byId('axial-graph').innerHTML=elasticGraph(e);
    const r=e.result;
    byId('axial-results').innerHTML=e.status==='invalid'?'<p class="empty-result">Hasil dibersihkan sampai semua input valid.</p>':[['Luas A',r.A_mm2,'mm²'],['Tegangan σ',r.sigma_MPa,'MPa'],['Regangan ε',r.epsilon_percent,'%'],['Pertambahan δ',r.delta_mm,'mm']].map(([name,n,unit])=>`<div><span>${name}</span><strong>${n===null?'Tidak dihitung':fmt(n)} ${n===null?'':`<small>${unit}</small>`}</strong></div>`).join('');
    const currentSteps=[...byId('axial-steps').querySelectorAll('details')];
    const opened=currentSteps.length?new Set(currentSteps.filter(d=>d.open).map(d=>d.dataset.step)):new Set(['0','1']);
    byId('axial-steps').innerHTML=steps(e,raw,units,opened);
    byId('toggle-steps').hidden=e.status==='invalid';
    byId('toggle-steps').textContent=opened.size===6?'Ringkas langkah':'Tampilkan semua langkah';
    const F=toCanonical(raw,units).F_N,slider=byId('force-range');
    slider.disabled=!Number.isFinite(F)||F<0||F>1e7;
    slider.max=String(slider.disabled?preset.F_N*2:Math.max(preset.F_N*2,F));
    slider.value=String(slider.disabled?0:F);byId('load-label').textContent=slider.disabled?'—':`${fmt(F/1000)} kN`;
    byId('release-force').textContent=F===0?'Pulihkan beban':'Lepas beban';
    persist();
  }
  function setValue(k,canonical){raw[k]=plain(canonical/axialFields[k].units[units[k]]);byId(`axial-${k}`).value=raw[k];update();}
  byId('axial-form').addEventListener('submit',e=>e.preventDefault());
  byId('axial-form').addEventListener('input',e=>{const k=e.target.dataset.axial;if(k){raw[k]=e.target.value;update();}});
  byId('axial-form').addEventListener('change',e=>{
    const k=e.target.dataset.unit;if(!k)return;
    const target=e.target.value,value=convertUnit(raw[k],k,units[k],target);
    if(value!==null)raw[k]=plain(value);
    units[k]=target;byId(`axial-${k}`).value=raw[k];update();
  });
  byId('force-range').addEventListener('input',e=>setValue('F_N',Number(e.target.value)));
  byId('release-force').addEventListener('click',()=>{const F=toCanonical(raw,units).F_N;if(Number.isFinite(F)&&F>0){savedForce=F;setValue('F_N',0);}else setValue('F_N',savedForce);});
  byId('double-diameter').addEventListener('click',()=>{const d=toCanonical(raw,units).d_mm;if(Number.isFinite(d)&&d>0)setValue('d_mm',d*2);});
  byId('deformation-scale').addEventListener('change',e=>{scale=Number(e.target.value);update();});
  byId('axial-reset').addEventListener('click',()=>{Object.assign(units,defaultUnits);for(const k of Object.keys(axialFields)){raw[k]=plain(preset[k]/axialFields[k].units[units[k]]);byId(`axial-${k}`).value=raw[k];document.querySelector(`[data-unit="${k}"]`).value=units[k];}savedForce=preset.F_N;scale=100;byId('deformation-scale').value='100';update();});
  byId('toggle-steps').addEventListener('click',()=>{const ds=[...byId('axial-steps').querySelectorAll('details')],open=!ds.every(d=>d.open);ds.forEach(d=>d.open=open);byId('toggle-steps').textContent=open?'Ringkas langkah':'Tampilkan semua langkah';});
  if(!isCalculation){
    const form=byId('prediction-form');
    form.addEventListener('submit',e=>{e.preventDefault();const choice=new FormData(form).get('prediction');const feedback=byId('prediction-feedback');if(!choice){feedback.textContent='Pilih satu prediksi dahulu.';return;}const r=prediction(context,choice);feedback.textContent=`${r.correct?'Prediksimu tepat.':'Coba tinjau hubungan antarbesaran.'} ${r.explanation}`;feedback.classList.toggle('correct',r.correct);progress.record('02',context,'prediction',r.correct);});
    const practice=byId('exercise-form'),solution=byId('exercise-solution');
    practice.closest('section').id='latihan';
    practice.addEventListener('submit',e=>{
      e.preventDefault();const data=Object.fromEntries(new FormData(practice)),grades=gradeExercise(context,data);
      let correct=0;
      for(const [k,g] of Object.entries(grades)){
        const field=byId(`answer-${k}`);field.setAttribute('aria-invalid',String(!g.valid));
        byId(`feedback-${k}`).textContent=!g.valid?'Masukkan jawaban numerik.':g.correct?'Benar dalam toleransi 1%.':k==='sigma'?'Belum tepat. Periksa luas πd²/4 dan konversi kN ke N.':'Belum tepat. Gunakan δ = FL₀/(AE) dan konversi GPa ke MPa.';
        byId(`feedback-${k}`).classList.toggle('wrong',!g.correct);
        if(g.correct)correct++;
      }
      progress.record('02',context,'exercise',correct);byId('exercise-feedback').textContent=`${correct} dari 2 jawaban benar. ${correct===2?'Jelaskan alasan fisiknya pada refleksi di bawah.':'Perbaiki langkahmu atau buka pembahasan setelah mencoba.'}`;
      byId('show-solution').hidden=!Object.values(grades).every(g=>g.valid);
      solution.hidden=true;
    });
    byId('show-solution').addEventListener('click',()=>{
      const input=exercises[context],exerciseRaw={};for(const k of Object.keys(axialFields))exerciseRaw[k]=plain(input[k]/axialFields[k].units[defaultUnits[k]]);
      solution.innerHTML=`<h3>Pembahasan latihan</h3>${steps(evaluateAxial(input),exerciseRaw,defaultUnits,new Set(['0','1','2','3','4','5']))}`;solution.hidden=false;
    });
    const reflection=byId('reflection');reflection.value=session.get(`ikb-reflection-02-${context}`)||'';
    reflection.addEventListener('input',()=>{session.set(`ikb-reflection-02-${context}`,reflection.value);progress.record('02',context,'reflection',reflection.value.trim().length>0);});
  }
  update();
}
