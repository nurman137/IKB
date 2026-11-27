# M2 — Tegangan–Regangan Lengkap

Tanggal: 27 November 2026 (WIB). Status: selesai untuk lingkup modul 02, konteks Mesin dan Kapal. Modul 01 dan 03–10 masih kerangka M1. Belum ada deployment situs.

## Fitur yang sudah aktif

- Dua kasus: batang pengikat mesin (02-M) dan tie rod struktur kapal (02-K).
- Halaman laboratorium `/modul/02/?kasus=mesin` atau `?kasus=kapal`; tautan Contoh Perhitungan ke halaman tersendiri bagi masing-masing konteks.
- Input F, d, L₀ dan E; pilihan N/kN, mm/m, MPa/GPa. Konversi satuan mempertahankan besaran fisik, menerima koma/titik desimal tanpa pemisah ribuan.
- Luas penampang, tegangan normal, regangan, persen regangan, pertambahan panjang dan panjang akhir dihitung dengan presisi penuh; tampilan dibulatkan.
- Enam langkah: satuan → luas → tegangan → regangan → perubahan panjang → interpretasi, termasuk substitusi dan penjelasan. Dapat dibuka satu per satu atau sekaligus.
- Gambar deformasi aksial yang mengikuti regangan, bentuk awal, label beban/dimensi, faktor perbesaran 1×/100×/500× dan keterangan jika penggambaran dibatasi ruang gambar. Diameter tetap dalam gambar karena kontraksi lateral belum dimodelkan.
- Grafik σ–ε linier dengan titik aktif dan satuan sumbu. Sumbu sama untuk pembandingan E=70/200 GPa pada Sy=250 MPa, sehingga perubahan kemiringan dapat dibaca; bukan data uji tarik atau kurva plastis.
- Slider gaya, lepas/pulihkan beban, diameter ×2 dan reset contoh.
- Satu prediksi konsep dan satu latihan hitungan dua jawaban per konteks. Latihan memakai data berbeda dari contoh interaktif. Umpan balik menerima toleransi 1%; pembahasan dibuka setelah percobaan dengan jawaban numerik pada kedua isian. Refleksi terpisah untuk kedua konteks.
- Input, satuan dan skala disimpan sementara dalam sesi browser dan dipakai bersama halaman laboratorium/perhitungan pada konteks yang sama. Bukan fitur progres kelas M7.

## Model dan batas

Batang pejal melingkar, seragam, tarik sentris, homogen dan elastis linier: A=πd²/4, σ=F/A, ε=σ/E, δ=εL₀. Nilai sifat material adalah asumsi latihan.

Sy default 250 MPa adalah batas luluh latihan yang dapat diubah, bukan data grade material terverifikasi. Saat σ≥Sy, atau ε>1% (ambang regangan kecil pedagogis), regangan/deformasi dan titik aktif grafik disembunyikan. Luas dan tegangan nominal tetap dapat ditampilkan. Batas luluh memakai penjagaan roundoff relatif 10⁻¹² agar input tepat pada ambang tidak lolos akibat floating point.

Input invalid membersihkan hasil, diagram dan tahapan numerik yang lama. Nilai ekstrem/overflow ditolak. Gaya nol sah dan menghasilkan tegangan, regangan serta deformasi nol. Model tekan, tekuk, ulir, lubang, konsentrasi tegangan, kontraksi lateral dan perilaku plastis belum tersedia.

Hasil di bawah batas latihan tidak diberi label “komponen aman”; belum ada evaluasi desain lengkap atau kepatuhan klasifikasi kapal.

## Acuan numerik

| Kasus | F | d | L₀ | E | σ | δ |
| --- | --- | --- | --- | --- | --- | --- |
| 02-M | 20 kN | 20 mm | 500 mm | 200 GPa | 63,661977 MPa | 0,159154943 mm |
| 02-K | 30 kN | 24 mm | 1.200 mm | 200 GPa | 66,314560 MPa | 0,397887358 mm |

Angka pembanding diambil dari dataset M0 yang sudah diperiksa terpisah. Target jawaban latihan diverifikasi dengan angka acuan independen dalam pengujian, bukan dihasilkan oleh UI untuk menguji dirinya sendiri.

## Verifikasi

- Build statis dan pemeriksaan sintaks berhasil. Tetap 32 halaman dan halaman 404.
- **14 kelompok tes otomatis lulus**: 5 fondasi dan 9 aksial, mencakup dua preset M0, kesetaraan satuan, pengaruh d/L/E/F, beban nol, ambang luluh, regangan berlebih, input invalid/ekstrem, latihan, prediksi dan konsistensi sumbu grafik.
- Browser desktop: perubahan diameter, lepas/reset, konversi satuan, tampilkan semua langkah, kondisi di luar model, hasil invalid, prediksi dan latihan kedua konteks diperiksa. Pembahasan serta direct reload halaman perhitungan juga diperiksa.
- Browser responsif: laboratorium/perhitungan diperiksa melalui viewport iframe 320/390/768 px; tidak ada lebar konten yang melebihi area dokumen. Ini bukan pengujian perangkat fisik atau audit aksesibilitas menyeluruh.
- Perhitungan modul lain belum diaktifkan atau dinyatakan lulus. Validasi 133 keluaran seluruh kasus M0 tetap terpisah dari implementasi M2.

## Sumber teknis

Model dasar ditelusuri pada [MIT OpenCourseWare, Mechanics & Materials I, Lecture 8](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/96d197323da3b199ebd978a8cb06757d_lec8.pdf), halaman 4–6 (penomoran PDF). Sumber diperiksa 27 November 2026. Gambar, penjelasan, data latihan dan UI disusun sendiri; tidak menyalin gambar sumber.

## Langkah berikutnya

**M3 — Dasar dan Sambungan:** lengkapi modul 01, 03 dan 04, dengan dua kasus per modul. Tambahkan diagram benda bebas, kekakuan/Poisson/energi elastis, serta pin geser tunggal/ganda dan tegangan tumpu. Gunakan modul 02 sebagai pola interaksi serta solusi bertahap. Tambahkan fixture khusus untuk fungsi baru sebelum menyatakan hasilnya selesai.
