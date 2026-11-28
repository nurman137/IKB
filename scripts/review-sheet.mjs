// Generates docs/tinjauan_dosen.md: a lecturer review sheet built from the site's own definitions, so every
// preset, criterion, exercise and expected answer shown is exactly what students see. Do not edit the output by
// hand; change the source and run `node scripts/review-sheet.mjs` again (CI checks it is up to date).
import {readFile,writeFile} from 'node:fs/promises';
import {exercises as axialExercises,evaluateAxial,prediction as axialPrediction} from '../web/axial-model.js';
import {foundationExercises,exerciseTargets} from '../web/foundation-model.js';
import {foundationContent} from '../web/foundation-content.js';
import {torsionExercises,torsionTargets,powerPresets,inactiveFields} from '../web/torsion-model.js';
import {torsionContent} from '../web/torsion-content.js';
import {bendingExercises,bendingTargets,udlPresets,slendernessLimit,inactiveBendingFields} from '../web/bending-model.js';
import {bendingContent} from '../web/bending-content.js';
import {sectionExercises,sectionTargets,profilePresets,inactiveSectionFields} from '../web/section-model.js';
import {sectionConfig} from '../web/section-lab.js';
import {thermalExercises,thermalTargets,aluminium} from '../web/thermal-model.js';
import {thermalConfig} from '../web/thermal-lab.js';
import {combinedExercises,combinedTargets} from '../web/combined-model.js';
import {combinedConfig} from '../web/combined-lab.js';
import {designExercises,designTargets} from '../web/design-model.js';
import {designConfig} from '../web/design-lab.js';
import {FE_QUESTIONS,FE_DEFAULT_QUESTION} from '../web/fe/learning.js';
import {modules} from '../web/model.js';

const f=n=>typeof n==='number'?new Intl.NumberFormat('id-ID',{maximumSignificantDigits:6}).format(n):String(n);
const cell=s=>String(s).replace(/\|/g,'\\|').replace(/\n/g,' ');
const table=(head,rows)=>[`| ${head.join(' | ')} |`,`| ${head.map(()=>'---').join(' | ')} |`,...rows.map(r=>`| ${r.map(cell).join(' | ')} |`)].join('\n');
const decision='☐ Setuju ☐ Perlu revisi';
const ctxName=c=>c==='mesin'?'Mesin':'Kapal';
// Show only the fields that are active for the exercise's mode, exactly as the page hides inactive ones.
const inactive=(id,x)=>new Set(id==='05'?inactiveFields(x.mode):id==='06'?inactiveBendingFields(x.load):id==='07'?inactiveSectionFields(x.shape):id==='04'&&x.n_planes===1?['t_each_outer_mm']:[]);
const inputs=(id,x)=>{const skip=inactive(id,x);return Object.entries(x).filter(([k])=>!skip.has(k)).map(([k,v])=>`${k}=${f(v)}`).join(', ');};

const exercisesByModule={
  '01':c=>[foundationExercises['01'][c],foundationContent['01'].answerLabels,exerciseTargets('01',c)],
  '02':c=>{const r=evaluateAxial(axialExercises[c]).result;return [axialExercises[c],['Tegangan σ (MPa)','Pertambahan panjang δ (mm)'],{first:r.sigma_MPa,second:r.delta_mm}];},
  '03':c=>[foundationExercises['03'][c],foundationContent['03'].answerLabels,exerciseTargets('03',c)],
  '04':c=>[foundationExercises['04'][c],foundationContent['04'].answerLabels,exerciseTargets('04',c)],
  '05':c=>[torsionExercises[c],torsionContent.answerLabels,torsionTargets(c)],
  '06':c=>[bendingExercises[c],bendingContent.answerLabels,bendingTargets(c)],
  '07':c=>[sectionExercises[c],sectionConfig.exercise.labels(c),sectionTargets(c)],
  '08':c=>[thermalExercises[c],thermalConfig.exercise.labels(c),thermalTargets(c)],
  '09':c=>[combinedExercises[c],combinedConfig.exercise.labels(c),combinedTargets(c)],
  '10':c=>[designExercises[c],designConfig(c).exercise.labels(c),designTargets(c)],
};
const predictionByModule={
  '01':foundationContent['01'],'03':foundationContent['03'],'04':foundationContent['04'],'05':torsionContent,'06':bendingContent,
  '07':sectionConfig.content,'08':thermalConfig.content,'09':combinedConfig.content,'10':designConfig('mesin').content,
};

