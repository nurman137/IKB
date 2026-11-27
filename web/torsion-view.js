import {torsionFields,torsionModes,inactiveFields,powerPresets,canonicalTorsion,convertTorsionUnit,evaluateTorsion,torsionVariants,torsionExercises,gradeTorsion} from './torsion-model.js';
import {torsionContent as c,torsionSteps} from './torsion-content.js';
import {shaftDiagram,shearDistribution} from './torsion-visuals.js';
import {icon} from './figures.js';
import {readNumber} from './model.js';

const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt=n=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:7}).format(n);
const plain=n=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumSignificantDigits:16}).format(n);
const scales=[1,10,20,40];

function renderSteps(e,raw,units,opened){
  if(e.status==='invalid')return '<p class="empty-result">Hitungan menunggu input yang valid. Hasil lama tidak dipakai.</p>';
  return torsionSteps(e,raw,units).map(([title,body],i)=>`<details class="step" data-step="${i}" ${opened.has(String(i))?'open':''}><summary><span class="step-number">${i+1}</span><span>${title}</span></summary><div class="step-body">${body}</div></details>`).join('');
}
function exerciseSummary(x){
  const skip=new Set(inactiveFields(x.mode));
  return Object.entries(torsionFields).filter(([k])=>!skip.has(k)).map(([k,field])=>{const unit=Object.keys(field.units)[0];return `${field.label} = ${fmt(x[k]/field.units[unit])} ${unit}`;}).join('; ');
}
function resultsHTML(e){
  if(e.status==='invalid')return '<p class="empty-result">Hasil numerik dibersihkan sampai input valid.</p>';
  const r=e.result,hollow=e.data.di_mm>0;
  const items=[['Torsi T',r.T_Nm,'N·m'],...(r.mode==='power'?[['Kecepatan sudut ω',r.omega_rad_s,'rad/s']]:[]),['Modulus geser G',r.G_MPa/1000,'GPa'],['Momen inersia polar J',r.J_mm4,'mm⁴'],['τ maksimum (permukaan)',r.tauMax_MPa,'MPa'],...(hollow?[['τ dinding dalam',r.tauInner_MPa,'MPa']]:[]),['Sudut puntir θ',r.theta_deg,'°'],['Sudut puntir θ',r.theta_rad,'rad'],['Regangan geser γmax',r.gammaMax,'']];
  return items.map(([title,n,unit])=>`<div><span>${title}</span><strong>${n===null?'Tidak dihitung':fmt(n)} ${n===null?'':`<small>${unit}</small>`}</strong></div>`).join('');
}
function variantsHTML(e){
  const v=torsionVariants(e);
  if(!v)return '<p>Perbaiki input untuk membandingkan perubahan parameter.</p>';
  const [,base]=v[0];
  const ratio=(x,y)=>x===null||y===null?'':y===0?'':` <small>(${fmt(x/y)}×)</small>`;
  const cell=(n,b,u)=>n===null||n===undefined?'Tidak dihitung':`${fmt(n)} ${u}${ratio(n,b)}`;
  return `<p class="small muted">Setiap baris mengubah satu hal dari kondisi aktif, dengan torsi T = ${fmt(base.result.T_Nm)} N·m dipertahankan. Angka dalam kurung adalah rasio terhadap kondisi aktif.</p><div class="table-scroll"><table><thead><tr><th>Kondisi</th><th>τmax</th><th>θ</th></tr></thead><tbody>${v.map(([label,x])=>`<tr><th>${label}</th><td>${x.status==='invalid'?'Tidak dapat dihitung':cell(x.result.tauMax_MPa,base.result.tauMax_MPa,'MPa')}</td><td>${x.status==='invalid'?'—':cell(x.result.theta_deg,base.result.theta_deg,'°')}</td></tr>`).join('')}</tbody></table></div><p class="small muted">θ tidak ditampilkan bila kondisi tersebut keluar dari domain elastis latihan. Tabel tidak menilai kelayakan poros.</p>`;
}

