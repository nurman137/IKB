export const modules = [
  {id:'01',title:'Membaca Beban',short:'Kenali gaya. Temukan pengaruhnya.',group:'Fondasi',kind:'beam',objectives:['Mengenali tarik, tekan, geser, lentur, dan torsi.','Memisahkan gaya luar, reaksi tumpuan, dan gaya dalam.','Membaca keseimbangan pada diagram benda bebas.'],cases:['Balok penyangga alat produksi','Balok geladak penyangga peralatan'],question:'Jika beban mendekati tumpuan kiri, reaksi tumpuan mana yang membesar?',concept:'Beban luar harus diimbangi oleh reaksi. Memotong komponen secara imajiner membantu kita melihat gaya dalam yang menjaga keseimbangannya.',prereq:'Mekanika Teknik dasar'},
  {id:'02',title:'Tegangan–Regangan',short:'Beban yang sama. Respons yang berbeda.',group:'Fondasi',kind:'rod',objectives:['Membedakan tegangan, regangan, dan perubahan panjang.','Menghubungkan beban dan luas penampang dengan tegangan.','Menghitung deformasi aksial dengan satuan konsisten.'],cases:['Batang pengikat mesin','Tie rod struktur kapal'],question:'Jika diameter batang menjadi dua kali lipat, apa yang terjadi pada tegangan dan pertambahan panjang?',concept:'Tegangan menyatakan gaya per luas penampang. Regangan membandingkan perubahan panjang dengan panjang awal; besaran ini tidak memiliki satuan.',prereq:'Membaca Beban'},
  {id:'03',title:'Elastisitas & Hukum Hooke',short:'Kaku belum tentu lebih kuat.',group:'Fondasi',kind:'rod',objectives:['Membedakan modulus elastisitas dan kekuatan material.','Membandingkan kekakuan dua batang.','Menjelaskan kontraksi lateral melalui rasio Poisson.'],cases:['Batang penarik mekanisme mesin','Batang penggantung platform kapal'],question:'Mengapa mengubah modulus elastisitas mengubah deformasi, tetapi tidak selalu mengubah tegangan nominal?',concept:'Dalam daerah elastis linier, tegangan sebanding dengan regangan. Kekakuan komponen juga dipengaruhi bentuk dan dimensinya, bukan hanya material.',prereq:'Tegangan–Regangan'},
  {id:'04',title:'Geser & Sambungan',short:'Lihat bidangnya. Pahami sambungannya.',group:'Pembebanan',kind:'pin',objectives:['Mengidentifikasi satu atau dua bidang geser.','Membedakan tegangan geser pin dan tegangan tumpu pelat.','Menjelaskan batas perhitungan sambungan ideal.'],cases:['Pin mekanisme pengangkat','Pin clevis pada padeye ideal'],question:'Apakah dua bidang geser juga membagi tegangan tumpu pada pelat tengah menjadi dua?',concept:'Tegangan geser bekerja sejajar bidang potong. Tegangan tumpu menggambarkan tekanan nominal pada luas proyeksi kontak pin dan pelat.',prereq:'Membaca Beban dan Tegangan–Regangan'},
  {id:'05',title:'Torsi & Poros',short:'Putar poros. Baca puntirannya.',group:'Pembebanan',kind:'shaft',objectives:['Menghubungkan torsi dengan tegangan geser.','Menghitung sudut puntir pada poros melingkar.','Membedakan peran panjang, diameter, dan material.'],cases:['Poros transmisi motor–mesin','Segmen poros propeler'],question:'Jika panjang poros digandakan, apakah tegangan geser dan sudut puntir berubah dengan cara yang sama?',concept:'Pada poros melingkar elastis, tegangan geser bertambah terhadap jarak dari sumbu. Sudut puntir juga dipengaruhi panjang poros dan modulus geser.',prereq:'Elastisitas & Hukum Hooke'},
  {id:'06',title:'Lentur Balok',short:'Dari beban ke bentuk lendutan.',group:'Pembebanan',kind:'beam',objectives:['Menghubungkan gaya geser dan momen lentur.','Menentukan serat dengan tegangan lentur terbesar.','Membedakan kekuatan dan batas lendutan.'],cases:['Balok penyangga mesin','Balok geladak penyangga peralatan'],question:'Apa yang berubah ketika tinggi balok diperbesar, sedangkan beban dan bentangnya tetap?',concept:'Momen lentur menghasilkan tegangan normal yang berubah melintasi tinggi penampang. Lendutan menunjukkan respons kekakuan seluruh balok.',prereq:'Membaca Beban dan Elastisitas'},
  {id:'07',title:'Bentuk Penampang',short:'Luas sama. Kekakuan berbeda.',group:'Pembebanan',kind:'section',objectives:['Membedakan luas dan momen inersia penampang.','Menghubungkan orientasi profil dengan arah lentur.','Membandingkan dua penampang dengan dasar yang sama.'],cases:['Orientasi profil rangka mesin','Orientasi balok penegar geladak'],question:'Mengapa memutar penampang persegi panjang dapat mengubah lendutan meskipun luasnya tetap?',concept:'Material yang lebih jauh dari sumbu netral memberi kontribusi lebih besar pada momen inersia. Orientasi profil harus dibaca bersama arah pembebanan.',prereq:'Lentur Balok'},
  {id:'08',title:'Pengaruh Temperatur',short:'Memuai bebas atau tertahan?',group:'Penerapan',kind:'thermal',objectives:['Membedakan pemuaian bebas dan terkekang.','Membaca tanda tegangan akibat pemanasan atau pendinginan.','Menghubungkan pengekangan dengan reaksi aksial.'],cases:['Pipa lurus instalasi mesin','Pipa lurus kamar mesin kapal'],question:'Mengapa pemuaian bebas tidak menghasilkan tegangan termal aksial pada model ideal ini?',concept:'Perubahan temperatur menimbulkan kecenderungan perubahan ukuran. Tegangan termal muncul ketika perubahan ukuran itu ditahan.',prereq:'Elastisitas & Hukum Hooke'},
  {id:'09',title:'Beban Gabungan & Keamanan',short:'Gabungkan beban. Nilai kriterianya.',group:'Penerapan',kind:'shaft',objectives:['Mengevaluasi komponen tegangan pada titik yang sama.','Memahami tegangan ekuivalen untuk material ulet.','Menafsirkan faktor keamanan dalam batas model.'],cases:['Poros mesin: lentur dan torsi','Poros propeler: gaya dorong dan torsi'],question:'Mengapa tegangan normal dan geser harus diperiksa pada titik fisik yang sama?',concept:'Beban yang berbeda dapat bekerja bersamaan. Evaluasi memerlukan komponen tegangan yang sesuai lokasinya serta kriteria kegagalan yang dinyatakan jelas.',prereq:'Torsi & Poros dan Lentur Balok'},
  {id:'10',title:'Studio Desain',short:'Rancang. Bandingkan. Jelaskan.',group:'Penerapan',kind:'section',objectives:['Membandingkan dua alternatif dengan kriteria eksplisit.','Memisahkan evaluasi massa, kekuatan, dan kekakuan.','Menjelaskan keputusan serta kebutuhan verifikasi lanjutan.'],cases:['Poros transmisi pejal–berongga','Alternatif orientasi balok geladak'],question:'Apakah rancangan yang memenuhi kriteria kekuatan selalu memenuhi batas deformasi?',concept:'Rancangan dinilai melalui beberapa kriteria sekaligus. Alternatif yang lebih ringan atau kuat belum tentu memberikan kekakuan yang dibutuhkan.',prereq:'Modul pembebanan yang terkait'},
];