const matrix=JSON.parse(await readFile('docs/fe/f0/case_matrix.json','utf8'));
const out=[];
out.push(`# Lembar tinjauan dosen — IKB Polibatam

Dihasilkan otomatis oleh \`node scripts/review-sheet.mjs\` dari kode situs (cabang FE). **Jangan diedit langsung**; angka di sini persis sama dengan yang dilihat mahasiswa. Bila ada yang perlu diubah, catat di kolom keputusan, lalu perubahan dilakukan di sumber dan lembar ini dibuat ulang.

**Cara memakai:** tandai setiap baris "Setuju" atau "Perlu revisi" dan tulis catatan singkat. Fokus utama: (1) kriteria latihan, (2) preset yang ditambahkan di luar register M0, (3) soal latihan dan kunci jawabannya, (4) pertanyaan prediksi. Rumus dan 133 nilai acuan M0 sudah diverifikasi otomatis dan tidak perlu dihitung ulang.

Toleransi penilaian latihan: 1% dari jawaban kunci (tanda ikut dinilai untuk tegangan termal). Semua data adalah asumsi latihan, bukan data material bersertifikat, kapal tertentu, atau aturan klasifikasi.`);

out.push(`## 1. Kriteria latihan dan batas model

${table(['Kriteria / batas','Nilai','Dipakai di','Keputusan','Catatan'],[
  ['Batas luluh latihan Sᵧ (default)','250 MPa','02, 03, 05–10',decision,''],
  ['Target faktor keamanan luluh','n ≥ 2','09, 10',decision,''],
  ['Batas sudut puntir poros','θ ≤ 2°','10 Mesin',decision,''],
  ['Batas lendutan balok geladak','δ ≤ L/1000 (2,5 mm pada L = 2,5 m)','10 Kapal',decision,''],
  ['Kelangsingan minimum Euler–Bernoulli',`L/h ≥ ${slendernessLimit}`,'06, 07, 10',decision,''],
  ['Batas regangan kecil','|σ|/E ≤ 1% (aksial/lentur), γ ≤ 1% (torsi)','02, 03, 05, 06, 07, 10',decision,''],
  ['Batas lendutan pedagogis balok','|δ|/L ≤ 2%','06, 07, 10',decision,''],
  ['Aturan keputusan Studio Desain','Hanya alternatif yang memenuhi semua kriteria; pilih yang lebih ringan, lalu margin kekuatan lebih besar','10',decision,''],
])}`);