export function mountTorsion({shell,context,session,dataset,url,isCalculation}){
  const id='05',schema=torsionFields,ctx=context==='mesin'?0:1;
  const preset={mode:'torque',...powerPresets[context],Sy_MPa:250,...dataset.cases.find(x=>x.id===`05-${context==='mesin'?'M':'K'}`).input};
  const defaultUnits={};for(const [k,field] of Object.entries(schema))defaultUnits[k]=Object.keys(field.units)[0];
  const key=`ikb-torsion-${context}`;
  let saved;try{saved=JSON.parse(session.get(key)||'null');}catch{}
  const raw={mode:saved?.raw?.mode in torsionModes?saved.raw.mode:preset.mode},units={};
  for(const [k,field] of Object.entries(schema)){
    units[k]=field.units[saved?.units?.[k]]?saved.units[k]:defaultUnits[k];
    raw[k]=typeof saved?.raw?.[k]==='string'?saved.raw[k]:plain(preset[k]/field.units[units[k]]);
  }
  let scale=scales.includes(saved?.scale)?saved.scale:20;
  const loadKey=()=>raw.mode==='power'?'P_W':'T_Nmm';
  let lastLoad={T_Nmm:preset.T_Nmm,P_W:preset.P_W};
  const moduleURL=url(`modul/${id}/?kasus=${context}`),calcURL=url(`modul/${id}/perhitungan/${context}/`);
  const modeField=`<div class="input-field"><label for="torsion-mode">Sumber torsi</label><div class="input-wrap"><select id="torsion-mode" aria-describedby="torsion-mode-note">${Object.entries(torsionModes).map(([v,label])=>`<option value="${v}" ${raw.mode===v?'selected':''}>${label}</option>`).join('')}</select></div><p class="small muted field-note" id="torsion-mode-note">Pilih satu: torsi langsung atau T = P/ω.</p></div>`;
  const fields=modeField+Object.entries(schema).map(([k,field])=>`<div class="input-field" id="wrap-${k}"><label for="torsion-${k}">${field.label}</label><div class="input-wrap"><input id="torsion-${k}" data-torsion="${k}" type="text" inputmode="decimal" autocomplete="off" value="${esc(raw[k])}" aria-describedby="error-${k}">${Object.keys(field.units).length>1?`<select data-tunit="${k}" aria-label="Satuan ${field.label}">${Object.keys(field.units).map(u=>`<option value="${u}" ${u===units[k]?'selected':''}>${u}</option>`).join('')}</select>`:`<span>${units[k]}</span>`}</div><p class="field-error" id="error-${k}" hidden></p></div>`).join('');
  const contextButtons=`<div class="segmented" role="group" aria-label="Pilih konteks kasus"><button data-context="mesin" aria-pressed="${context==='mesin'}">${icon('gear')}Teknik Mesin</button><button data-context="kapal" aria-pressed="${context==='kapal'}">${icon('ship')}Perkapalan</button></div>`;
  const prediction=`<section class="learning-box"><p class="eyebrow">PREDIKSI SEBELUM MENCOBA</p><h2>${c.prediction}</h2><form id="torsion-prediction"><fieldset><legend class="sr-only">Pilih prediksi</legend>${c.choices.map(([v,label])=>`<label class="choice"><input type="radio" name="prediction" value="${v}" required><span>${label}</span></label>`).join('')}</fieldset><button class="button secondary" type="submit">Periksa prediksi</button><p id="torsion-prediction-feedback" class="feedback" role="status"></p></form></section>`;
  const exercise=torsionExercises[context];
  const practice=`<section class="learning-box practice" id="latihan"><p class="eyebrow">LATIHAN MANDIRI · ${context==='mesin'?'MESIN':'KAPAL'}</p><h2>Coba hitung sebelum membuka pembahasan.</h2><p>${exercise.mode==='power'?'Sumber torsi: daya dan putaran. ':'Sumber torsi: torsi langsung. '}${exerciseSummary(exercise)}. Data latihan berbeda dari contoh interaktif. Gunakan model ideal yang sama.</p><form id="torsion-exercise" novalidate><div class="practice-fields">${c.answerLabels.map((label,i)=>`<div class="input-field"><label for="answer-${i?'second':'first'}">${label}</label><div class="input-wrap"><input id="answer-${i?'second':'first'}" name="${i?'second':'first'}" type="text" inputmode="decimal" autocomplete="off" aria-describedby="feedback-${i?'second':'first'}"></div><p class="answer-feedback" id="feedback-${i?'second':'first'}"></p></div>`).join('')}</div><p class="small muted">Toleransi jawaban 1%; koma atau titik desimal diterima. Jangan gunakan pemisah ribuan.</p><button type="submit" class="button primary">Periksa jawaban</button><button type="button" id="torsion-show-solution" class="button secondary" hidden>Lihat pembahasan</button><p id="torsion-exercise-feedback" class="feedback" role="status"></p></form><div id="torsion-solution" hidden></div><label for="torsion-reflection" class="reflection-label">Refleksi: ${c.reflection}</label><textarea id="torsion-reflection" rows="3" placeholder="Jelaskan dengan bahasamu sendiri."></textarea><p class="small muted">Catatan tersimpan sementara pada sesi perangkat; bukan dikirim sebagai nilai kelas.</p></section>`;
  const controls=`<div class="foundation-controls"><label for="torsion-scale">Perbesar puntiran</label><select id="torsion-scale">${scales.map(s=>`<option value="${s}" ${s===scale?'selected':''}>${s}×</option>`).join('')}</select><div class="experiment-buttons"><button type="button" class="button secondary" id="torsion-solid">Pejal (dᵢ = 0)</button><button type="button" class="button secondary" id="torsion-hollow">Berongga (dᵢ = 0,6d)</button><button type="button" class="text-button" id="torsion-double-length">Gandakan L</button></div></div>`;
  shell(`<a class="back-link" href="${isCalculation?moduleURL:url('')+'#modules'}">${isCalculation?`Kembali ke ${c.title}`:'Semua modul'}</a><div class="module-heading"><div><p class="eyebrow">${isCalculation?'CONTOH PERHITUNGAN':'LABORATORIUM INTERAKTIF'} · MODUL ${id}</p><h1>${isCalculation?c.names[ctx]:c.headline}</h1><p class="lead">${c.title} · amati, hitung, dan jelaskan.</p></div><span class="outline-pill">Modul aktif</span></div><div class="module-toolbar">${contextButtons}<a class="button ${isCalculation?'secondary':'primary'}" href="${isCalculation?moduleURL:calcURL}">${isCalculation?'Buka laboratorium':'Contoh Perhitungan'}</a></div>${isCalculation?'':`<section class="context-brief"><div><p class="eyebrow">KASUS ${context==='mesin'?'TEKNIK MESIN':'PERKAPALAN'}</p><h2>${c.names[ctx]}</h2><p>${c.descriptions[ctx]}</p></div><div class="objective-compact"><strong>Pertanyaan utama</strong><p>${c.reflection}</p></div></section>${prediction}`}<div class="axial-assumptions">${icon('info')}${c.assumption}</div><div class="calculation-layout axial-layout torsion-layout"><section class="input-panel"><div class="panel-heading"><h2>Atur kasus</h2><button type="button" class="text-button" id="torsion-reset">Reset contoh</button></div><p class="small muted">Gunakan angka tanpa pemisah ribuan. Satuan dapat dipilih tanpa mengubah besaran fisik.</p><form id="torsion-form" novalidate>${fields}</form><div id="torsion-state" class="input-state" role="status" aria-live="polite"></div><details class="input-bounds"><summary>Batas model dan input</summary><p>${c.limitation}</p><p>Daya ${fmt(preset.P_W/1000)} kW pada ${fmt(preset.n_rpm)} rpm adalah preset latihan mode daya–putaran; data M0 kasus ini hanya menetapkan torsi langsung. Putaran harus lebih dari nol; daya nol sah. Arah putar tidak dibedakan: T dan P dimasukkan sebagai besaran.</p></details></section><div class="calculation-main"><section class="axial-lab"><div class="panel-heading"><h2>Poros, torsi, dan sudut puntir</h2></div><div id="torsion-diagram"></div>${controls}<div class="experiment-buttons release-row"><button type="button" id="torsion-release" class="text-button">Lepas beban</button></div></section><div id="torsion-results" class="axial-results"></div><section class="graph-panel"><h2>Distribusi tegangan geser pada penampang</h2><div id="torsion-chart"></div></section><section class="lesson-panel"><h2>Coba ubah satu parameter</h2><div id="torsion-variants"></div></section><section class="steps"><div class="panel-heading"><h2>Penyelesaian bertahap</h2><button type="button" id="torsion-toggle-steps" class="text-button">Tampilkan semua langkah</button></div><div id="torsion-steps"></div></section><details class="model-note"><summary>Sumber, asumsi, dan batas kesimpulan</summary><p>${c.assumption}</p><p>${c.limitation}</p><p>Data awal T, d, dᵢ, L, E dan ν berasal dari register M0 dan merupakan asumsi latihan. Rujukan konsep: <a href="${c.source}" target="_blank" rel="noopener">${c.sourceLabel}</a>. Gambar dan penjelasan situs dibuat sendiri.</p></details></div></div>${isCalculation?`<section class="learning-box"><h2>Jelaskan hasil dengan alasan fisik.</h2><p>${c.reflection}</p><a class="button secondary" href="${moduleURL}#latihan">Kerjakan latihan mandiri</a></section>`:practice}`);

  const el=x=>document.getElementById(x);
  const persist=()=>session.set(key,JSON.stringify({raw,units,scale}));
  function update(){
    const input=canonicalTorsion(raw,units),e=evaluateTorsion(input),skip=new Set(inactiveFields(raw.mode));
    for(const k of Object.keys(schema)){
      el(`wrap-${k}`).hidden=skip.has(k);
      el(`torsion-${k}`).setAttribute('aria-invalid',String(Boolean(e.errors[k])));
      el(`error-${k}`).textContent=e.errors[k]||'';el(`error-${k}`).hidden=!e.errors[k];
    }
    const status=el('torsion-state');status.classList.toggle('invalid',e.status!=='valid');
    status.textContent=e.status==='invalid'?(e.errors.numeric||'Perbaiki input yang ditandai.'):e.status==='outside'?`Di luar domain elastis. ${e.reason}`:'Dalam domain elastis latihan. Tidak menyatakan poros aman.';
    el('torsion-diagram').innerHTML=shaftDiagram(e,scale);
    el('torsion-results').innerHTML=resultsHTML(e);
    el('torsion-chart').innerHTML=shearDistribution(e);
    el('torsion-variants').innerHTML=variantsHTML(e);
    const ds=[...el('torsion-steps').querySelectorAll('details')],opened=ds.length?new Set(ds.filter(x=>x.open).map(x=>x.dataset.step)):new Set(['0','1']);
    el('torsion-steps').innerHTML=renderSteps(e,raw,units,opened);
    const toggle=el('torsion-toggle-steps');toggle.hidden=e.status==='invalid';const all=[...el('torsion-steps').querySelectorAll('details')];toggle.textContent=all.length&&all.every(x=>x.open)?'Ringkas langkah':'Tampilkan semua langkah';
    el('torsion-release').textContent=input[loadKey()]===0?'Pulihkan beban':'Lepas beban';
    persist();
  }
  function setValue(k,n){raw[k]=plain(n/schema[k].units[units[k]]);el(`torsion-${k}`).value=raw[k];update();}
  const form=el('torsion-form');form.addEventListener('submit',ev=>ev.preventDefault());
  form.addEventListener('input',ev=>{const k=ev.target.dataset.torsion;if(k){raw[k]=ev.target.value;update();}});
  form.addEventListener('change',ev=>{
    if(ev.target.id==='torsion-mode'){raw.mode=ev.target.value;update();return;}
    const k=ev.target.dataset.tunit;if(!k)return;const target=ev.target.value,n=convertTorsionUnit(k,raw[k],units[k],target);if(n!==null)raw[k]=plain(n);units[k]=target;el(`torsion-${k}`).value=raw[k];update();
  });
  el('torsion-reset').addEventListener('click',()=>{raw.mode=preset.mode;el('torsion-mode').value=raw.mode;for(const k of Object.keys(schema)){units[k]=defaultUnits[k];raw[k]=plain(preset[k]/schema[k].units[units[k]]);el(`torsion-${k}`).value=raw[k];const sel=document.querySelector(`[data-tunit="${k}"]`);if(sel)sel.value=units[k];}lastLoad={T_Nmm:preset.T_Nmm,P_W:preset.P_W};scale=20;el('torsion-scale').value='20';update();});
  el('torsion-release').addEventListener('click',()=>{const k=loadKey(),n=canonicalTorsion(raw,units)[k];if(Number.isFinite(n)&&n>0){lastLoad[k]=n;setValue(k,0);}else setValue(k,lastLoad[k]);});
  el('torsion-toggle-steps').addEventListener('click',()=>{const ds=[...el('torsion-steps').querySelectorAll('details')],open=!ds.every(x=>x.open);ds.forEach(x=>x.open=open);el('torsion-toggle-steps').textContent=open?'Ringkas langkah':'Tampilkan semua langkah';});
  el('torsion-scale').addEventListener('change',ev=>{scale=Number(ev.target.value);update();});
  el('torsion-solid').addEventListener('click',()=>setValue('di_mm',0));
  el('torsion-hollow').addEventListener('click',()=>{const d=canonicalTorsion(raw,units).d_mm;if(Number.isFinite(d)&&d>0)setValue('di_mm',.6*d);});
  el('torsion-double-length').addEventListener('click',()=>{const L=canonicalTorsion(raw,units).L_mm;if(Number.isFinite(L)&&L>0&&L*2<=schema.L_mm.max)setValue('L_mm',L*2);});
  if(!isCalculation){
    const pred=el('torsion-prediction');pred.addEventListener('submit',ev=>{ev.preventDefault();const choice=new FormData(pred).get('prediction');const good=choice===c.correct;el('torsion-prediction-feedback').textContent=choice?`${good?'Prediksimu tepat.':'Tinjau kembali hubungan antarbesaran.'} ${c.explanation}`:'Pilih satu jawaban dahulu.';el('torsion-prediction-feedback').classList.toggle('correct',good);});
    const practice=el('torsion-exercise');practice.addEventListener('submit',ev=>{ev.preventDefault();const grades=gradeTorsion(context,Object.fromEntries(new FormData(practice)));let count=0;for(const [k,g] of Object.entries(grades)){el(`answer-${k}`).setAttribute('aria-invalid',String(!g.valid));const fb=el(`feedback-${k}`);fb.textContent=!g.valid?'Masukkan jawaban numerik.':g.correct?'Benar dalam toleransi 1%.':k==='first'?(exercise.mode==='power'?'Belum tepat. Hitung T = P/ω dengan ω = 2πn/60, lalu τ = Tc/J; perhatikan N·m → N·mm.':'Belum tepat. Untuk poros berongga, J = π(d⁴ − dᵢ⁴)/32 dan c = d/2.'):'Belum tepat. Hitung G = E/[2(1+ν)], θ = TL/(GJ) dalam radian, lalu kalikan 180/π.';fb.classList.toggle('wrong',!g.correct);if(g.correct)count++;}el('torsion-exercise-feedback').textContent=`${count} dari 2 jawaban benar. ${count===2?'Jelaskan alasan fisiknya pada refleksi.':'Perbaiki hitungan atau buka pembahasan setelah mencoba.'}`;el('torsion-show-solution').hidden=!Object.values(grades).every(g=>g.valid);el('torsion-solution').hidden=true;});
    el('torsion-show-solution').addEventListener('click',()=>{const rawEx={mode:exercise.mode};for(const [k,field] of Object.entries(schema))rawEx[k]=plain(exercise[k]/field.units[defaultUnits[k]]);el('torsion-solution').innerHTML=`<h3>Pembahasan latihan</h3>${renderSteps(evaluateTorsion(exercise),rawEx,defaultUnits,new Set(['0','1','2','3','4','5','6']))}`;el('torsion-solution').hidden=false;});
    const reflection=el('torsion-reflection');reflection.value=session.get(`ikb-reflection-${id}-${context}`)||'';reflection.addEventListener('input',()=>session.set(`ikb-reflection-${id}-${context}`,reflection.value));
  }
  update();
}
