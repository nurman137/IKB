# F0 — Spesifikasi model dan integrasi FE

Versi 0.1 · 27 November 2026 (WIB). Baseline source: `8aa939defe0b41d832186b6b7eeece6477ad1568` (`1.0.0-rc.2`). Ini spesifikasi pengembangan, bukan implementasi atau hasil validasi solver FE.

## Tujuan dan keputusan

Seluruh 20 kasus memperoleh jalur analisis FE terpandu yang memakai input kasus aktif. Rumus analitis tetap tersedia sebagai pembanding independen. Tidak ada solver FE, tombol aktif FE, perubahan build atau penerbitan situs pada F0. Pemrograman kernel baru dimulai F1.

Empat keluarga kernel dan satu penggabung hasil direncanakan:

| Kode | Model | Medan/derajat kebebasan | Pemakaian |
| --- | --- | --- | --- |
| BEAM2 | Elemen garis frame bidang, aksial linier + lentur Euler–Bernoulli Hermite | ux, uy, rz per node | 01/06/07/10-K dan submodel normal 09 |
| PS2 | Solid plane stress | ux, uy pada area x–y; tebal t | Pengayaan persegi panjang 06/07/10-K; pelat berlubang 04 |
| AX2 | Solid axisymmetric r–z | ur, uz; integrasi volume 2πr dA | 02/03/08; termal berupa regangan awal |
| TOR2 | Torsi Saint-Venant penampang prismatik | Fungsi warping ψ(x,y) pada penampang; satu gauge | 05/10-M dan submodel torsi 09 |
| COMB | Penggabung BEAM2 + TOR2 | Tensor tegangan pada koordinat fisik sama | 09-M/K; bukan solver solid 3D |

BEAM2 adalah elemen satu dimensi yang diletakkan pada bidang 2D. Kontur tegangan yang direkonstruksi dari N/M dan A/I harus berlabel demikian, bukan disebut hasil mesh solid. AX2 mewakili benda putar dengan mesh meridian; bukan pelat persegi panjang pengganti batang lingkaran. TOR2 menghitung medan penampang dan kekakuan puntir, bukan deformasi solid 3D di ujung poros. COMB adalah superposisi model batang prismatik, bukan solusi konsentrasi tegangan tiga dimensi.

### BEAM2

K_e lokal: blok aksial EA/l dan lentur EI/l³ dengan interpolasi kubik Hermite; transformasi ke sumbu global harus menjaga energi. Beban merata memakai gaya nodal konsisten termasuk momen, bukan hanya gaya terbagi rata. Node wajib hadir di tumpuan, perubahan properti dan lokasi beban titik. Bila a=0 atau a=L, gaya langsung masuk DOF tumpuan; bentang tetap mempunyai gaya dalam nol bila seluruh beban tepat ditumpu.

Balok sederhana: ux(0)=uy(0)=uy(L)=0; rotasi kedua ujung bebas. M positif sagging; konvensi sumbu internal x ke kanan, y ke atas, beban gravitasi negatif. UI melaporkan besar lendutan ke bawah positif seperti modul analitis. Normal stress untuk balok sagging adalah σxx=N/A−My/I, y dari centroid. V kiri/kanan dibedakan pada diskontinuitas. Pada 09, momen ujung diterjemahkan eksplisit agar titik A atas tetap tarik untuk M kasus positif; jangan menyalin tanda sagging tanpa transformasi.

Profil I/T/pipa pada 07 dihitung dengan A, I centroidal dan c atas/bawah yang sudah ada. Hanya persegi panjang mempunyai pengayaan PS2 pada tahap awal. Luas penampang bukan elemen garis dan bukan bukti adanya mesh solid.

### PS2

σ=[σxx,σyy,τxy], ε=[εxx,εyy,γxy], γ engineering. D=E/(1−ν²)[[1,ν,0],[ν,1,0],[0,0,(1−ν)/2]]. K_e=∫t BᵀDB dA. CST/T3 dipakai untuk demonstrasi satu elemen dan patch test; T6 dengan kuadratur yang memadai menjadi elemen utama kasus lentur/berlubang. Hindari memilih CST kasar untuk klaim lendutan akurat. Tidak memakai reduced integration tanpa pengujian hourglass tersendiri; tidak direncanakan pada versi ini.

