# M1 — Fondasi Situs dan Desain

Tanggal: 27 November 2026 (WIB) · Status: selesai sesuai cakupan M1.

## Hasil

- Identitas teks Polibatam, tema terang sage–oranye, sidebar, peta belajar 10 modul dan ilustrasi konsep SVG. Tanda kubus adalah identitas laboratorium, bukan logo resmi Polibatam.
- Templat modul berisi tujuan belajar, konsep awal, pertanyaan eksplorasi, prasyarat, kasus Mesin/Kapal dan tombol Contoh Perhitungan.
- Halaman perhitungan tersendiri untuk 20 kasus, memakai dataset M0: input, validasi dasar, desimal koma/titik, reset, ringkasan data dan kerangka langkah penyelesaian.
- Konteks dan input tiap kasus dipisahkan dalam sessionStorage. Ini bukan progres belajar M7. Jika penyimpanan tidak tersedia, halaman tetap berfungsi tetapi persistensi tidak dijanjikan.
- Build statis menghasilkan 32 halaman (beranda, tentang, 10 modul, 20 hitungan) dan halaman 404. Output dapat dibuat ulang dan diabaikan Git.
- Tanpa dependensi npm eksternal, API key atau backend. Belum ada domain/deployment produksi.

## Batas hasil M1

Fungsi hitung, grafik, perubahan bentuk berdasarkan input, solusi numerik, prediksi interaktif dan latihan belum diimplementasikan. Gambar hanya ilustrasi umum; posisi beban dan dimensi tidak dihitung dari input. Tampilan menjelaskan batas ini dan tidak memberi hasil palsu.

Sepuluh modul dapat dijelajahi sebagai kerangka; belum dinyatakan sebagai modul pembelajaran lengkap.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Build statis | Lulus: 32 halaman dan halaman 404 |
| Tes otomatis fondasi | Lulus: lima kelompok tes, termasuk seluruh rute perhitungan, 20 preset, parser angka dan batas input |
| Sintaks JavaScript | Lulus |
| Browser desktop | Beranda, modul 02, tab konsep, halaman hitungan, Mesin/Kapal, input invalid, desimal koma, reload dan reset diperiksa |
| Layar sempit | Viewport iframe 320, 390, 768 px; lebar konten tidak melebihi area dokumen. Bukan pengujian perangkat fisik |
| Menu ponsel | Buka/tutup dan Escape diperiksa; sidebar tertutup disembunyikan dari fokus. Tab panel mendukung panah/Home/End |
| Perhitungan mekanika | Belum diuji sebagai aplikasi; 133 keluaran M0 tetap validasi dataset terpisah |

Pemeriksaan HTTP seluruh halaman dari terminal tidak dapat dijalankan pada jalur loopback pratinjau terkelola. Keberadaan rute diperiksa lewat build/tes, halaman perwakilan melalui browser. Tidak mengklaim audit aksesibilitas penuh atau pengujian seluruh browser/perangkat.

## Langkah berikutnya: M2

1. Lengkapi model batang aksial kasus 02-M dan 02-K.
2. Hubungkan F, d, L, E dengan luas, tegangan, regangan dan perubahan panjang.
3. Buat konversi → geometri → persamaan → substitusi → hasil → interpretasi, masing-masing dengan penjelasan singkat.
4. Tampilkan deformasi berskala dan grafik elastis; jangan menyiratkan perilaku plastis yang belum dihitung.
5. Tambahkan prediksi, latihan mandiri dan umpan balik kedua konteks.
6. Uji nilai acuan, satuan, nol/invalid input, perubahan parameter dan batas model. Tinjau satu modul lengkap sebelum memperluasnya.

Publikasi tidak dilakukan pada M1, mengikuti milestone kesiapan rilis yang disepakati.
