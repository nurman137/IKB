# Lembar tinjauan dosen — IKB Polibatam

Dihasilkan otomatis oleh `node scripts/review-sheet.mjs` dari kode situs (cabang FE). **Jangan diedit langsung**; angka di sini persis sama dengan yang dilihat mahasiswa. Bila ada yang perlu diubah, catat di kolom keputusan, lalu perubahan dilakukan di sumber dan lembar ini dibuat ulang.

**Cara memakai:** tandai setiap baris "Setuju" atau "Perlu revisi" dan tulis catatan singkat. Fokus utama: (1) kriteria latihan, (2) preset yang ditambahkan di luar register M0, (3) soal latihan dan kunci jawabannya, (4) pertanyaan prediksi. Rumus dan 133 nilai acuan M0 sudah diverifikasi otomatis dan tidak perlu dihitung ulang.

Toleransi penilaian latihan: 1% dari jawaban kunci (tanda ikut dinilai untuk tegangan termal). Semua data adalah asumsi latihan, bukan data material bersertifikat, kapal tertentu, atau aturan klasifikasi.

## 1. Kriteria latihan dan batas model

| Kriteria / batas | Nilai | Dipakai di | Keputusan | Catatan |
| --- | --- | --- | --- | --- |
| Batas luluh latihan Sᵧ (default) | 250 MPa | 02, 03, 05–10 | ☐ Setuju ☐ Perlu revisi |  |
| Target faktor keamanan luluh | n ≥ 2 | 09, 10 | ☐ Setuju ☐ Perlu revisi |  |
| Batas sudut puntir poros | θ ≤ 2° | 10 Mesin | ☐ Setuju ☐ Perlu revisi |  |
| Batas lendutan balok geladak | δ ≤ L/1000 (2,5 mm pada L = 2,5 m) | 10 Kapal | ☐ Setuju ☐ Perlu revisi |  |
| Kelangsingan minimum Euler–Bernoulli | L/h ≥ 10 | 06, 07, 10 | ☐ Setuju ☐ Perlu revisi |  |
| Batas regangan kecil | \|σ\|/E ≤ 1% (aksial/lentur), γ ≤ 1% (torsi) | 02, 03, 05, 06, 07, 10 | ☐ Setuju ☐ Perlu revisi |  |
| Batas lendutan pedagogis balok | \|δ\|/L ≤ 2% | 06, 07, 10 | ☐ Setuju ☐ Perlu revisi |  |
| Aturan keputusan Studio Desain | Hanya alternatif yang memenuhi semua kriteria; pilih yang lebih ringan, lalu margin kekuatan lebih besar | 10 | ☐ Setuju ☐ Perlu revisi |  |

## 2. Preset di luar register M0

### 2a. Kalkulator analitis

| Preset | Nilai | Keputusan | Catatan |
| --- | --- | --- | --- |
| 05 Torsi — preset daya–putaran | Mesin 30 kW @ 1.450 rpm; Kapal 90 kW @ 600 rpm | ☐ Setuju ☐ Perlu revisi |  |
| 06 Lentur — beban merata | Mesin 5 kN/m; Kapal 6 kN/m | ☐ Setuju ☐ Perlu revisi |  |
| 07 Penampang — profil I/T/pipa (Mesin) | d_mm=60, di_mm=50, bf_mm=50, tf_mm=6, tw_mm=5 (tinggi h sama dengan persegi panjang M0) | ☐ Setuju ☐ Perlu revisi |  |
| 07 Penampang — profil I/T/pipa (Kapal) | d_mm=114, di_mm=100, bf_mm=100, tf_mm=10, tw_mm=8 (tinggi h sama dengan persegi panjang M0) | ☐ Setuju ☐ Perlu revisi |  |
| 08 Temperatur — pembanding aluminium | E = 70 GPa, α = 23 × 10⁻⁶/°C | ☐ Setuju ☐ Perlu revisi |  |
| 10 Kapal — massa jenis | ρ = 7.850 kg/m³ (untuk massa; luas A dan B sama) | ☐ Setuju ☐ Perlu revisi |  |

### 2b. Data tambahan untuk FE (dari spesifikasi F0)

