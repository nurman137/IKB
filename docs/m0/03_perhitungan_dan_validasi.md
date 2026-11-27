# M0 — Halaman Perhitungan Interaktif dan Rencana Validasi

Versi 0.1 · 27 November 2026 (WIB)

Dokumen ini menetapkan kontrak implementasi. Checklist validasi aplikasi masih **belum dijalankan**, karena aplikasi belum dibuat.

## 1. Navigasi dan keadaan halaman

- Setiap modul mempunyai dua pilihan konteks: **Kasus Mesin** dan **Kasus Kapal**. Keduanya memiliki tujuan konsep yang sepadan dan data tersendiri.
- Tombol **Contoh Perhitungan** adalah tautan nyata ke halaman tersendiri, bukan hanya modal. Rute yang direncanakan: `/modul/02/perhitungan/mesin` dan `/modul/02/perhitungan/kapal`, dengan pola setara untuk modul lain. Ini spesifikasi rute; URL situs belum dibuat.
- Tombol kembali mempertahankan modul, konteks, dan input yang sudah sah. Muat ulang halaman perhitungan harus berfungsi langsung, termasuk pada hosting situs.
- Input Mesin/Kapal tersimpan terpisah. Beralih konteks tidak membawa dimensi kasus lain tanpa penjelasan.
- Halaman perhitungan terbuka dalam tab yang sama secara default; penggunaan tab baru tetap menjadi pilihan pengguna melalui tautan standar.

## 2. Urutan tampilan wajib

| Urutan | Panel | Perilaku wajib |
| --- | --- | --- |
| 1 | Judul, konteks, tujuan | Menyatakan komponen, model dan hal yang dihitung |
| 2 | Gambar kasus | Gaya, ukuran, sumbu, tumpuan, titik evaluasi; nilai label mengikuti input |
| 3 | Data diketahui | Input angka, satuan, arti simbol, batas input dan reset contoh |
| 4 | Asumsi model | Ringkas, terlihat sebelum hasil; detail dapat diperluas |
| 5 | Langkah 1: konversi | Menunjukkan konversi yang benar-benar diperlukan, misalnya 20 kN → 20.000 N |
| 6 | Langkah 2: geometri/reaksi | Menghitung luas, I, J, centroid atau reaksi sesuai kasus |
| 7 | Langkah 3: persamaan | Menampilkan simbol dan alasan pemilihan, bukan hanya rumus tanpa konteks |
| 8 | Langkah 4: substitusi | Angka dan satuan ditulis sesuai input aktif; tidak ada angka default tertinggal |
| 9 | Langkah 5: hasil | Nilai, satuan, tanda, pembulatan, dan lokasi fisik hasil |
| 10 | Makna hasil | Menjelaskan hubungan sebab-akibat; membedakan lulus kekuatan/lendutan/batas model |
| 11 | Coba ubah | Satu pertanyaan perubahan parameter dan opsi bandingkan bila relevan |
| 12 | Kembali/sumber | Kembali ke modul, sumber model, dan batas kesimpulan |

Mode belajar dapat membuka langkah satu per satu, dengan pilihan **Tampilkan semua langkah**. Jawaban contoh perhitungan boleh terlihat; latihan mandiri tetap memiliki alur tersendiri.

## 3. Contoh alur konkret untuk modul percontohan 02-M

Kasus: batang pengikat mesin, F=20 kN, d=20 mm, L=500 mm, E=200 GPa.

1. **Konversi:** F=20.000 N dan E=200.000 N/mm². Penjelasan: gunakan satuan konsisten sebelum substitusi.
2. **Luas:** A=πd²/4=314,159265… mm². Penjelasan: beban aksial nominal didistribusikan pada luas penampang.
3. **Tegangan:** σ=F/A=63,661977… MPa. Penjelasan: ini tegangan normal nominal pada bagian seragam, jauh dari penjepit.
4. **Regangan:** ε=σ/E=0,000318309886…=0,0318309886…%. Penjelasan: regangan tidak bersatuan; tampilan persen harus mengalikan 100.
5. **Perubahan panjang:** δ=εL=0,159154943… mm. Penjelasan: deformasi bergantung pada beban, panjang, luas dan E.
6. **Interpretasi:** memperbesar diameter dua kali lipat menghasilkan luas empat kali lipat, sehingga σ dan δ menjadi seperempat pada F, L dan E tetap.

