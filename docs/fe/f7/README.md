# F7 — Alur belajar, progres lokal dan ekspor FE

Selesai sebagai bagian kandidat FE-1.0.0-rc.1. Keenam keluarga tampilan memakai panel bersama `web/fe/learning.js`.

- Prediksi konseptual sesuai keluarga (tumpu lokal, warping, tensor gabungan, termal, Poisson atau konvergensi).
- Latihan cek pemahaman dengan pembahasan: periksa kesetaraan model/beban/tumpuan/titik ukur sebelum menilai selisih.
- Refleksi berupa penanda kemampuan menjelaskan perbedaan dan batas; tidak menyimpan teks pribadi.
- Progres khusus FE: `ikb-fe-progress-v1`, terpisah dari `ikb-progress-v1` analitis. Tiap modul dan konteks independen. Rangkaian selesai memerlukan prediksi benar, satu solve lengkap dalam domain, latihan benar dan refleksi. Ini penanda belajar, bukan nilai kelas atau status konvergensi run aktif. Ringkasan seluruh 20 kasus dan penghapusan progres FE tersedia.
- Ekspor JSON/CSV lokal hanya dari hasil lengkap yang sudah melewati gerbang domain masing-masing view. Input/mesh berubah, cancel/reset atau gagal menonaktifkan ekspor. Pergantian tampilan/elemen tidak mengubah besaran fisik.
- JSON membawa versi schema/rilis, caseId, satuan inti, input, model/mesh/BC/beban, hasil numerik mentah, summary dan diagnostics. Array numerik dikonversi eksplisit. Nonfinite pada hasil ditolak; input tidak aktif nonfinite ditandai `omittedNonFinite`, bukan disamarkan sebagai nilai angka. COMB membawa dua submodel dan satu summary tensor gabungan.
- CSV memuat perbandingan atau tensor/path, unit dan lokasi; penanganan quoting diuji. Status tetap `solved_unverified`; ekspor tidak mengubahnya menjadi klaim aman/konvergen.
- Cetak FE menggunakan isi halaman dan membuka langkah tertutup sebelum print, lalu mengembalikannya. Input, idealisasi, mesh, hasil dan batas tetap ada. CSS cetak khusus mengatur satu kolom dan tabel; dialog/printer fisik belum menjadi bukti pengujian perangkat.
- Glosarium ditambah mesh, DOF, residual, konvergensi, gauge, plane stress, axisymmetric dan path tetap.

Tes murni memeriksa penyimpanan korup/tidak tersedia, isolasi konteks/versi, tidak menimpa progres analitis, nol/invalid export, typed array, format CSV, nonfinite dan struktur dua kernel COMB. Browser memeriksa progres tetap ada setelah pindah halaman, prediksi/latihan/refleksi, JSON/CSV unduhan aktual, penguncian ekspor saat input berubah/di luar domain, serta ekspor aktif untuk BEAM2/AX2/TOR2/COMB/PS2.

Data tetap di browser, tanpa akun, LMS, server penyimpanan atau pengiriman jawaban. Hasil solve historis pada progres tidak berarti hasil yang sedang tampil sah; tombol ekspor mengikuti snapshot aktif secara terpisah.