| Kasus | Model | Tambahan input FE | Keputusan | Catatan |
| --- | --- | --- | --- | --- |
| 01-M | BEAM2 | b_mm=60, h_mm=120, E_MPa=200.000, nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 01-K | BEAM2 | b_mm=100, h_mm=200, E_MPa=200.000, nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 02-M | AX2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 02-K | AX2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 03-M | AX2 | Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 03-K | AX2 | Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 04-M | PS2 | plate_length_mm=96, plate_width_mm=72, hole_center_x_mm=36, hole_center_y_mm=0, hole_d_mm=12, E_MPa=200.000, nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 04-K | PS2 | plate_length_mm=160, plate_width_mm=120, hole_center_x_mm=60, hole_center_y_mm=0, hole_d_mm=20, E_MPa=200.000, nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 05-M | TOR2 | Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 05-K | TOR2 | Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 06-M | BEAM2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 06-K | BEAM2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 07-M | BEAM2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 07-K | BEAM2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 08-M | AX2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 08-K | AX2 | nu=0,3, Sy_MPa=250 | ☐ Setuju ☐ Perlu revisi |  |
| 09-M | COMB | L_mm=1.000, E_MPa=200.000, nu=0,3 | ☐ Setuju ☐ Perlu revisi |  |
| 09-K | COMB | L_mm=2.000, E_MPa=200.000, nu=0,3 | ☐ Setuju ☐ Perlu revisi |  |
| 10-K | BEAM2 | nu=0,3, rho_kg_m3=7.850 | ☐ Setuju ☐ Perlu revisi |  |

## 3. Soal latihan mandiri dan kunci jawaban

Satuan inti: N, mm, MPa (input daya dalam W, putaran dalam rpm). Data latihan sengaja berbeda dari contoh interaktif.