const extra=[
  ['05 Torsi — preset daya–putaran',`Mesin ${f(powerPresets.mesin.P_W/1000)} kW @ ${f(powerPresets.mesin.n_rpm)} rpm; Kapal ${f(powerPresets.kapal.P_W/1000)} kW @ ${f(powerPresets.kapal.n_rpm)} rpm`],
  ['06 Lentur — beban merata',`Mesin ${f(udlPresets.mesin.w_N_per_mm)} kN/m; Kapal ${f(udlPresets.kapal.w_N_per_mm)} kN/m`],
  ['07 Penampang — profil I/T/pipa (Mesin)',Object.entries(profilePresets.mesin).map(([k,v])=>`${k}=${f(v)}`).join(', ')+' (tinggi h sama dengan persegi panjang M0)'],
  ['07 Penampang — profil I/T/pipa (Kapal)',Object.entries(profilePresets.kapal).map(([k,v])=>`${k}=${f(v)}`).join(', ')+' (tinggi h sama dengan persegi panjang M0)'],
  ['08 Temperatur — pembanding aluminium',`E = ${f(aluminium.E_MPa/1000)} GPa, α = ${f(aluminium.alpha_per_C*1e6)} × 10⁻⁶/°C`],
  ['10 Kapal — massa jenis','ρ = 7.850 kg/m³ (untuk massa; luas A dan B sama)'],
];
out.push(`## 2. Preset di luar register M0

### 2a. Kalkulator analitis

${table(['Preset','Nilai','Keputusan','Catatan'],extra.map(([a,b])=>[a,b,decision,'']))}

### 2b. Data tambahan untuk FE (dari spesifikasi F0)

${table(['Kasus','Model','Tambahan input FE','Keputusan','Catatan'],matrix.cases.filter(c=>c.additional_input&&Object.keys(c.additional_input).length).map(c=>[c.id,c.kernel,Object.entries(c.additional_input).map(([k,v])=>`${k}=${f(v)}`).join(', '),decision,'']))}`);

const exRows=[];
for(const m of modules)for(const c of ['mesin','kapal']){
  const [data,labels,target]=exercisesByModule[m.id](c);
  exRows.push([`${m.id}-${c==='mesin'?'M':'K'}`,m.title,inputs(m.id,data),`${labels[0]}: **${f(target.first)}**`,`${labels[1]}: **${f(target.second)}**`,decision,'']);
}
out.push(`## 3. Soal latihan mandiri dan kunci jawaban

Satuan inti: N, mm, MPa (input daya dalam W, putaran dalam rpm). Data latihan sengaja berbeda dari contoh interaktif.

${table(['Kasus','Modul','Data soal (satuan inti)','Jawaban 1','Jawaban 2','Keputusan','Catatan'],exRows)}`);

const predRows=modules.map(m=>{
  if(m.id==='02'){const a=axialPrediction('mesin','quarter'),b=axialPrediction('kapal','double-length');return [m.id,m.title,'Mesin: diameter dua kali lipat; Kapal: panjang dua kali lipat (berbeda per konteks)',`Mesin: ${a.explanation} Kapal: ${b.explanation}`,decision,''];}
  const c=predictionByModule[m.id],right=c.choices.find(([v])=>v===c.correct)?.[1];
  return [m.id,m.title,c.prediction,`**${right}** — ${c.explanation}`,decision,''];
});
out.push(`## 4. Pertanyaan prediksi (kalkulator analitis)

${table(['Modul','Judul','Pertanyaan','Jawaban tepat dan penjelasan','Keputusan','Catatan'],predRows)}`);

out.push(`## 5. Pertanyaan prediksi FE

Halaman FE setiap modul menampilkan satu pertanyaan prediksi dan satu cek pemahaman yang sama ("Saat hasil berbeda dari acuan, apa langkah pertama?" → periksa kesetaraan model, beban, tumpuan dan titik ukur).

${table(['Modul','Pertanyaan','Jawaban tepat','Pengecoh','Keputusan','Catatan'],modules.map(m=>{const q=FE_QUESTIONS[m.id]||FE_DEFAULT_QUESTION;return [m.id+(FE_QUESTIONS[m.id]?'':' (bawaan)'),q[0],q[1],q[2],decision,''];}))}`);

out.push(`## 6. Catatan umum peninjau

- Nama peninjau / tanggal:
- Keputusan rilis FE: ☐ Terbitkan ☐ Terbitkan sebagai beta ☐ Tunda (alasan):
- Catatan lain:
`);

await writeFile('docs/tinjauan_dosen.md',out.join('\n\n')+'\n');
console.log(`docs/tinjauan_dosen.md: ${exRows.length} soal latihan, ${predRows.length} prediksi analitis, ${modules.length} prediksi FE, ${matrix.cases.filter(c=>c.additional_input).length} kasus dengan tambahan input FE`);