Untuk 02-K gunakan F=30 kN, d=24 mm, L=1.200 mm dan E=200 GPa; hasil aktif harus berubah menjadi σ≈66,314560 MPa dan δ≈0,397887 mm. Jangan hanya mengganti judul konteks.

## 4. Kontrak data dan perhitungan

- Pisahkan isi materi, data kasus, fungsi hitung, format tampilan dan komponen visual.
- Satu hasil perhitungan terstruktur menjadi sumber bagi angka, grafik, substitusi dan interpretasi. Hindari rumus duplikat yang dapat berbeda antara grafik dan panel hitungan.
- Hasil menyertakan nilai mentah, satuan, tahapan, asumsi, status validasi, dan pesan alasan. Tidak menampilkan stack trace kepada mahasiswa.
- Gunakan presisi penuh untuk hitung lanjutan; pembulatan hanya saat ditampilkan. Default 3–6 angka signifikan sesuai jenis besaran, dengan opsi detail.
- Input menerima desimal Indonesia secara tidak ambigu; pemisah ribuan hanya format tampilan. Masukan `1,5` harus dibaca 1,5 dan teks ambigu ditolak dengan petunjuk. Uji fitur ini sebelum rilis.
- Torsi langsung dan mode daya–rpm adalah pilihan eksklusif; hindari dua sumber T aktif. Beban titik dan beban merata juga konfigurasi terpisah.
- Status hasil: **valid**, **input belum valid**, **di luar asumsi model**, **memenuhi kriteria latihan**, atau **belum memenuhi kriteria latihan**, sesuai pemeriksaan. Status kekuatan dan deformasi terpisah.
- Pada beban nol, n luluh tidak ditulis sebagai angka tak hingga tanpa penjelasan; tampilkan **tidak terdefinisi pada tegangan nol**. Gaya/tegangan/deformasi nol tetap sah.
- Data acuan `reference_cases.json` adalah dataset, bukan implementasi mesin perhitungan yang akan dipakai situs.

## 5. Batas dan validasi masukan

| Parameter/kondisi | Aturan |
| --- | --- |
| Semua input | Angka berhingga; teks kosong, NaN dan infinity tidak menghasilkan keluaran numerik lama |
| Panjang, E, diameter luar, dimensi penampang, tebal pelat | Harus >0 |
| Diameter dalam | 0≤di<do; untuk poros pejal di=0 |
| Rasio Poisson material latihan isotropik | Rentang UI 0≤ν<0,5; nilai negatif tidak dibahas pada versi awal; G dihitung dari E dan ν |
| Posisi beban balok 01 | 0≤a≤L; a=0/L adalah kasus batas di tumpuan, bukan error |
| Jumlah bidang geser | Pilihan diskret 1/2 mengikuti gambar; tidak boleh nilai pecahan |
| Daya dan rpm | Untuk konversi T=P/ω, rpm harus >0; P=0 sah; tanda putar tidak dicampur dengan tanda daya |
| Temperatur | ΔT boleh positif, nol, negatif; α>0 untuk material latihan yang disediakan |
| Sy dan n target | Sy>0; n target>1 untuk latihan desain; keduanya harus ditulis sebagai asumsi input |
| Tanda beban | Modul tarik awal F≥0; mode tekan dan beban gabungan mengizinkan gaya bertanda dengan diagram yang sesuai |
| Batas elastis | Jika tegangan ekuivalen mencapai/melampaui Sy, tampilkan batas model; jangan mengklaim menghitung perilaku plastis |
| Kelangsingan balok | Model awal dipakai untuk L/h≥10 sebagai batas pedagogis Euler–Bernoulli; di bawahnya hentikan klaim lendutan valid dan jelaskan pengaruh deformasi geser. Ambang ini bukan ketentuan universal |
| Tekan/thermal restraint | Nyatakan tekuk belum dievaluasi; hasil aksial elastis bukan pemeriksaan stabilitas |
| Profil I/T/L | Ketebalan geometris valid, rongga tidak negatif, centroid/I berasal dari geometri aktif; torsi nonmelingkar belum tersedia |

## 6. Kriteria verifikasi numerik saat implementasi

