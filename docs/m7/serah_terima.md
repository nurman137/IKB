# M7 — Fitur Pembelajaran Terpadu

Tanggal: 27 November 2026 (WIB). Status: **M7 selesai.** Fitur menyimpan dan menampilkan hasil aktif sungguhan di perangkat pengguna, tanpa mengklaim rekap nilai kelas.

## Fitur

| Fitur | Perilaku |
| --- | --- |
| Progres per perangkat | Mencatat modul yang dibuka, halaman perhitungan, prediksi (dijawab/tepat), skor latihan terbaik (0–2) dan ada/tidaknya refleksi, per modul dan konteks. Disimpan di `localStorage` (`ikb-progress-v1`). Tidak menyimpan teks jawaban dan tidak dikirim ke server. Kartu modul di beranda menampilkan status: "Belum dibuka", "Sudah dibuka", "Sedang dipelajari" atau "Tuntas dipelajari" (prediksi dijawab dan latihan 2/2 pada setidaknya satu konteks). Halaman `/progres/` menampilkan tabel lengkap dan tombol hapus dengan konfirmasi. Jika penyimpanan diblokir, halaman menampilkan pemberitahuan dan modul tetap berfungsi. |
| Glosarium | Halaman `/glosarium/` berisi 35 istilah (Indonesia + Inggris), simbol, satuan, definisi sesuai model situs, dan tautan ke modul terkait. Tersedia pencarian langsung dengan jumlah hasil yang dibacakan pembaca layar. Setiap modul memiliki minimal satu istilah. |
| Mode presentasi | Tombol di bilah atas menyembunyikan navigasi samping, memperbesar huruf (19 px) dan diagram untuk proyektor. Semua kontrol tetap dapat dipakai. Status disimpan per sesi dan tombol memakai `aria-pressed`. |
| Cetak ringkasan | Tombol "Cetak ringkasan perhitungan" (atau "Cetak halaman" di laboratorium) pada semua modul aktif. Sebelum mencetak, semua langkah dibuka otomatis lalu dikembalikan setelahnya. Gaya cetak menyembunyikan navigasi, tombol, prediksi dan latihan; data input dicetak dalam grid tiga kolom; kepala cetak berisi modul, konteks, waktu cetak dan pernyataan data latihan. Rujukan dicetak beserta URL-nya. Contoh 08-K: 5 halaman A4. |
| Bandingkan yang relevan | Sudah tersedia di modul: pembanding E (03), tabel "coba ubah" (05–09), orientasi A/B dan bujur sangkar (07), alternatif rancangan (10). Tidak ditambah perbandingan baru yang tidak bermakna. |
| Gerak dikurangi | `prefers-reduced-motion` mematikan transisi dan efek hover. |

## Pemeriksaan

- **6 kelompok tes baru (`tests/m7.test.mjs`)**: pencatatan per konteks, skor terbaik tidak turun, prediksi tepat tidak terhapus jawaban salah berikutnya, penolakan modul/konteks/jenis tak dikenal, data rusak atau versi lain, penyimpanan diblokir, tidak ada teks jawaban yang tersimpan, kelengkapan glosarium, serta rute dan berkas `/progres/` dan `/glosarium/`.
- Browser: progres tercatat dari modul 02 (tampilan aksial), 05 (tampilan torsi) dan 09 (kerangka laboratorium); tampil di beranda dan tabel; hapus progres; glosarium dan pencarian; mode presentasi aktif/nonaktif, bertahan setelah reload; cetak (PDF dirender dan diperiksa visual). Konteks dengan `localStorage` diblokir tetap berfungsi. Lebar 320 px tanpa scroll horizontal.
- Temuan saat pengujian yang sudah diperbaiki: tata letak cetak awal mendorong panel input ke halaman 2 sehingga halaman 1 hampir kosong; `beforeprint` ganda dapat meninggalkan langkah terbuka.

## Batas

Progres tidak tersinkron antarperangkat atau browser, hilang bila data situs dihapus, dan bukan penilaian. Tidak ada akun, LMS atau rekap dosen; itu lingkup terpisah bila kelak diminta.
