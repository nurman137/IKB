import {saveFamilyTransfer} from './fe/family-transfer.js';
import {progress} from './progress.js';
import {canonicalFrom,convertFrom,fmt} from './lab-core.js';
import {icon} from './figures.js';

// Configurable laboratory + calculation page used by modules 07–09. A config supplies the model,
// content, visuals and exercises; this file owns layout, state, persistence and event wiring.
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const plain=n=>new Intl.NumberFormat('en-US',{useGrouping:false,maximumSignificantDigits:16}).format(n);

function stepsHTML(cfg,e,raw,units,opened){
  if(e.status==='invalid')return '<p class="empty-result">Hitungan menunggu input yang valid. Hasil lama tidak dipakai.</p>';
  return cfg.steps(e,raw,units).map(([title,body],i)=>`<details class="step" data-step="${i}" ${opened.has(String(i))?'open':''}><summary><span class="step-number">${i+1}</span><span>${title}</span></summary><div class="step-body">${body}</div></details>`).join('');
}
function resultsHTML(cfg,e){
  if(e.status==='invalid')return '<p class="empty-result">Hasil numerik dibersihkan sampai input valid.</p>';
  return cfg.results(e).map(([title,n,unit])=>`<div><span>${title}</span><strong>${n===null||n===undefined?'Tidak dihitung':typeof n==='string'?esc(n):fmt(n)} ${n===null||n===undefined||typeof n==='string'?'':`<small>${unit}</small>`}</strong></div>`).join('');
}
function variantsHTML(cfg,e){
  const rows=cfg.variants(e);
  if(!rows)return '<p>Perbaiki input untuk membandingkan perubahan parameter.</p>';
  const base=rows[0][1];
  const cell=(col,x)=>{
    if(x.status==='invalid')return 'Tidak dapat dihitung';
    const n=col.value(x),b=col.value(base);
    if(n===null||n===undefined)return col.missing?col.missing(x):'Tidak dihitung';
    const ratio=col.ratio!==false&&b!==null&&b!==undefined&&b!==0&&Number.isFinite(n/b)?` <small>(${fmt(n/b)}×)</small>`:'';
    return `${fmt(n)} ${col.unit}${ratio}`;
  };
  return `<p class="small muted">${cfg.variantIntro(e)}</p><div class="table-scroll"><table><thead><tr><th>Kondisi</th>${cfg.variantColumns.map(c=>`<th>${c.title}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,x])=>`<tr><th>${label}</th>${cfg.variantColumns.map(c=>`<td>${cell(c,x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="small muted">${cfg.variantNote}</p>`;
}

export function mountLab(cfg,{shell,context,session,dataset,url,isCalculation}){
  const {id,prefix:p,fields:schema,content:c}=cfg,ctx=context==='mesin'?0:1,mode=cfg.mode;
  const preset=cfg.preset(context,dataset);
  const defaultUnits={};for(const [k,f] of Object.entries(schema))defaultUnits[k]=Object.keys(f.units)[0];
  const key=`ikb-lab-${id}-${context}`;
  let saved;try{saved=JSON.parse(session.get(key)||'null');}catch{}
  const raw={},units={};
  if(mode)raw[mode.key]=saved?.raw?.[mode.key] in mode.options?saved.raw[mode.key]:preset[mode.key];
  for(const [k,f] of Object.entries(schema)){
    units[k]=f.units[saved?.units?.[k]]?saved.units[k]:defaultUnits[k];
    raw[k]=typeof saved?.raw?.[k]==='string'?saved.raw[k]:plain(preset[k]/f.units[units[k]]);
  }
  let scale=cfg.scale&&cfg.scale.values.includes(saved?.scale)?saved.scale:cfg.scale?.default;
  const lastLoad={};
  const moduleURL=url(`modul/${id}/?kasus=${context}`),calcURL=url(`modul/${id}/perhitungan/${context}/`);
  const canonical=()=>canonicalFrom(schema,raw,units,mode?.key);
  const modeField=mode?`<div class="input-field"><label for="${p}-mode">${mode.label}</label><div class="input-wrap"><select id="${p}-mode" class="lab-mode" aria-describedby="${p}-mode-note">${Object.entries(mode.options).map(([v,label])=>`<option value="${v}" ${raw[mode.key]===v?'selected':''}>${label}</option>`).join('')}</select></div><p class="small muted field-note" id="${p}-mode-note">${mode.note}</p></div>`:'';
  const fieldsHTML=modeField+Object.entries(schema).map(([k,f])=>`<div class="input-field" id="${p}-wrap-${k}"><label for="${p}-${k}">${f.label}</label><div class="input-wrap"><input id="${p}-${k}" data-labfield="${k}" type="text" inputmode="decimal" autocomplete="off" value="${esc(raw[k])}" aria-describedby="${p}-error-${k}">${Object.keys(f.units).length>1?`<select data-labunit="${k}" aria-label="Satuan ${f.label}">${Object.keys(f.units).map(u=>`<option value="${u}" ${u===units[k]?'selected':''}>${u}</option>`).join('')}</select>`:`<span>${units[k]}</span>`}</div><p class="field-error" id="${p}-error-${k}" hidden></p></div>`).join('');
  const contextButtons=`<div class="segmented" role="group" aria-label="Pilih konteks kasus"><button data-context="mesin" aria-pressed="${context==='mesin'}">${icon('gear')}Teknik Mesin</button><button data-context="kapal" aria-pressed="${context==='kapal'}">${icon('ship')}Perkapalan</button></div>`;
  const prediction=`<section class="learning-box"><p class="eyebrow">PREDIKSI SEBELUM MENCOBA</p><h2>${c.prediction}</h2><form id="${p}-prediction"><fieldset><legend class="sr-only">Pilih prediksi</legend>${c.choices.map(([v,label])=>`<label class="choice"><input type="radio" name="prediction" value="${v}" required><span>${label}</span></label>`).join('')}</fieldset><button class="button secondary" type="submit">Periksa prediksi</button><p id="${p}-prediction-feedback" class="feedback" role="status"></p></form></section>`;
  const ex=cfg.exercise,exData=ex.data[context],labels=ex.labels(context);
  const practice=`<section class="learning-box practice" id="latihan"><p class="eyebrow">LATIHAN MANDIRI · ${context==='mesin'?'MESIN':'KAPAL'}</p><h2>Coba hitung sebelum membuka pembahasan.</h2><p>${ex.summary(exData)}. Data latihan berbeda dari contoh interaktif. Gunakan model ideal yang sama.</p><form id="${p}-exercise" novalidate><div class="practice-fields">${labels.map((label,i)=>`<div class="input-field"><label for="${p}-answer-${i?'second':'first'}">${label}</label><div class="input-wrap"><input id="${p}-answer-${i?'second':'first'}" name="${i?'second':'first'}" type="text" inputmode="decimal" autocomplete="off" aria-describedby="${p}-feedback-${i?'second':'first'}"></div><p class="answer-feedback" id="${p}-feedback-${i?'second':'first'}"></p></div>`).join('')}</div><p class="small muted">Toleransi jawaban 1%; koma atau titik desimal diterima. ${ex.signNote||''} Jangan gunakan pemisah ribuan.</p><button type="submit" class="button primary">Periksa jawaban</button><button type="button" id="${p}-show-solution" class="button secondary" hidden>Lihat pembahasan</button><p id="${p}-exercise-feedback" class="feedback" role="status"></p></form><div id="${p}-solution" hidden></div><label for="${p}-reflection" class="reflection-label">Refleksi: ${c.reflection}</label><textarea id="${p}-reflection" rows="3" placeholder="Jelaskan dengan bahasamu sendiri."></textarea><p class="small muted">Catatan tersimpan sementara pada sesi perangkat; bukan dikirim sebagai nilai kelas.</p></section>`;
  const controls=`<div class="foundation-controls">${cfg.scale?`<label for="${p}-scale">${cfg.scale.label}</label><select id="${p}-scale">${cfg.scale.values.map(s=>`<option value="${s}" ${s===scale?'selected':''}>${s}×</option>`).join('')}</select>`:''}${cfg.buttons.length?`<div class="experiment-buttons">${cfg.buttons.map(b=>`<button type="button" class="${b.text?'text-button':'button secondary'}" id="${p}-${b.id}">${b.label}</button>`).join('')}</div>`:''}</div>`;
  shell(`<a class="back-link" href="${isCalculation?moduleURL:url('')+'#modules'}">${isCalculation?`Kembali ke ${c.title}`:'Semua modul'}</a><div class="module-heading"><div><p class="eyebrow">${isCalculation?'CONTOH PERHITUNGAN':'LABORATORIUM INTERAKTIF'} · MODUL ${id}</p><h1>${isCalculation?c.names[ctx]:c.headline}</h1><p class="lead">${c.title} · amati, hitung, dan jelaskan.</p></div><span class="outline-pill">Modul aktif</span></div><div class="module-toolbar">${contextButtons}${id==='07'||id==='10'&&context==='kapal'?`<a id="lab-fe-link" class="button secondary" href="${url(`modul/${id}/fe/${context}/`)}">Eksplorasi FE 2D</a>`:''}<a class="button ${isCalculation?'secondary':'primary'}" href="${isCalculation?moduleURL:calcURL}">${isCalculation?'Buka laboratorium':'Contoh Perhitungan'}</a></div>${isCalculation?'':`<section class="context-brief"><div><p class="eyebrow">KASUS ${context==='mesin'?'TEKNIK MESIN':'PERKAPALAN'}</p><h2>${c.names[ctx]}</h2><p>${c.descriptions[ctx]}</p></div><div class="objective-compact"><strong>Pertanyaan utama</strong><p>${c.reflection}</p></div></section>${prediction}`}<div class="axial-assumptions">${icon('info')}${c.assumption}</div><div class="calculation-layout axial-layout lab-layout"><section class="input-panel"><div class="panel-heading"><h2>Atur kasus</h2><button type="button" class="text-button" id="${p}-reset">Reset contoh</button></div><p class="small muted">Gunakan angka tanpa pemisah ribuan. Satuan dapat dipilih tanpa mengubah besaran fisik.</p><form id="${p}-form" novalidate>${fieldsHTML}</form><div id="${p}-state" class="input-state" role="status" aria-live="polite"></div><details class="input-bounds"><summary>Batas model dan input</summary><p>${c.limitation}</p><p>${cfg.presetNote(preset)}</p></details></section><div class="calculation-main"><section class="axial-lab"><div class="panel-heading"><h2>${cfg.lab.title}</h2></div><div id="${p}-diagram"></div>${controls}${cfg.release?`<div class="experiment-buttons release-row"><button type="button" id="${p}-release" class="text-button">Lepas beban</button></div>`:''}</section><div id="${p}-results" class="axial-results"></div>${cfg.graphs.map((g,i)=>`<section class="graph-panel"><h2>${g.title}</h2><div id="${p}-graph-${i}"></div></section>`).join('')}<section class="lesson-panel"><h2>${cfg.variantTitle||'Coba ubah satu parameter'}</h2><div id="${p}-variants"></div></section><section class="steps"><div class="panel-heading"><h2>Penyelesaian bertahap</h2><button type="button" id="${p}-toggle-steps" class="text-button">Tampilkan semua langkah</button></div><div id="${p}-steps"></div></section><details class="model-note"><summary>Sumber, asumsi, dan batas kesimpulan</summary><p>${c.assumption}</p><p>${c.limitation}</p><p>${c.dataNote} Rujukan konsep: ${(c.sources||[[c.source,c.sourceLabel]]).map(([h,l])=>`<a href="${h}" target="_blank" rel="noopener">${l}</a>`).join('; ')}. Gambar dan penjelasan situs dibuat sendiri.</p></details></div></div>${isCalculation?`<section class="learning-box"><h2>Jelaskan hasil dengan alasan fisik.</h2><p>${c.reflection}</p><a class="button secondary" href="${moduleURL}#latihan">Kerjakan latihan mandiri</a></section>`:practice}`);

  const el=x=>document.getElementById(x);
  if(id==='07'||id==='10'&&context==='kapal')el('lab-fe-link').addEventListener('click',event=>{if(!saveFamilyTransfer(session,id,context,canonical())){event.preventDefault();el(`${p}-state`).textContent='Perbaiki input sebelum memindahkan data ke FE.';}});
  const persist=()=>session.set(key,JSON.stringify({raw,units,scale}));
  function update(){
    const input=canonical(),e=cfg.evaluate(input),skip=new Set(mode?mode.inactive(raw[mode.key]):[]);
    for(const k of Object.keys(schema)){
      el(`${p}-wrap-${k}`).hidden=skip.has(k);
      el(`${p}-${k}`).setAttribute('aria-invalid',String(Boolean(e.errors[k])));
      el(`${p}-error-${k}`).textContent=e.errors[k]||'';el(`${p}-error-${k}`).hidden=!e.errors[k];
    }
    const status=el(`${p}-state`);status.classList.toggle('invalid',e.status==='invalid'||e.status==='outside');
    status.textContent=e.status==='invalid'?(e.errors.numeric||'Perbaiki input yang ditandai.'):cfg.status(e);
    el(`${p}-diagram`).innerHTML=cfg.lab.render(e,scale);
    el(`${p}-results`).innerHTML=resultsHTML(cfg,e);
    cfg.graphs.forEach((g,i)=>{el(`${p}-graph-${i}`).innerHTML=g.render(e,scale);});
    el(`${p}-variants`).innerHTML=variantsHTML(cfg,e);
    const ds=[...el(`${p}-steps`).querySelectorAll('details')],opened=ds.length?new Set(ds.filter(x=>x.open).map(x=>x.dataset.step)):new Set(['0','1']);
    el(`${p}-steps`).innerHTML=stepsHTML(cfg,e,raw,units,opened);
    const toggle=el(`${p}-toggle-steps`);toggle.hidden=e.status==='invalid';const all=[...el(`${p}-steps`).querySelectorAll('details')];toggle.textContent=all.length&&all.every(x=>x.open)?'Ringkas langkah':'Tampilkan semua langkah';
    if(cfg.release){const k=cfg.release(raw[mode?.key]);el(`${p}-release`).textContent=input[k]===0?(cfg.restoreLabel||'Pulihkan beban'):(cfg.releaseLabel||'Lepas beban');}
    persist();
  }
  const api={
    get:canonical,mode:()=>raw[mode?.key],
    set(k,n){if(!Number.isFinite(n)||Math.abs(n)>schema[k].max)return false;raw[k]=plain(n/schema[k].units[units[k]]);el(`${p}-${k}`).value=raw[k];return true;},
    setMode(m){raw[mode.key]=m;el(`${p}-mode`).value=m;},
    update,
  };
  const form=el(`${p}-form`);form.addEventListener('submit',ev=>ev.preventDefault());
  form.addEventListener('input',ev=>{const k=ev.target.dataset.labfield;if(k){raw[k]=ev.target.value;update();}});
  form.addEventListener('change',ev=>{
    if(mode&&ev.target.id===`${p}-mode`){raw[mode.key]=ev.target.value;update();return;}
    const k=ev.target.dataset.labunit;if(!k)return;const target=ev.target.value,n=convertFrom(schema,k,raw[k],units[k],target);if(n!==null)raw[k]=plain(n);units[k]=target;el(`${p}-${k}`).value=raw[k];update();
  });
  el(`${p}-reset`).addEventListener('click',()=>{if(mode)api.setMode(preset[mode.key]);for(const k of Object.keys(schema)){units[k]=defaultUnits[k];raw[k]=plain(preset[k]/schema[k].units[units[k]]);el(`${p}-${k}`).value=raw[k];const sel=document.querySelector(`[data-labunit="${k}"]`);if(sel)sel.value=units[k];}for(const k of Object.keys(lastLoad))delete lastLoad[k];if(cfg.scale){scale=cfg.scale.default;el(`${p}-scale`).value=String(scale);}update();});
  if(cfg.release)el(`${p}-release`).addEventListener('click',()=>{const k=cfg.release(raw[mode?.key]),n=canonical()[k];if(Number.isFinite(n)&&n!==0){lastLoad[k]=n;api.set(k,0);}else api.set(k,lastLoad[k]??preset[k]);update();});
  el(`${p}-toggle-steps`).addEventListener('click',()=>{const ds=[...el(`${p}-steps`).querySelectorAll('details')],open=!ds.every(x=>x.open);ds.forEach(x=>x.open=open);el(`${p}-toggle-steps`).textContent=open?'Ringkas langkah':'Tampilkan semua langkah';});
  if(cfg.scale)el(`${p}-scale`).addEventListener('change',ev=>{scale=Number(ev.target.value);update();});
  for(const b of cfg.buttons)el(`${p}-${b.id}`).addEventListener('click',()=>{b.run(api);update();});
  if(!isCalculation){
    const pred=el(`${p}-prediction`);pred.addEventListener('submit',ev=>{ev.preventDefault();const choice=new FormData(pred).get('prediction');const good=choice===c.correct;el(`${p}-prediction-feedback`).textContent=choice?`${good?'Prediksimu tepat.':'Tinjau kembali hubungan antarbesaran.'} ${c.explanation}`:'Pilih satu jawaban dahulu.';el(`${p}-prediction-feedback`).classList.toggle('correct',good);if(choice)progress.record(id,context,'prediction',good);});
    const practiceForm=el(`${p}-exercise`);practiceForm.addEventListener('submit',ev=>{ev.preventDefault();const grades=ex.grade(context,Object.fromEntries(new FormData(practiceForm)));let count=0;for(const [k,g] of Object.entries(grades)){el(`${p}-answer-${k}`).setAttribute('aria-invalid',String(!g.valid));const fb=el(`${p}-feedback-${k}`);fb.textContent=!g.valid?'Masukkan jawaban numerik.':g.correct?'Benar dalam toleransi 1%.':ex.hint(context,k);fb.classList.toggle('wrong',!g.correct);if(g.correct)count++;}progress.record(id,context,'exercise',count);el(`${p}-exercise-feedback`).textContent=`${count} dari 2 jawaban benar. ${count===2?'Jelaskan alasan fisiknya pada refleksi.':'Perbaiki hitungan atau buka pembahasan setelah mencoba.'}`;el(`${p}-show-solution`).hidden=!Object.values(grades).every(g=>g.valid);el(`${p}-solution`).hidden=true;});
    el(`${p}-show-solution`).addEventListener('click',()=>{const rawEx=mode?{[mode.key]:exData[mode.key]}:{};for(const [k,f] of Object.entries(schema))rawEx[k]=plain(exData[k]/f.units[defaultUnits[k]]);el(`${p}-solution`).innerHTML=`<h3>Pembahasan latihan</h3>${stepsHTML(cfg,cfg.evaluate(exData),rawEx,defaultUnits,new Set(Array.from({length:12},(_,i)=>String(i))))}`;el(`${p}-solution`).hidden=false;});
    const reflection=el(`${p}-reflection`);reflection.value=session.get(`ikb-reflection-${id}-${context}`)||'';reflection.addEventListener('input',()=>{session.set(`ikb-reflection-${id}-${context}`,reflection.value);progress.record(id,context,'reflection',reflection.value.trim().length>0);});
  }
  update();
}