1. **Dataset dasar:** semua keluaran numerik yang diimplementasikan pada 20 kasus dibandingkan dengan `reference_cases.json`.
2. **Toleransi internal:** setiap besaran dengan satuannya lulus jika `|actual−reference| ≤ 1e−9 + 1e−6 |reference|`. Toleransi pada jawaban mahasiswa terpisah, default 1% untuk angka bukan nol dan toleransi absolut eksplisit sesuai satuan untuk hasil nol.
3. **Perhitungan pembanding:** pemeriksaan mandiri M0 memakai rumus ekuivalen berbasis SI di Python; implementasi situs nantinya diperiksa terhadap dataset, bukan memakai kalkulator situs untuk membuat nilai harapannya sendiri.
4. **Satuan setara:** input setara N/kN, mm/m, MPa/GPa serta N·m/N·mm menghasilkan nilai fisik sama.
5. **Kasus nol/simetri:** F=0 atau T=0 menghasilkan tegangan dan deformasi nol; beban tengah menghasilkan RA=RB; balok simetris memiliki lendutan maksimum di tengah.
6. **Kasus batas reaksi:** a=0 → RA=F, RB=0 dan M=0; a=L sebaliknya. Diagram tidak boleh menampilkan momen palsu.
7. **Perubahan parameter:** batang d×2 → σ/4 dan δ/4; poros pejal d×2 → τ/8 dan θ/16; balok h×2 → σ/4 dan δ/8; panjang poros ×2 → θ×2 dengan τ tetap.
8. **Keseimbangan dan diagram:** RA+RB=total gaya; momen ujung sendi–rol nol; dM/dx=V di interval mulus; loncatan V sama dengan gaya titik. Nilai kiri/kanan di diskontinuitas ditampilkan benar.
9. **Termal:** bebas → σtermal=0; terkekang penuh → δ=0; ΔT berubah tanda → σ berubah tanda.
10. **Gabungan:** τ=0 mereduksi von Mises ke |σ|; σ=0 mereduksi ke √3|τ|. Uji titik A dan B, bukan menjumlahkan maksimum dari lokasi berbeda.
11. **Rancangan:** 10-M kedua alternatif memenuhi batas default; 10-K alternatif B gagal lendutan tetapi lolos kekuatan. Jangan memberi satu label hijau yang menyembunyikan kegagalan lain.
12. **Energi 03:** verifikasi U=F²L/(2AE), dengan konversi N·mm ke joule (÷1.000). Ini pengayaan yang memerlukan fixture tambahan saat M3.
13. **Cakupan tambahan:** mode daya–rpm, beban merata, profil selain persegi panjang dan tegangan utama membutuhkan nilai acuan baru sebelum dinyatakan selesai; 20 kasus M0 tidak otomatis memvalidasi semua konfigurasi itu.

## 7. Pemeriksaan pengalaman belajar dan visual

- Mengubah input memperbarui label geometri, substitusi, hasil, grafik dan interpretasi; tidak ada nilai basi saat input invalid.
- Deformasi diperbesar diberi keterangan dan faktor skala; bentuk awal tersedia. Saat F=0 bentuk kembali ke awal.
- Warna gaya, tanda dan label tetap konsisten; teks dan bentuk tidak mengandalkan warna saja.
- Visual 2D diprioritaskan untuk diagram hitung, 3D untuk bentuk dan arah puntiran. Tetap dapat digunakan dengan gerakan animasi dikurangi.
- Semua input memiliki label, satuan, fokus keyboard dan pesan kesalahan yang terbaca; tombol mudah dipakai di layar sentuh.
- Layar laptop dan ponsel tidak memotong kontrol. Grafik/diagram tetap terbaca tanpa menghilangkan informasi satuan/sumbu.
- Solusi bertahap menjelaskan alasan, bukan sekadar deretan angka. Bahasa utama Indonesia, istilah Inggris pendamping bila membantu.
- Pada 04, pin shackle/clevis harus sesuai jumlah bidang geser yang benar-benar digambar. Jangan menganggap setiap padeye otomatis double shear.
- Untuk perbandingan SolidWorks, gunakan model, material, unit, pembebanan dan tumpuan setara; jelaskan singularitas dan jangan memakai tegangan puncak singular untuk memvalidasi tegangan nominal.

## 8. Status validasi M0

M0 hanya memeriksa konsistensi aritmetika 20 preset melalui perhitungan pembanding. Hasil dan jumlah keluaran yang diperiksa dicatat pada `04_milestone_dan_serah_terima.md`. Belum ada klaim simulasi, navigasi, grafik, aksesibilitas, penyimpanan progres, atau integrasi situs yang sudah lulus uji.