Balok persegi panjang memakai domain [0,L]×[−h/2,h/2], t=b. Ini asumsi tegangan bidang seragam sepanjang lebar, bukan pembuktian perilaku 3D untuk semua b/h. Tumpuan/beban solid didistribusikan pada strip permukaan bawah/atas selebar s=min(0,02L;0,25h), s dicatat di model. Strip tumpuan menjaga perpindahan vertikal rata-rata nol melalui kendala linier; satu kendala horizontal rata-rata di tumpuan kiri menghilangkan translasi. Strip beban simetris di sekitar x=a, dipotong domain saat di ujung dan dinormalisasi agar resultan/centroid aktual diketahui. Bila centroid berubah, pembanding statika ikut dihitung dari centroid aktual dan diberi label pengayaan; bukan mengubah acuan M0 diam-diam.

Zona untuk perbandingan tegangan nominal adalah potongan yang berjarak ≥h dari tepi strip gaya/tumpuan. Tegangan serat pada tengah bentang tepat di bawah gaya titik bukan target lokal solid. Momen/tegangan nominal dapat direkonstruksi dengan integrasi tegangan di potongan yang sah. Model beban titik BEAM2 dan strip PS2 berbeda; selisih model wajib dicatat.

### AX2

Domain r∈[ri,ro], z∈[0,L]. Regangan [εrr,εzz,εθθ,γrz]=[∂ur/∂r,∂uz/∂z,ur/r,∂ur/∂z+∂uz/∂r]. Gunakan hukum isotropik 3D dan bobot 2πr; tidak menggunakan D plane stress. Elemen utama segitiga meridian T6; quadrature tidak boleh mengevaluasi ur/r secara tak terdefinisi pada r=0. Di sumbu r=0: ur=0 dan gunakan limit regularitas yang benar. Default ur=0 pada seluruh muka ujung dilarang karena menghambat Poisson.

Tarik: uz=0 pada muka z=0, ur tetap bebas kecuali sumbu. Pada z=L, traction axial F/[π(ro²−ri²)] dengan F untuk seluruh lingkaran, bukan per radian. Permukaan radial bebas.

Termal 08: εth=αΔT[1,1,1,0]. fth=∫BᵀDεth 2πr dA; σ=D(Bu−εth). ΔT seragam diketahui, bukan solve perpindahan panas. Mode bebas uz(0)=0, ujung L bebas; mode terkekang uz=0 pada z=0 dan L. Kedua kondisi mengizinkan ekspansi radial. Pemanasan: σzz terkekang negatif. Reaksi dilaporkan pada tiap muka, bukan menjumlahkan magnitudo dua muka menjadi 2R.

### TOR2 — satu formulasi untuk pejal dan berongga

Koordinat penampang x,y; sumbu poros z. κ=θ/L. γxz=κ(∂ψ/∂x−y), γyz=κ(∂ψ/∂y+x). Solve bentuk lemah:

∫Ω ∇v·∇ψ dA = ∫Ω(y∂v/∂x−x∂v/∂y) dA.

Semua batas luar/dalam menggunakan kondisi natural permukaan bebas. Gauge ∫Ωψ dA=0 menghilangkan konstanta; bukan ψ=0 pada seluruh tepi. Mesh cincin harus benar-benar mempunyai lubang, tanpa elemen melintasi rongga. Ini menghindari syarat konstanta fungsi tegangan yang berbeda pada batas lubang dalam formulasi Prandtl.

Jt dari energi = ∫[(ψx−y)²+(ψy+x)²] dA. Jt pembanding dari integral torsi = ∫[x(ψy+x)−y(ψx−y)] dA; keduanya harus konsisten. κ=T/(GJt), θ=κL. Untuk lingkaran/cincin konsentris, solusi ideal ψ konstan (gauge nol), Jt=π(do⁴−di⁴)/32 dan |τ|=Gκr. Jt tidak boleh disamakan dengan momen polar untuk penampang umum. Mesh lingkaran/cincin memerlukan kontrol galat geometri, bukan sekadar menambah elemen di dalam poligon yang sama.

### COMB — 09

Panjang L latihan baru memungkinkan submodel BEAM2: kantilever prismatik dengan F dan momen ujung M, tanpa beban melintang. Dengan kopel murni, M konstan sepanjang bentang; normal stress dipulihkan dari gaya dalam FE dan geometri penampang lingkaran. Torsi berasal TOR2. Titik A=(x=0,y=+d/2) dan B=(0,−d/2) pada penampang z=L/2; map tanda M agar σA=F/A+Mc/I, σB=F/A−Mc/I sesuai M0.

