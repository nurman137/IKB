import {bindFELink} from './fe-link.js';
import {progress} from './progress.js';
import {bendingFields,loadCases,inactiveBendingFields,udlPresets,canonicalBending,convertBendingUnit,evaluateBending,bendingVariants,bendingExercises,gradeBending} from './bending-model.js';
import {bendingContent as c,bendingSteps} from './bending-content.js';
import {loadedBeam,sectionStress,shearMomentCharts} from './bending-visuals.js';
import {icon} from './figures.js';

const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt=n=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:7}).format(n);
const plain=n=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumSignificantDigits:16}).format(n);
const scales=[1,100,500,1000];

function renderSteps(e,raw,units,opened){
  if(e.status==='invalid')return '<p class="empty-result">Hitungan menunggu input yang valid. Hasil lama tidak dipakai.</p>';
  return bendingSteps(e,raw,units).map(([title,body],i)=>`<details class="step" data-step="${i}" ${opened.has(String(i))?'open':''}><summary><span class="step-number">${i+1}</span><span>${title}</span></summary><div class="step-body">${body}</div></details>`).join('');
}
function exerciseSummary(x){
  const skip=new Set(inactiveBendingFields(x.load));
  return Object.entries(bendingFields).filter(([k])=>!skip.has(k)).map(([k,field])=>{const unit=Object.keys(field.units)[0];return `${field.label} = ${fmt(x[k]/field.units[unit])} ${unit}`;}).join('; ');
}
function resultsHTML(e){
  if(e.status==='invalid')return '<p class="empty-result">Hasil numerik dibersihkan sampai input valid.</p>';
  const r=e.result;
  const items=[['Reaksi Rᴀ = Rʙ',r.R_N/1000,'kN'],['Momen maksimum Mmax',r.Mmax_Nmm/1e6,'kN·m'],['Momen inersia I',r.I_mm4,'mm⁴'],['Modulus penampang Z',r.Z_mm3,'mm³'],['σmax serat bawah (tarik)',r.sigmaBottom_MPa,'MPa'],['σ serat atas (tekan)',r.sigmaTop_MPa,'MPa'],['Lendutan tengah δmax',r.deltaMax_mm,'mm'],['Rasio L/δ',r.spanOverDeflection,''],['Kelangsingan L/h',r.slenderness,'']];
  return items.map(([title,n,unit])=>`<div><span>${title}</span><strong>${n===null?'Tidak dihitung':fmt(n)} ${n===null?'':`<small>${unit}</small>`}</strong></div>`).join('');
}
function variantsHTML(e){
  const v=bendingVariants(e);
  if(!v)return '<p>Perbaiki input untuk membandingkan perubahan parameter.</p>';
  const [,base]=v[0];
  const ratio=(x,y)=>x===null||y===null||y===0?'':` <small>(${fmt(x/y)}×)</small>`;
  const cell=(n,b,u)=>n===null||n===undefined?'Tidak dihitung':`${fmt(n)} ${u}${ratio(n,b)}`;
  return `<p class="small muted">Setiap baris mengubah satu hal dari kondisi aktif; ${e.data.load==='udl'?'intensitas w':'beban P'} dan material tetap. Angka dalam kurung adalah rasio terhadap kondisi aktif.</p><div class="table-scroll"><table><thead><tr><th>Kondisi</th><th>σmax</th><th>δmax</th></tr></thead><tbody>${v.map(([label,x])=>`<tr><th>${label}</th><td>${x.status==='invalid'?'Tidak dapat dihitung':cell(x.result.sigmaMax_MPa,base.result.sigmaMax_MPa,'MPa')}</td><td>${x.status==='invalid'?'—':x.result.deltaMax_mm===null?(x.checks.slender?'Tidak dihitung (di luar domain model)':`Tidak dihitung (L/h = ${fmt(x.result.slenderness)} &lt; 10)`):cell(x.result.deltaMax_mm,base.result.deltaMax_mm,'mm')}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Luas penampang sama pada baris "Putar penampang", tetapi I berbeda: orientasi menentukan kekakuan lentur. δ tidak ditampilkan bila kondisi keluar dari domain model (σ ≥ Sᵧ, L/h &lt; 10, |σ|/E &gt; 1%, atau |δ|/L &gt; 2%). Pada kasus default, h × 2 membuat balok terlalu pendek untuk klaim lendutan; perbesar L untuk melihat δ/8. Tabel tidak menilai kelayakan balok.</p>`;
}

export function mountBending({shell,context,session,dataset,url,isCalculation}){
  const id='06',schema=bendingFields,ctx=context==='mesin'?0:1;
  const preset={load:'point',...udlPresets[context],Sy_MPa:250,...dataset.cases.find(x=>x.id===`06-${context==='mesin'?'M':'K'}`).input};
  const defaultUnits={};for(const [k,field] of Object.entries(schema))defaultUnits[k]=Object.keys(field.units)[0];
  const key=`ikb-bending-${context}`;
  let saved;try{saved=JSON.parse(session.get(key)||'null');}catch{}
  const raw={load:saved?.raw?.load in loadCases?saved.raw.load:preset.load},units={};
  for(const [k,field] of Object.entries(schema)){
    units[k]=field.units[saved?.units?.[k]]?saved.units[k]:defaultUnits[k];
    raw[k]=typeof saved?.raw?.[k]==='string'?saved.raw[k]:plain(preset[k]/field.units[units[k]]);
  }
  let scale=scales.includes(saved?.scale)?saved.scale:500;
  const loadKey=()=>raw.load==='udl'?'w_N_per_mm':'P_N';
  let lastLoad={P_N:preset.P_N,w_N_per_mm:preset.w_N_per_mm};
  const moduleURL=url(`modul/${id}/?kasus=${context}`),calcURL=url(`modul/${id}/perhitungan/${context}/`);
  const loadField=`<div class="input-field"><label for="bending-load">Konfigurasi beban</label><div class="input-wrap"><select id="bending-load" aria-describedby="bending-load-note">${Object.entries(loadCases).map(([v,label])=>`<option value="${v}" ${raw.load===v?'selected':''}>${label}</option>`).join('')}</select></div><p class="small muted field-note" id="bending-load-note">Rumus, diagram dan latihan berbeda untuk tiap konfigurasi.</p></div>`;
  const fields=loadField+Object.entries(schema).map(([k,field])=>`<div class="input-field" id="wrap-${k}"><label for="bending-${k}">${field.label}</label><div class="input-wrap"><input id="bending-${k}" data-bending="${k}" type="text" inputmode="decimal" autocomplete="off" value="${esc(raw[k])}" aria-describedby="error-${k}">${Object.keys(field.units).length>1?`<select data-bunit="${k}" aria-label="Satuan ${field.label}">${Object.keys(field.units).map(u=>`<option value="${u}" ${u===units[k]?'selected':''}>${u}</option>`).join('')}</select>`:`<span>${units[k]}</span>`}</div><p class="field-error" id="error-${k}" hidden></p></div>`).join('');
  const contextButtons=`<div class="segmented" role="group" aria-label="Pilih konteks kasus"><button data-context="mesin" aria-pressed="${context==='mesin'}">${icon('gear')}Teknik Mesin</button><button data-context="kapal" aria-pressed="${context==='kapal'}">${icon('ship')}Perkapalan</button></div>`;
  const prediction=`<section class="learning-box"><p class="eyebrow">PREDIKSI SEBELUM MENCOBA</p><h2>${c.prediction}</h2><form id="bending-prediction"><fieldset><legend class="sr-only">Pilih prediksi</legend>${c.choices.map(([v,label])=>`<label class="choice"><input type="radio" name="prediction" value="${v}" required><span>${label}</span></label>`).join('')}</fieldset><button class="button secondary" type="submit">Periksa prediksi</button><p id="bending-prediction-feedback" class="feedback" role="status"></p></form></section>`;
  const exercise=bendingExercises[context];
  const practice=`<section class="learning-box practice" id="latihan"><p class="eyebrow">LATIHAN MANDIRI · ${context==='mesin'?'MESIN':'KAPAL'}</p><h2>Coba hitung sebelum membuka pembahasan.</h2><p>Konfigurasi: ${loadCases[exercise.load].toLowerCase()}. ${exerciseSummary(exercise)}. Data latihan berbeda dari contoh interaktif. Gunakan model ideal yang sama.</p><form id="bending-exercise" novalidate><div class="practice-fields">${c.answerLabels.map((label,i)=>`<div class="input-field"><label for="answer-${i?'second':'first'}">${label}</label><div class="input-wrap"><input id="answer-${i?'second':'first'}" name="${i?'second':'first'}" type="text" inputmode="decimal" autocomplete="off" aria-describedby="feedback-${i?'second':'first'}"></div><p class="answer-feedback" id="feedback-${i?'second':'first'}"></p></div>`).join('')}</div><p class="small muted">Toleransi jawaban 1%; koma atau titik desimal diterima. Jangan gunakan pemisah ribuan.</p><button type="submit" class="button primary">Periksa jawaban</button><button type="button" id="bending-show-solution" class="button secondary" hidden>Lihat pembahasan</button><p id="bending-exercise-feedback" class="feedback" role="status"></p></form><div id="bending-solution" hidden></div><label for="bending-reflection" class="reflection-label">Refleksi: ${c.reflection}</label><textarea id="bending-reflection" rows="3" placeholder="Jelaskan dengan bahasamu sendiri."></textarea><p class="small muted">Catatan tersimpan sementara pada sesi perangkat; bukan dikirim sebagai nilai kelas.</p></section>`;
  const controls=`<div class="foundation-controls"><label for="bending-scale">Perbesar lendutan</label><select id="bending-scale">${scales.map(s=>`<option value="${s}" ${s===scale?'selected':''}>${s}×</option>`).join('')}</select><div class="experiment-buttons"><button type="button" class="button secondary" id="bending-double-h">Gandakan h</button><button type="button" class="button secondary" id="bending-rotate">Putar penampang (b ↔ h)</button></div></div>`;
  shell(`<a class="back-link" href="${isCalculation?moduleURL:url('')+'#modules'}">${isCalculation?`Kembali ke ${c.title}`:'Semua modul'}</a><div class="module-heading"><div><p class="eyebrow">${isCalculation?'CONTOH PERHITUNGAN':'LABORATORIUM INTERAKTIF'} · MODUL ${id}</p><h1>${isCalculation?c.names[ctx]:c.headline}</h1><p class="lead">${c.title} · amati, hitung, dan jelaskan.</p></div><span class="outline-pill">Modul aktif</span></div><div class="module-toolbar">${contextButtons}<a id="bending-fe-link" class="button secondary" href="${url(`modul/06/fe/${context}/`)}">Eksplorasi FE 2D</a><a class="button ${isCalculation?'secondary':'primary'}" href="${isCalculation?moduleURL:calcURL}">${isCalculation?'Buka laboratorium':'Contoh Perhitungan'}</a></div>${isCalculation?'':`<section class="context-brief"><div><p class="eyebrow">KASUS ${context==='mesin'?'TEKNIK MESIN':'PERKAPALAN'}</p><h2>${c.names[ctx]}</h2><p>${c.descriptions[ctx]}</p></div><div class="objective-compact"><strong>Pertanyaan utama</strong><p>${c.reflection}</p></div></section>${prediction}`}<div class="axial-assumptions">${icon('info')}${c.assumption}</div><div class="calculation-layout axial-layout bending-layout"><section class="input-panel"><div class="panel-heading"><h2>Atur kasus</h2><button type="button" class="text-button" id="bending-reset">Reset contoh</button></div><p class="small muted">Gunakan angka tanpa pemisah ribuan. Satuan dapat dipilih tanpa mengubah besaran fisik.</p><form id="bending-form" novalidate>${fields}</form><div id="bending-state" class="input-state" role="status" aria-live="polite"></div><details class="input-bounds"><summary>Batas model dan input</summary><p>${c.limitation}</p><p>Beban merata ${fmt(preset.w_N_per_mm)} kN/m adalah preset latihan; data M0 kasus ini hanya menetapkan beban titik di tengah. Beban dimasukkan sebagai besaran ke bawah; nol sah.</p></details></section><div class="calculation-main"><section class="axial-lab"><div class="panel-heading"><h2>Balok, beban, dan lendutan</h2></div><div id="bending-diagram"></div>${controls}<div class="experiment-buttons release-row"><button type="button" id="bending-release" class="text-button">Lepas beban</button></div></section><div id="bending-results" class="axial-results"></div><section class="graph-panel"><h2>Tegangan lentur pada penampang kritis</h2><div id="bending-section"></div></section><section class="graph-panel"><h2>Gaya geser dan momen lentur</h2><div id="bending-chart"></div></section><section class="lesson-panel"><h2>Coba ubah satu parameter</h2><div id="bending-variants"></div></section><section class="steps"><div class="panel-heading"><h2>Penyelesaian bertahap</h2><button type="button" id="bending-toggle-steps" class="text-button">Tampilkan semua langkah</button></div><div id="bending-steps"></div></section><details class="model-note"><summary>Sumber, asumsi, dan batas kesimpulan</summary><p>${c.assumption}</p><p>${c.limitation}</p><p>Data awal P, L, b, h dan E berasal dari register M0 dan merupakan asumsi latihan. Rujukan konsep: ${(c.sources||[[c.source,c.sourceLabel]]).map(([h,l])=>`<a href="${h}" target="_blank" rel="noopener">${l}</a>`).join('; ')}. Gambar dan penjelasan situs dibuat sendiri.</p></details></div></div>${isCalculation?`<section class="learning-box"><h2>Jelaskan hasil dengan alasan fisik.</h2><p>${c.reflection}</p><a class="button secondary" href="${moduleURL}#latihan">Kerjakan latihan mandiri</a></section>`:practice}`);

  const el=x=>document.getElementById(x);
  bindFELink(el('bending-fe-link'),async()=>{const {saveBendingTransfer}=await import('./fe/transfer.js');return saveBendingTransfer(session,context,canonicalBending(raw,units));},()=>{el('bending-state').textContent='Perbaiki input sebelum memindahkan data ke FE.';},()=>Promise.all([import('./fe/transfer.js')]));
  const persist=()=>session.set(key,JSON.stringify({raw,units,scale}));
  function update(){
    const input=canonicalBending(raw,units),e=evaluateBending(input),skip=new Set(inactiveBendingFields(raw.load));
    for(const k of Object.keys(schema)){
      el(`wrap-${k}`).hidden=skip.has(k);
      el(`bending-${k}`).setAttribute('aria-invalid',String(Boolean(e.errors[k])));
      el(`error-${k}`).textContent=e.errors[k]||'';el(`error-${k}`).hidden=!e.errors[k];
    }
    const status=el('bending-state');status.classList.toggle('invalid',e.status!=='valid');
    status.textContent=e.status==='invalid'?(e.errors.numeric||'Perbaiki input yang ditandai.'):e.status==='outside'?`Di luar domain model. ${e.reason}`:'Dalam domain model latihan. Kekuatan dan lendutan belum dinilai terhadap kriteria; tidak menyatakan balok aman.';
    el('bending-diagram').innerHTML=loadedBeam(e,scale);
    el('bending-results').innerHTML=resultsHTML(e);
    el('bending-section').innerHTML=sectionStress(e);
    el('bending-chart').innerHTML=shearMomentCharts(e);
    el('bending-variants').innerHTML=variantsHTML(e);
    const ds=[...el('bending-steps').querySelectorAll('details')],opened=ds.length?new Set(ds.filter(x=>x.open).map(x=>x.dataset.step)):new Set(['0','1']);
    el('bending-steps').innerHTML=renderSteps(e,raw,units,opened);
    const toggle=el('bending-toggle-steps');toggle.hidden=e.status==='invalid';const all=[...el('bending-steps').querySelectorAll('details')];toggle.textContent=all.length&&all.every(x=>x.open)?'Ringkas langkah':'Tampilkan semua langkah';
    el('bending-release').textContent=input[loadKey()]===0?'Pulihkan beban':'Lepas beban';
    persist();
  }
  function setValue(k,n){raw[k]=plain(n/schema[k].units[units[k]]);el(`bending-${k}`).value=raw[k];}
  const form=el('bending-form');form.addEventListener('submit',ev=>ev.preventDefault());
  form.addEventListener('input',ev=>{const k=ev.target.dataset.bending;if(k){raw[k]=ev.target.value;update();}});
  form.addEventListener('change',ev=>{
    if(ev.target.id==='bending-load'){raw.load=ev.target.value;update();return;}
    const k=ev.target.dataset.bunit;if(!k)return;const target=ev.target.value,n=convertBendingUnit(k,raw[k],units[k],target);if(n!==null)raw[k]=plain(n);units[k]=target;el(`bending-${k}`).value=raw[k];update();
  });
  el('bending-reset').addEventListener('click',()=>{raw.load=preset.load;el('bending-load').value=raw.load;for(const k of Object.keys(schema)){units[k]=defaultUnits[k];raw[k]=plain(preset[k]/schema[k].units[units[k]]);el(`bending-${k}`).value=raw[k];const sel=document.querySelector(`[data-bunit="${k}"]`);if(sel)sel.value=units[k];}lastLoad={P_N:preset.P_N,w_N_per_mm:preset.w_N_per_mm};scale=500;el('bending-scale').value='500';update();});
  el('bending-release').addEventListener('click',()=>{const k=loadKey(),n=canonicalBending(raw,units)[k];if(Number.isFinite(n)&&n>0){lastLoad[k]=n;setValue(k,0);}else setValue(k,lastLoad[k]);update();});
  el('bending-toggle-steps').addEventListener('click',()=>{const ds=[...el('bending-steps').querySelectorAll('details')],open=!ds.every(x=>x.open);ds.forEach(x=>x.open=open);el('bending-toggle-steps').textContent=open?'Ringkas langkah':'Tampilkan semua langkah';});
  el('bending-scale').addEventListener('change',ev=>{scale=Number(ev.target.value);update();});
  el('bending-double-h').addEventListener('click',()=>{const h=canonicalBending(raw,units).h_mm;if(Number.isFinite(h)&&h>0&&h*2<=schema.h_mm.max){setValue('h_mm',h*2);update();}});
  el('bending-rotate').addEventListener('click',()=>{const d=canonicalBending(raw,units);if(Number.isFinite(d.b_mm)&&Number.isFinite(d.h_mm)&&d.b_mm>0&&d.h_mm>0){setValue('b_mm',d.h_mm);setValue('h_mm',d.b_mm);update();}});
  if(!isCalculation){
    const pred=el('bending-prediction');pred.addEventListener('submit',ev=>{ev.preventDefault();const choice=new FormData(pred).get('prediction');const good=choice===c.correct;el('bending-prediction-feedback').textContent=choice?`${good?'Prediksimu tepat.':'Tinjau kembali hubungan antarbesaran.'} ${c.explanation}`:'Pilih satu jawaban dahulu.';el('bending-prediction-feedback').classList.toggle('correct',good);if(choice)progress.record('06',context,'prediction',good);});
    const practice=el('bending-exercise');practice.addEventListener('submit',ev=>{ev.preventDefault();const grades=gradeBending(context,Object.fromEntries(new FormData(practice)));let count=0;for(const [k,g] of Object.entries(grades)){el(`answer-${k}`).setAttribute('aria-invalid',String(!g.valid));const fb=el(`feedback-${k}`);fb.textContent=!g.valid?'Masukkan jawaban numerik.':g.correct?'Benar dalam toleransi 1%.':k==='first'?(exercise.load==='udl'?'Belum tepat. Gunakan Mmax = wL²/8 (1 kN/m = 1 N/mm), I = bh³/12, lalu σ = Mc/I.':'Belum tepat. Gunakan Mmax = PL/4, I = bh³/12 dan c = h/2.'):(exercise.load==='udl'?'Belum tepat. Gunakan δ = 5wL⁴/(384EI) dengan satuan N dan mm.':'Belum tepat. Gunakan δ = PL³/(48EI) dengan satuan N dan mm.');fb.classList.toggle('wrong',!g.correct);if(g.correct)count++;}progress.record('06',context,'exercise',count);el('bending-exercise-feedback').textContent=`${count} dari 2 jawaban benar. ${count===2?'Jelaskan alasan fisiknya pada refleksi.':'Perbaiki hitungan atau buka pembahasan setelah mencoba.'}`;el('bending-show-solution').hidden=!Object.values(grades).every(g=>g.valid);el('bending-solution').hidden=true;});
    el('bending-show-solution').addEventListener('click',()=>{const rawEx={load:exercise.load};for(const [k,field] of Object.entries(schema))rawEx[k]=plain(exercise[k]/field.units[defaultUnits[k]]);el('bending-solution').innerHTML=`<h3>Pembahasan latihan</h3>${renderSteps(evaluateBending(exercise),rawEx,defaultUnits,new Set(['0','1','2','3','4','5','6']))}`;el('bending-solution').hidden=false;});
    const reflection=el('bending-reflection');reflection.value=session.get(`ikb-reflection-${id}-${context}`)||'';reflection.addEventListener('input',()=>{session.set(`ikb-reflection-${id}-${context}`,reflection.value);progress.record('06',context,'reflection',reflection.value.trim().length>0);});
  }
  update();
}