| Kasus | Modul | Data soal (satuan inti) | Jawaban 1 | Jawaban 2 | Keputusan | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| 01-M | Membaca Beban | P_N=12.000, L_mm=1.600, a_mm=400, x_mm=800 | Reaksi kiri Rᴀ (kN): **9** | Reaksi kanan Rʙ (kN): **3** | ☐ Setuju ☐ Perlu revisi |  |
| 01-K | Membaca Beban | P_N=18.000, L_mm=2.400, a_mm=1.600, x_mm=1.200 | Reaksi kiri Rᴀ (kN): **6** | Reaksi kanan Rʙ (kN): **12** | ☐ Setuju ☐ Perlu revisi |  |
| 02-M | Tegangan–Regangan | F_N=15.000, d_mm=16, L_mm=400, E_MPa=200.000, Sy_MPa=250 | Tegangan σ (MPa): **74,6039** | Pertambahan panjang δ (mm): **0,149208** | ☐ Setuju ☐ Perlu revisi |  |
| 02-K | Tegangan–Regangan | F_N=25.000, d_mm=20, L_mm=1.500, E_MPa=200.000, Sy_MPa=250 | Tegangan σ (MPa): **79,5775** | Pertambahan panjang δ (mm): **0,596831** | ☐ Setuju ☐ Perlu revisi |  |
| 03-M | Elastisitas & Hukum Hooke | F_N=8.000, d_mm=16, L_mm=400, E_MPa=200.000, nu=0,3, Sy_MPa=250 | Pertambahan panjang δ (mm): **0,0795775** | Energi elastis U (J): **0,31831** | ☐ Setuju ☐ Perlu revisi |  |
| 03-K | Elastisitas & Hukum Hooke | F_N=12.000, d_mm=20, L_mm=800, E_MPa=200.000, nu=0,3, Sy_MPa=250 | Pertambahan panjang δ (mm): **0,152789** | Energi elastis U (J): **0,916732** | ☐ Setuju ☐ Perlu revisi |  |
| 04-M | Geser & Sambungan | F_N=9.000, d_mm=10, n_planes=1, t_center_mm=6 | Geser pin τ rata-rata (MPa): **114,592** | Tumpu pelat tengah / pelat σb (MPa): **150** | ☐ Setuju ☐ Perlu revisi |  |
| 04-K | Geser & Sambungan | F_N=30.000, d_mm=16, n_planes=2, t_center_mm=10, t_each_outer_mm=8 | Geser pin τ rata-rata (MPa): **74,6039** | Tumpu pelat tengah / pelat σb (MPa): **187,5** | ☐ Setuju ☐ Perlu revisi |  |
| 05-M | Torsi & Poros | mode=power, P_W=7.500, n_rpm=1.450, d_mm=25, di_mm=0, L_mm=500, E_MPa=200.000, nu=0,3, Sy_MPa=250 | Tegangan geser maksimum τmax (MPa): **16,0996** | Sudut puntir θ (derajat): **0,479668** | ☐ Setuju ☐ Perlu revisi |  |
| 05-K | Torsi & Poros | mode=torque, T_Nmm=2.500.000, d_mm=80, di_mm=50, L_mm=3.000, E_MPa=200.000, nu=0,3, Sy_MPa=250 | Tegangan geser maksimum τmax (MPa): **29,3458** | Sudut puntir θ (derajat): **1,63935** | ☐ Setuju ☐ Perlu revisi |  |
| 06-M | Lentur Balok | load=point, P_N=12.000, L_mm=2.000, b_mm=80, h_mm=160, E_MPa=200.000, Sy_MPa=250 | Tegangan lentur maksimum σmax (MPa): **17,5781** | Lendutan maksimum δmax (mm): **0,366211** | ☐ Setuju ☐ Perlu revisi |  |
| 06-K | Lentur Balok | load=udl, w_N_per_mm=8, L_mm=4.000, b_mm=120, h_mm=240, E_MPa=200.000, Sy_MPa=250 | Tegangan lentur maksimum σmax (MPa): **13,8889** | Lendutan maksimum δmax (mm): **0,964506** | ☐ Setuju ☐ Perlu revisi |  |
| 07-M | Bentuk Penampang | shape=rect, P_N=1.500, L_mm=1.200, b_mm=30, h_mm=80, E_MPa=200.000, Sy_MPa=250 | Momen inersia orientasi A, I_A (mm⁴): **1.280.000** | Rasio lendutan δ_B/δ_A (tanpa satuan): **7,11111** | ☐ Setuju ☐ Perlu revisi |  |
| 07-K | Bentuk Penampang | shape=T, P_N=6.000, L_mm=2.000, h_mm=120, bf_mm=100, tf_mm=10, tw_mm=8, E_MPa=200.000, Sy_MPa=250 | Titik berat ȳ dari serat bawah (mm): **86,9149** | Tegangan serat bawah σ_bawah (MPa): **101,034** | ☐ Setuju ☐ Perlu revisi |  |
| 08-M | Pengaruh Temperatur | support=fixed, d_mm=50, di_mm=42, L_mm=2.500, deltaT_C=60, E_MPa=200.000, alpha_per_C=0,000012, Sy_MPa=250 | Perubahan panjang bebas δ (mm): **1,8** | Tegangan terkekang σ (MPa, dengan tanda): **-144** | ☐ Setuju ☐ Perlu revisi |  |
| 08-K | Pengaruh Temperatur | support=fixed, d_mm=89, di_mm=77, L_mm=4.000, deltaT_C=-30, E_MPa=200.000, alpha_per_C=0,000012, Sy_MPa=250 | Tegangan terkekang σ (MPa, dengan tanda): **72** | Gaya tumpuan \|R\| (kN): **112,645** | ☐ Setuju ☐ Perlu revisi |  |
| 09-M | Beban Gabungan & Keamanan | F_N=0, M_Nmm=450.000, T_Nmm=300.000, d_mm=45, Sy_MPa=250, n_required=2 | Tegangan von Mises maksimum σ_vm,max (MPa): **58,0824** | Faktor keamanan luluh n (tanpa satuan): **4,30423** | ☐ Setuju ☐ Perlu revisi |  |
| 09-K | Beban Gabungan & Keamanan | F_N=-80.000, M_Nmm=200.000, T_Nmm=3.000.000, d_mm=80, Sy_MPa=250, n_required=2 | Tegangan von Mises maksimum σ_vm,max (MPa): **55,3836** | Faktor keamanan luluh n (tanpa satuan): **4,51397** | ☐ Setuju ☐ Perlu revisi |  |
| 10-M | Studio Desain | T_Nmm=250.000, d_mm=40, di_A_mm=0, di_B_mm=28, L_mm=1.000, E_MPa=200.000, nu=0,3, rho_kg_m3=7.850, Sy_MPa=250, n_required=2, theta_limit_deg=2 | Massa alternatif B (kg): **5,03095** | Sudut puntir alternatif B θ (derajat): **0,975011** | ☐ Setuju ☐ Perlu revisi |  |
| 10-K | Studio Desain | P_N=12.000, L_mm=3.000, b_A_mm=70, h_A_mm=200, b_B_mm=200, h_B_mm=70, E_MPa=200.000, rho_kg_m3=7.850, Sy_MPa=250, n_required=2, deflection_limit_mm=3 | Lendutan alternatif B δ_B (mm): **5,90379** | Faktor keamanan luluh alternatif A n_A: **12,963** | ☐ Setuju ☐ Perlu revisi |  |

## 4. Pertanyaan prediksi (kalkulator analitis)