Medan geser TOR2 harus dipindahkan ke sumbu global; komponen geser pada dua sisi berlawanan tanda walaupun magnitudonya sama. Gabungkan tensor lengkap per titik dan hitung von Mises; jangan menjumlahkan maksimum dari lokasi berbeda. Deformasi global 3D tidak ditampilkan sebagai hasil solver solid. Bagian yang berupa pemulihan tegangan N/A±My/I diberi label, bukan disamarkan sebagai tegangan solid FE.

### Sambungan 04 — submodel yang terbatas

FE hanya menganalisis pelat berlubang dengan traction tumpu yang ditetapkan; tidak ada kontak, pin deformabel, clearance, eksentrisitas, atau solver geser pin 3D. τpin=F/(mApin) tetap pembanding analitis terpisah. Kasus 04-K menjalankan pelat tengah dengan F penuh dan satu pelat luar dengan F/2, tidak menggambar dua bidang geser sebagai elemen solid planar yang sama.

Pelat: x∈[0,8d], y∈[−3d,3d], pusat lubang (3d,0), radius r=d/2. d lubang sama dengan d pin hanya idealisasi tanpa kontak. Kiri ux=uy=0, tepi lain bebas selain bagian lubang yang dibebani. Pada setengah lingkaran kanan φ∈[−π/2,π/2], traction yang diberikan ke pelat = p0 cosφ(cosφ,sinφ); p0=2Fplate/(πrt). Resultan x=Fplate, y=0. p0 bukan σbearing nominal=Fplate/(td); puncak FE tidak ditargetkan sama dengan nominal. E=200 GPa, ν=0,3, Sy=250 MPa data latihan baru.

## Domain, pemrosesan dan batas

Semua model statis, elastis linier, isotropik, regangan/perpindahan kecil. Exclude plasticity, contact, buckling, vibration/fatigue, residual welding stress, geometri CAD bebas, shell/out-of-plane plate bending dan solver 3D. Tidak ada hasil kapasitas/SWL/aturan kelas.

Input tambahan numerik: E>0, 0≤ν≤0,45, Sy>0, ketebalan>0; ukuran utama 0,1–100.000 mm, celah radial/dinding ≥0,01 mm dan ≥0,001 ukuran luar. L/tinggi≥10 untuk pembanding Euler–Bernoulli. Ini batas UI latihan FE tersendiri, bukan perubahan domain modul analitis yang sudah ada. Domain lebih ketat dekat inkompresibilitas menghindari klaim atas elemen displacement yang belum diuji locking.

Hentikan interpretasi elastis saat σvm≥Sy; cutoff regangan utama |εi|>1%; balok |δ|/L>2%; |rotasi|>0,05 rad; torsi γmax>1% atau |θ|>0,05 rad; termal bebas |αΔT|>1%. Batas adalah keputusan pedagogis, bukan standar. Di luar domain: statika/tegangan prediksi linier boleh dilihat dengan label hipotetis; deformasi, rekomendasi lulus dan faktor keamanan sebagai keputusan tidak ditampilkan. Nol gaya tidak menyebabkan pembagian nol; n tidak terdefinisi pada tegangan nol.

## Arsitektur yang ditargetkan F1

Browser lokal tanpa backend/akun baru. JavaScript ES modules, Float64Array, kernel murni terpisah dari UI; Web Worker untuk solve, cancel dan progress. K assembler sparse; eliminasi Dirichlet dengan koreksi RHS untuk perpindahan nonnol. Kendala rata-rata/gauge diselesaikan lewat proyeksi/eliminasi yang teruji; bila Lagrange multipliers digunakan jangan memakai PCG pada matriks indefinite. Acuan kecil dense LDLᵀ/Cholesky hanya untuk verifikasi, bukan invers matriks eksplisit.

Skalakan DOF campuran translasi/rotasi dengan panjang karakteristik sebelum residual/conditioning. Solver utama sistem SPD yang telah direduksi; deteksi pivot negatif/nyaris nol, mekanisme, rigid modes, konektivitas lepas, elemen terbalik/degenerat dan NaN. Tidak menambahkan pegas lemah diam-diam untuk menutupi tumpuan salah. Keseimbangan mencakup beban ekuivalen termal dan momen dari gaya terdistribusi.

Batas awal yang akan dibenchmark F1: 10.000 DOF bebas, 8.000 elemen; hentikan/beri pilihan mesh lebih kasar bila terlampaui. Target solve mesh sedang ≤3 s, halus ≤10 s pada laptop uji yang spesifikasinya dicatat F1; bukan klaim performa yang sudah tercapai. UI tetap responsif; cancel ≤500 ms setelah pemeriksaan chunk. Bila target belum tercapai, perbaiki algoritma atau turunkan cap secara terdokumentasi, bukan memberi hasil palsu.