export function parseRoute(pathname,base='/') {
  const path=pathname.startsWith(base)?pathname.slice(base.length):pathname;
  const parts=path.replace(/index\.html$/,'').split('/').filter(Boolean);
  if(!parts.length)return {type:'home'};
  if(parts.length===1&&parts[0]==='tentang')return {type:'about'};
  if(parts[0]==='modul'&&modules.some(m=>m.id===parts[1])) {
    if(parts.length===2)return {type:'module',id:parts[1]};
    if(parts.length===4&&parts[2]==='perhitungan'&&['mesin','kapal'].includes(parts[3]))return {type:'calculation',id:parts[1],context:parts[3]};
  }
  return {type:'notfound'};
}

export function readNumber(raw) {
  if(typeof raw==='number')return Number.isFinite(raw)?raw:NaN;
  const text=String(raw??'').trim();
  if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(text))return NaN;
  return Number(text.replace(',','.'));
}

export function validateInputs(input) {
  const errors={};
  for(const [key,raw] of Object.entries(input)) {
    if(key==='deflection_limit_basis')continue;
    const value=readNumber(raw);
    if(!Number.isFinite(value)){errors[key]='Masukkan angka yang sah. Gunakan koma atau titik untuk desimal.';continue;}
    if(/^(L_mm|d_mm|b_mm|h_mm|b_[AB]_mm|h_[AB]_mm|E_MPa|Sy_MPa|rho_kg_m3|t_.*_mm|alpha_per_C|theta_limit_deg|deflection_limit_mm)$/.test(key)&&value<=0)errors[key]='Nilai harus lebih besar dari nol.';
    if(/^di(_[AB])?_mm$/.test(key)&&(value<0||value>=readNumber(input.d_mm)))errors[key]='Diameter dalam harus ≥ 0 dan lebih kecil dari diameter luar.';
    if(key==='nu'&&(value<0||value>=.5))errors[key]='Untuk latihan ini, gunakan 0 ≤ ν < 0,5.';
    if(key==='n_planes'&&![1,2].includes(value))errors[key]='Pilih satu atau dua bidang geser.';
    if(key==='a_mm'&&(value<0||value>readNumber(input.L_mm)))errors[key]='Posisi beban harus berada di sepanjang bentang.';
    if(key==='n_required'&&value<=1)errors[key]='Target faktor keamanan latihan harus lebih besar dari 1.';
  }
  return errors;
}