| Modul | Judul | Pertanyaan | Jawaban tepat dan penjelasan | Keputusan | Catatan |
| --- | --- | --- | --- | --- | --- |
| 01 | Membaca Beban | Beban digeser mendekati tumpuan kiri dengan besar P dan bentang tetap. Apa yang terjadi? | **Reaksi kiri membesar; reaksi kanan mengecil** — Dari ΣMᴀ = 0, Rʙ = Pa/L. Ketika a mengecil, Rʙ mengecil; karena Rᴀ + Rʙ = P, Rᴀ membesar. | ☐ Setuju ☐ Perlu revisi |  |
| 02 | Tegangan–Regangan | Mesin: diameter dua kali lipat; Kapal: panjang dua kali lipat (berbeda per konteks) | Mesin: A = πd²/4. Diameter dua kali lipat memberi luas empat kali lipat; pada F, L₀ dan E tetap, tegangan dan pertambahan panjang menjadi seperempat. Kapal: Pada F, d dan E tetap, σ = F/A tidak berubah. Karena δ = FL₀/(AE), panjang awal dua kali lipat memberi pertambahan panjang dua kali lipat. | ☐ Setuju ☐ Perlu revisi |  |
| 03 | Elastisitas & Hukum Hooke | E diperbesar dua kali lipat pada F, d, L₀ dan ν tetap. Bagaimana tegangan dan deformasi aksial berubah? | **Tegangan tetap; deformasi menjadi setengah** — Untuk gaya yang ditentukan, σ = F/A tetap. Kekuatan tidak ditentukan oleh E. Karena k = AE/L₀ dan δ = F/k, E dua kali lipat membuat k dua kali lipat dan δ setengah. | ☐ Setuju ☐ Perlu revisi |  |
| 04 | Geser & Sambungan | Jumlah bidang geser berubah dari satu menjadi dua, pada F dan d tetap. Apa yang terjadi pada tegangan geser pin? | **Menjadi setengah, jika pembagian beban simetris** — Luas total penahan geser berubah dari A menjadi 2A, sehingga τ rata-rata = F/(mA) menjadi setengah. Pelat tengah tetap menerima F penuh; tegangan tumpunya tidak otomatis dibagi dua. | ☐ Setuju ☐ Perlu revisi |  |
| 05 | Torsi & Poros | Panjang poros L digandakan pada T, d, dᵢ dan material yang sama. Apa yang terjadi? | **τmax tetap; sudut puntir θ menjadi dua kali lipat** — τmax = Tc/J tidak memuat L, sehingga tegangan geser tetap. θ = TL/(GJ) sebanding dengan L: poros dua kali lebih panjang terpuntir dua kali lebih besar. Regangan geser γ = cθ/L juga tetap. | ☐ Setuju ☐ Perlu revisi |  |
| 06 | Lentur Balok | Tinggi penampang h digandakan pada beban, bentang, lebar b dan E yang sama. Bagaimana σmax dan δmax berubah? | **σmax menjadi 1/4; δmax menjadi 1/8** — I = bh³/12 menjadi 8 kali, sedangkan c = h/2 menjadi 2 kali. σmax = Mc/I menjadi 2/8 = 1/4. δmax berbanding terbalik dengan I sehingga menjadi 1/8. Menambah tinggi jauh lebih efektif daripada menambah lebar. Catatan: hubungan lendutan ini hanya diklaim selama balok tetap ramping (L/h ≥ 10). | ☐ Setuju ☐ Perlu revisi |  |
| 07 | Bentuk Penampang | Penampang persegi panjang 40 × 100 mm diputar sehingga sisi 40 mm menjadi tinggi. Luas tetap. Apa yang terjadi pada lendutan? | **Lendutan bertambah besar (sekitar 6,25 kali)** — I = bh³/12. Tinggi turun dari 100 menjadi 40 mm, sedangkan lebar naik dari 40 menjadi 100 mm, sehingga I turun dengan faktor (100/40)² = 6,25. δ = PL³/(48EI) naik dengan faktor yang sama. Luas menentukan massa; sebaran material terhadap sumbu netral menentukan kekakuan lentur. | ☐ Setuju ☐ Perlu revisi |  |
| 08 | Pengaruh Temperatur | Pipa baja dipanaskan sementara kedua ujungnya ditahan kaku. Tegangan aksial apa yang muncul? | **Tekan, karena pipa ingin memanjang tetapi ditahan** — Pipa ingin memanjang αΔT·L, tetapi tumpuan menahannya pada panjang awal. Tumpuan harus mendorong pipa kembali, sehingga σ = −EαΔT bernilai negatif (tekan). Pada pipa bebas tidak ada yang menahan, sehingga σ = 0 walaupun pipa memuai. | ☐ Setuju ☐ Perlu revisi |  |
| 09 | Beban Gabungan & Keamanan | Poros menerima M dan T, tanpa gaya aksial. Di titik A σ = +47,7 MPa, di titik B σ = −47,7 MPa, dan τ sama di keduanya. Titik mana yang lebih kritis menurut von Mises? | **Sama kritis, karena σ dikuadratkan dalam von Mises** — σ_vm = √(σ² + 3τ²). Tanda σ hilang saat dikuadratkan, sehingga A dan B sama kritis bila F = 0. Jika ada gaya aksial, σ_aksial menambah satu sisi dan mengurangi sisi lain; titik yang kritis harus dihitung, bukan ditebak. Untuk material ulet, kriteria ini tidak membedakan tarik dan tekan; tekuk dan fatigue tetap perlu dicek terpisah. | ☐ Setuju ☐ Perlu revisi |  |
| 10 | Studio Desain | Sebuah alternatif rancangan memenuhi kriteria kekuatan n ≥ 2. Apakah ia otomatis memenuhi batas deformasi? | **Tidak selalu; kekakuan harus diperiksa terpisah** — Kekuatan bergantung pada tegangan (M/Z atau Tc/J), sedangkan deformasi bergantung pada kekakuan (EI atau GJ) dan sangat sensitif terhadap panjang. Pada kasus Kapal, orientasi rebah masih memenuhi n ≥ 2 tetapi melendut melebihi batas L/1000. Setiap kriteria dinilai sendiri-sendiri. | ☐ Setuju ☐ Perlu revisi |  |

