import {foundationFields} from './foundation-model.js';
import {readNumber} from './model.js';
const f=(n)=>new Intl.NumberFormat('id-ID',{maximumSignificantDigits:7}).format(n);
const eq=s=>`<div class="equation">${s}</div>`;

export const foundationContent={
  '01':{
    title:'Membaca Beban',headline:'Kenali gaya. Baca keseimbangannya.',names:['Balok penyangga alat produksi','Balok geladak penyangga peralatan'],
    descriptions:['Balok sederhana menopang peralatan produksi. Geser posisi beban untuk melihat bagaimana reaksi tumpuan berubah.','Balok geladak diidealkan sebagai sendi–rol dan menerima satu beban peralatan. Tinjau keseimbangan tanpa menganggap ini model lengkap struktur kapal.'],
    assumption:'Balok sendi–rol, satu beban titik ke bawah, statis, berat sendiri diabaikan. Belum menghitung tegangan lentur atau lendutan.',
    prediction:'Beban digeser mendekati tumpuan kiri dengan besar P dan bentang tetap. Apa yang terjadi?',
    choices:[['left','Reaksi kiri membesar; reaksi kanan mengecil'],['right','Reaksi kanan membesar; reaksi kiri mengecil'],['same','Keduanya tetap sama']],correct:'left',
    explanation:'Dari ΣMᴀ = 0, Rʙ = Pa/L. Ketika a mengecil, Rʙ mengecil; karena Rᴀ + Rʙ = P, Rᴀ membesar.',
    answerLabels:['Reaksi kiri Rᴀ (kN)','Reaksi kanan Rʙ (kN)'],
    reflection:'Mengapa jumlah reaksi tetap sama walaupun posisi beban berubah?',
    source:'https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/0b739c732b57ee6d4221b5cfce732769_lec5.pdf',sourceLabel:'MIT OCW, Mechanics & Materials I, Lecture 5',
    limitation:'Tanda V mengikuti resultan gaya pada bagian kiri potongan; M positif adalah sagging. Tepat pada gaya titik, V kiri dan kanan dapat berbeda. Di luar ujung balok V nol. Tumpuan sendi/rol mempunyai momen ujung nol; tidak ada evaluasi stabilitas atau kekuatan struktur.',
  },
  '03':{
    title:'Elastisitas & Hukum Hooke',headline:'Kaku berbeda dengan kuat.',names:['Batang penarik mekanisme mesin','Batang penggantung platform kapal'],
    descriptions:['Bandingkan kekakuan batang penarik ketika E berubah. Amati perubahan panjang dan diameter dalam model elastis.','Segmen batang penggantung menerima tarik sentris. Hubungkan perubahan ukuran, rasio Poisson, dan energi elastis yang tersimpan.'],
    assumption:'Batang pejal seragam, tarik sentris, elastis linier isotropik. E dan batas luluh adalah dua sifat berbeda; nilai yang disediakan merupakan data latihan.',
    prediction:'E diperbesar dua kali lipat pada F, d, L₀ dan ν tetap. Bagaimana tegangan dan deformasi aksial berubah?',
    choices:[['half','Tegangan tetap; deformasi menjadi setengah'],['double','Tegangan dan deformasi menjadi dua kali lipat'],['strong','Tegangan menjadi setengah; kekuatan pasti meningkat']],correct:'half',
    explanation:'Untuk gaya yang ditentukan, σ = F/A tetap. Kekuatan tidak ditentukan oleh E. Karena k = AE/L₀ dan δ = F/k, E dua kali lipat membuat k dua kali lipat dan δ setengah.',
    answerLabels:['Pertambahan panjang δ (mm)','Energi elastis U (J)'],reflection:'Apa bedanya modulus material E dengan kekakuan komponen k?',
    source:'https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/96d197323da3b199ebd978a8cb06757d_lec8.pdf',sourceLabel:'MIT OCW, Mechanics & Materials I, Lecture 8, halaman PDF 4–6',
    limitation:'ν dibatasi 0 ≤ ν < 0,5 untuk material latihan ini. Hubungan G = E/[2(1+ν)] berlaku pada elastisitas isotropik. Sy default 250 MPa merupakan batas luluh latihan, bukan sertifikat material. Deformasi/energi disembunyikan saat σ ≥ Sy atau ε > 1%. Bukan model plastis atau evaluasi keselamatan komponen.',
  },
  '04':{
    title:'Geser & Sambungan',headline:'Hitung bidangnya. Pisahkan tegangannya.',names:['Pin mekanisme pengangkat','Pin clevis pada padeye ideal'],
    descriptions:['Pin diidealkan menerima geser tunggal pada sambungan lap. Hitung tegangan rata-rata pin dan tumpu pada pelat.','Pin clevis menerima dua bidang geser simetris. Pelat tengah menerima F penuh, sementara tiap pelat luar menerima F/2.'],
    assumption:'Tegangan rata-rata/nominal; geser tunggal atau ganda simetris. Geser pin dan tumpu pelat dihitung terpisah. Belum menilai kapasitas angkat atau kelayakan sambungan.',
    prediction:'Jumlah bidang geser berubah dari satu menjadi dua, pada F dan d tetap. Apa yang terjadi pada tegangan geser pin?',
    choices:[['half','Menjadi setengah, jika pembagian beban simetris'],['same','Tetap sama'],['double','Menjadi dua kali lipat']],correct:'half',
    explanation:'Luas total penahan geser berubah dari A menjadi 2A, sehingga τ rata-rata = F/(mA) menjadi setengah. Pelat tengah tetap menerima F penuh; tegangan tumpunya tidak otomatis dibagi dua.',
    answerLabels:['Geser pin τ rata-rata (MPa)','Tumpu pelat tengah / pelat σb (MPa)'],reflection:'Mengapa dua bidang geser tidak otomatis mengurangi gaya pada pelat tengah menjadi F/2?',
    source:'https://wp.optics.arizona.edu/optomech/wp-content/uploads/sites/53/2016/10/OPTI_222_W1.pdf',sourceLabel:'University of Arizona, OPTI 222, Concepts of Stress and Strain, halaman PDF 3–5',
    limitation:'Pin pejal melingkar, gaya terbagi ideal, kontak memakai luas proyeksi t×d. Pada mode tunggal kedua pelat diasumsikan sama tebal; eksentrisitas dan lentur pin diabaikan. Pada mode ganda kedua pelat luar sama tebal. Tidak menghitung clearance, konsentrasi tegangan, sobek tepi, penampang netto, las, fatigue atau distribusi kontak lokal. Bukan sertifikasi padeye, shackle atau SWL.',
  },
};

export function foundationSteps(id,e,raw,units){
  if(e.status==='invalid')return [];
  const d=e.data,r=e.result;
  const conversion=Object.entries(foundationFields[id]).filter(([k])=>!(id==='04'&&d.n_planes===1&&k==='t_each_outer_mm')).map(([k,field])=>`${field.label}: ${f(readNumber(raw[k]))} ${units[k]} = ${f(d[k])} ${k.endsWith('_N')?'N':k.endsWith('_mm')?'mm':k.endsWith('_MPa')?'MPa':''}`).join('<br>');
  const start=['Samakan satuan dan model',eq(conversion)+'<p>Hitungan inti memakai N, mm dan MPa. Diagram mengikuti model ideal yang dinyatakan, bukan bentuk atau kontak nyata yang belum dianalisis.</p>'];
  if(id==='01')return [start,
    ['Cari reaksi kanan dari momen',eq(`ΣMᴀ = 0: RʙL − Pa = 0<br>Rʙ = Pa/L = ${f(d.P_N)} × ${f(d.a_mm)} / ${f(d.L_mm)}<br><strong>Rʙ = ${f(r.RB_N)} N</strong>`)+ '<p>Ambil momen terhadap tumpuan kiri agar reaksi kiri tidak masuk persamaan karena lengan momennya nol.</p>'],
    ['Cari reaksi kiri dari gaya vertikal',eq(`ΣFᵧ = 0: Rᴀ + Rʙ − P = 0<br>Rᴀ = ${f(d.P_N)} − ${f(r.RB_N)}<br><strong>Rᴀ = ${f(r.RA_N)} N</strong>`)+ '<p>Jumlah reaksi ke atas harus menyeimbangkan seluruh beban ke bawah. Reaksi horizontal nol karena tidak ada gaya horizontal.</p>'],
    ['Tentukan momen maksimum',eq(`M(a) = Rᴀa = ${f(r.RA_N)} × ${f(d.a_mm)}<br><strong>M maksimum = ${f(r.M_at_load_Nmm)} N·mm = ${f(r.M_at_load_Nmm/1e6)} kN·m</strong>`)+ '<p>Untuk satu beban titik pada balok sendi–rol, momen terbesar berada di lokasi beban. Jika beban tepat di tumpuan, momen sepanjang bentang nol.</p>'],
    ['Potong balok dan baca gaya dalam',eq(`x = ${f(d.x_mm)} mm<br>N(x) = 0<br>V(x⁻) = ${f(r.V_left_N)} N<br>V(x⁺) = ${f(r.V_right_N)} N<br>M(x) = Rᴀx − P max(0, x−a)<br><strong>M(x) = ${f(r.M_at_x_Nmm)} N·mm</strong>`)+ '<p>Notasi ⁻/⁺ menunjukkan sisi kiri/kanan lokasi x. Gaya titik menyebabkan loncatan diagram geser; momen tetap kontinu. Di sisi luar ujung balok, V nol.</p>'],
    ['Periksa keseimbangan dan maknanya',eq(`Rᴀ + Rʙ − P = ${f(r.RA_N+r.RB_N-d.P_N)} N`)+ '<p>Menggeser beban mengubah pembagian reaksi, bukan jumlah totalnya. Diagram gaya dalam belum memberi tegangan atau lendutan; keduanya memerlukan geometri penampang dan model deformasi.</p>']];
  if(id==='03')return [start,
    ['Luas dan tegangan aksial',eq(`A = πd²/4 = ${f(r.A_mm2)} mm²<br>σ = F/A = ${f(d.F_N)}/${f(r.A_mm2)}<br><strong>σ = ${f(r.sigma_MPa)} MPa</strong>`)+ '<p>Untuk F dan luas yang tetap, mengubah E tidak mengubah tegangan nominal pada batang statis tertentu ini.</p>'],
    ['Kekakuan komponen dan pertambahan panjang',eq(`k = AE/L₀ = ${f(r.A_mm2)} × ${f(d.E_MPa)} / ${f(d.L_mm)}<br><strong>k = ${f(r.k_N_per_mm)} N/mm</strong>`)+(e.status==='valid'?eq(`ε = σ/E = ${f(r.epsilon)}<br>δ = F/k = ${f(d.F_N)}/${f(r.k_N_per_mm)}<br><strong>δ = ${f(r.delta_mm)} mm</strong>`):`<p class="outside-text">Deformasi tidak dihitung. ${e.reason}</p>`)+ '<p>E adalah sifat material (MPa); k adalah sifat komponen (N/mm) yang juga bergantung luas dan panjang.</p>'],
    ['Kontraksi lateral melalui rasio Poisson',e.status==='valid'?eq(`ε lateral = −νε = −${f(d.nu)} × ${f(r.epsilon)}<br>ε lateral = ${f(r.epsilon_lateral)}<br>Δd = ε lateral × d<br><strong>Δd = ${f(r.delta_d_mm)} mm</strong>`)+ '<p>Tanda negatif berarti diameter berkurang ketika batang ditarik. Jika ν=0, model ini memberi kontraksi lateral nol.</p>':'<p>Regangan lateral dan Δd disembunyikan di luar domain elastis.</p>'],
    ['Modulus geser dari elastisitas isotropik',eq(`G = E/[2(1+ν)]<br>G = ${f(d.E_MPa)}/[2(1+${f(d.nu)})]<br><strong>G = ${f(r.G_MPa)} MPa</strong>`)+ '<p>Hubungan ini berlaku untuk material homogen isotropik elastis; tidak boleh dipindahkan langsung ke material anisotropik.</p>'],
    ['Energi regangan elastis',e.status==='valid'?eq(`U = ½Fδ = ½ × ${f(d.F_N)} × ${f(r.delta_mm)}<br>U = ${f(r.U_Nmm)} N·mm<br><strong>U = ${f(r.U_J)} J</strong>`)+ '<p>Pada pembebanan elastis linier dari nol, energi adalah luas segitiga di bawah grafik gaya–deformasi. Bagi N·mm dengan 1.000 untuk memperoleh joule.</p>':'<p>Energi elastis tidak dihitung di luar domain model; tidak mengklaim energi plastis.</p>'],
    ['Bandingkan kekakuan, bukan menyimpulkan kekuatan','<p>Pembanding E=70 GPa mempertahankan F, d, L₀, ν dan Sy latihan. Tegangan nominal tetap; deformasi dapat berubah. E yang lebih tinggi tidak membuktikan batas luluh atau kekuatan lebih tinggi.</p>']];
  return [start,
    ['Kenali bidang geser dan luas pin',eq(`A pin = πd²/4 = ${f(r.A_pin_mm2)} mm²<br>m = ${d.n_planes} bidang<br>Luas penahan geser = mA = ${f(d.n_planes*r.A_pin_mm2)} mm²<br>Gaya per bidang = F/m = ${f(r.force_per_plane_N)} N`)+ '<p>Jumlah bidang ditentukan dari geometri sambungan yang memotong pin. Pembagian dua bidang diasumsikan simetris.</p>'],
    ['Hitung tegangan geser rata-rata pin',eq(`τ rata-rata = F/(mA)<br>τ = ${f(d.F_N)}/(${d.n_planes} × ${f(r.A_pin_mm2)})<br><strong>τ = ${f(r.tau_avg_MPa)} MPa</strong>`)+ '<p>Ini tegangan rata-rata pada bidang penampang pin; bukan tegangan maksimum lokal atau nilai tumpu pelat.</p>'],
    ['Hitung tegangan tumpu pelat tengah / pelat',eq(`A proyeksi = td = ${f(d.t_center_mm)} × ${f(d.d_mm)} mm²<br>σb = F/(td) = ${f(d.F_N)}/(${f(d.t_center_mm)} × ${f(d.d_mm)})<br><strong>σb = ${f(r.bearing_center_MPa)} MPa</strong>`)+ '<p>Kontak pin dan pelat diwakili luas proyeksi t×d, bukan luas lingkaran pin. Pelat tengah pada clevis menerima F penuh.</p>'],
    ['Tinjau tiap pelat luar',d.n_planes===2?eq(`F tiap luar = F/2 = ${f(d.F_N/2)} N<br>σb luar = (F/2)/(t luar × d)<br><strong>σb tiap luar = ${f(r.bearing_each_outer_MPa)} MPa</strong>`)+ '<p>Kedua pelat luar di sini sama tebal dan menerima gaya yang sama besar. Pelat tengah tetap tidak boleh dianggap menerima F/2.</p>':'<p>Pada sambungan lap tunggal ini kedua pelat diasumsikan setebal t dan menerima besar gaya F yang sama. Keduanya mempunyai tegangan tumpu nominal yang sama. Ganti ke dua bidang untuk memeriksa pelat luar clevis.</p>'],
    ['Pisahkan hasil dan batas kesimpulan','<p>Geser pin memakai m×πd²/4; tumpu pelat memakai t×d. Hasil ini tidak mengevaluasi luluh, sobek tepi, penampang netto, lentur pin, sambungan las, fatigue atau kapasitas angkat. Tidak ada label lulus/aman tanpa kriteria dan analisis tambahan.</p>']];
}
