# M3 — Dasar dan Sambungan

Tanggal: 27 November 2026 (WIB). Status: selesai untuk modul 01, 03 dan 04, dengan satu kasus Mesin dan satu Kapal pada setiap modul. Bersama M2, modul 01–04 sudah aktif; modul 05–10 masih kerangka. Situs belum dipublikasikan.

## Fitur pembelajaran

| Modul | Fitur yang tersedia |
| --- | --- |
| 01 — Membaca Beban | Galeri tarik, tekan, geser, lentur, torsi; balok sendi–rol; reaksi dari keseimbangan; posisi beban/potongan; V kiri/kanan dan M; diagram sepanjang bentang; kondisi beban tepat di tumpuan |
| 03 — Elastisitas/Hukum Hooke | k=AE/L, deformasi aksial, kontraksi Poisson, perubahan diameter, G isotropik, energi elastis dan konversi ke joule; tabel serta grafik pembanding E=70 GPa |
| 04 — Geser dan Sambungan | Pin satu/dua bidang geser; geometri mengikuti mode; gaya tiap bidang; tumpu pelat tengah dan tiap pelat luar; tebal pelat dapat diubah terpisah |

Semua modul mempunyai dua konteks, halaman Contoh Perhitungan tersendiri, input dan satuan yang dapat diubah, reset/lepas beban, penyelesaian bertahap dengan alasan singkat, prediksi konsep, latihan dua jawaban, pembahasan setelah mencoba dan refleksi. Nilai/konteks disimpan per modul–kasus dalam sesi browser, bukan sebagai progres atau nilai kelas.

Urutan solusi menggunakan konversi satuan, model, persamaan, substitusi dan interpretasi; tidak sekadar menampilkan kalkulator hasil akhir. Model dan tampilan dipisahkan pada source. Dataset M0 tetap menjadi acuan independen.

## Data acuan dan hasil utama

| Kasus | Hasil utama pada input awal |
| --- | --- |
| 01-M | RA=6,666667 kN; RB=3,333333 kN; M maksimum=2,666667 kN·m |
| 01-K | RA=12 kN; RB=8 kN; M maksimum=9,6 kN·m |
| 03-M | k=125.663,7061 N/mm; δ=0,07957747 mm; Δd=−0,00095493 mm; U=0,39788736 J |
| 03-K | k=98.174,7704 N/mm; δ=0,15278875 mm; Δd=−0,00114592 mm; U=1,14591559 J |
| 04-M | τ pin=106,103295 MPa; tumpu pelat=125 MPa |
| 04-K | τ pin=63,661977 MPa; tumpu tengah=166,666667 MPa; tiap luar=100 MPa |

Seluruh angka adalah asumsi latihan. Enam kasus memakai data dasar M0; x potongan, Sy latihan dan tebal luar untuk eksplorasi mode tambahan ditetapkan eksplisit pada UI. Data latihan mandiri berbeda dari preset contoh.

## Pemeriksaan yang dilakukan

- **26 kelompok tes otomatis lulus:** 14 pemeriksaan fondasi/M2 dan 12 kelompok baru M3.
- Enam kasus M3 cocok dengan seluruh 31 keluaran numerik acuannya pada M0. Energi dan target enam latihan diperiksa dengan angka pembanding SI tersendiri.
- Pemeriksaan meliputi ΣF/ΣM, beban di kedua tumpuan, potongan di beban, loncatan V, momen ujung, hubungan dM/dx=V, beban nol dan simetri.
- Hooke diperiksa untuk pengaruh F/L/E, Poisson nol dan batas ν, energi kuadratik terhadap F, satuan N·mm→J, pembanding E dan penonaktifan deformasi/energi di luar domain elastis. Negative zero dinormalisasi agar pelepasan beban/ν=0 tampil sebagai nol.
- Pin diperiksa untuk perubahan jumlah bidang dan tebal pelat, beban nol, geometri invalid, pembagian F dan F/2 dan domain numerik.
- Browser desktop: kontrol model, reset, invalid input, satu/dua bidang dan E=70 GPa diperiksa. Keenam latihan dan pembahasannya memberi hasil benar; keenam halaman perhitungan diuji dengan kunjungan langsung dan reload.
- Browser responsif: viewport iframe 320/390/768 px diperiksa, termasuk tabel pembanding dan navigasi ponsel. Ini bukan pengujian perangkat fisik atau audit aksesibilitas menyeluruh.
- Build tetap menghasilkan 32 halaman serta 404. Source tidak memerlukan dependensi npm eksternal.

## Konvensi dan batas model

### Membaca Beban

Model hanya satu beban titik ke bawah pada balok sendi–rol; berat sendiri diabaikan. Reaksi dan gaya dalam bukan evaluasi tegangan/lendutan. V positif digambar di atas garis nol; M positif sagging. V kiri/kanan dibedakan pada gaya titik serta ujung. Penjagaan roundoff geometris mempertahankan loncatan saat posisi potongan sama dengan lokasi beban setelah konversi satuan.

### Elastisitas dan Hukum Hooke

Material homogen isotropik elastis linier, tarik sentris, penampang seragam. E tidak dipakai untuk menyimpulkan kekuatan. Deformasi, kontraksi dan energi disembunyikan saat batas luluh latihan atau batas regangan kecil M2 terlampaui. Grafik energi tidak menghitung deformasi plastis atau hysteresis. Perbesaran gambar dibatasi ruang gambar dan diberi keterangan; nilai numerik tetap menjadi rujukan aktual.

### Geser dan Sambungan

Menghitung tegangan rata-rata/nominal, bukan maksimum lokal. Tunggal: kedua pelat diasumsikan sama tebal; eksentrisitas dan lentur pin diabaikan. Ganda: dua pelat luar sama tebal dan pembebanan simetris; pelat tengah menerima F penuh, tiap luar F/2. Tidak mengevaluasi luluh, sobek tepi, penampang netto, las, clearance, fatigue atau SWL/kapasitas padeye. Tidak menampilkan klaim sambungan aman.

## Rujukan konsep

Sumber diperiksa 27 November 2026; gambar dan uraian UI dibuat sendiri.

- [MIT OCW, Mechanics & Materials I, Lecture 5](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/0b739c732b57ee6d4221b5cfce732769_lec5.pdf): diagram benda bebas, gaya dalam dan keseimbangan.
- [MIT OCW, Lecture 8](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/96d197323da3b199ebd978a8cb06757d_lec8.pdf), halaman PDF 4–6: relasi aksial dan kekakuan. U=½Fδ diturunkan sebagai luas segitiga pada hubungan linier.
- [David Roylance, Shear and Torsion, MIT](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf), halaman PDF 3–4: relasi elastisitas isotropik.
- [University of Arizona, OPTI 222, Concepts of Stress and Strain](https://wp.optics.arizona.edu/optomech/wp-content/uploads/sites/53/2016/10/OPTI_222_W1.pdf), halaman PDF 3–5: geser pin, clevis dan luas proyeksi untuk tumpu.

## Saran langkah berikutnya

**M4 — Torsi, Lentur, dan Penampang (modul 05–07).** Implementasikan poros pejal/berongga dan mode daya–rpm, balok dengan beban titik/merata beserta tegangan/lendutan, serta properti dan orientasi penampang. Tambahkan nilai acuan untuk setiap konfigurasi baru; jangan menganggap enam kasus M3 telah memvalidasi fungsi M4.