## 5. Pertanyaan prediksi FE

Halaman FE setiap modul menampilkan satu pertanyaan prediksi dan satu cek pemahaman yang sama ("Saat hasil berbeda dari acuan, apa langkah pertama?" → periksa kesetaraan model, beban, tumpuan dan titik ukur).

| Modul | Pertanyaan | Jawaban tepat | Pengecoh | Keputusan | Catatan |
| --- | --- | --- | --- | --- | --- |
| 01 (bawaan) | Apakah mesh halus otomatis membuktikan model benar? | Tidak; beban, tumpuan, domain dan konvergensi harus diperiksa. | Ya; semakin banyak elemen selalu benar. | ☐ Setuju ☐ Perlu revisi |  |
| 02 | Apakah ujung batang boleh dikunci radial untuk uji tarik bebas? | Tidak; itu menghambat kontraksi Poisson. | Ya; tidak mengubah medan tegangan. | ☐ Setuju ☐ Perlu revisi |  |
| 03 | Jika E naik pada beban tetap, apa yang berubah? | Deformasi berubah; kekuatan luluh bukan E. | Kekuatan luluh selalu bertambah dengan E. | ☐ Setuju ☐ Perlu revisi |  |
| 04 | Apakah puncak tegangan lokal FE harus sama dengan F/(td)? | Tidak; nominal dan lokal mengukur hal berbeda. | Ya; semua hasil harus identik. | ☐ Setuju ☐ Perlu revisi |  |
| 05 | Apakah Jt selalu sama dengan momen polar untuk semua bentuk? | Tidak; kesamaan berlaku pada lingkaran/cincin konsentris. | Ya; bentuk penampang tidak berpengaruh. | ☐ Setuju ☐ Perlu revisi |  |
| 06 (bawaan) | Apakah mesh halus otomatis membuktikan model benar? | Tidak; beban, tumpuan, domain dan konvergensi harus diperiksa. | Ya; semakin banyak elemen selalu benar. | ☐ Setuju ☐ Perlu revisi |  |
| 07 (bawaan) | Apakah mesh halus otomatis membuktikan model benar? | Tidak; beban, tumpuan, domain dan konvergensi harus diperiksa. | Ya; semakin banyak elemen selalu benar. | ☐ Setuju ☐ Perlu revisi |  |
| 08 | Apakah pemanasan bebas selalu menghasilkan tegangan aksial? | Tidak; pemuaian bebas berbeda dari terkekang. | Ya; temperatur saja menentukan tegangan. | ☐ Setuju ☐ Perlu revisi |  |
| 09 | Bagaimana menggabungkan tegangan A dan B? | Gabungkan tensor pada setiap titik fisik dahulu. | Jumlahkan maksimum dari lokasi berbeda. | ☐ Setuju ☐ Perlu revisi |  |
| 10 (bawaan) | Apakah mesh halus otomatis membuktikan model benar? | Tidak; beban, tumpuan, domain dan konvergensi harus diperiksa. | Ya; semakin banyak elemen selalu benar. | ☐ Setuju ☐ Perlu revisi |  |

## 6. Catatan umum peninjau

- Nama peninjau / tanggal:
- Keputusan rilis FE: ☐ Terbitkan ☐ Terbitkan sebagai beta ☐ Tunda (alasan):
- Catatan lain:

