# F0 — Alur belajar, data dan tampilan

## Navigasi yang direncanakan

Setiap modul mempunyai Mesin/Kapal dan tautan `Analisis FE` ke `/modul/{id}/fe/{context}/`. Rute ini baru spesifikasi, belum dibuat oleh build. Tetap sediakan URL analitis `/modul/{id}/perhitungan/{context}/`. Halaman FE mengandung tab Model, Mesh, Hasil dan Bandingkan, bukan 20 aplikasi yang terpisah.

Urutan mahasiswa: baca kasus → prediksi perubahan respons → periksa data aktif/asumsi tambahan → amati beban/tumpuan → pilih mesh → solve → baca hasil → bandingkan analitis → refinement → refleksi. F2 memakai modul 06 Mesin/Kapal sebagai percontohan sebelum pola diperluas.

## Transfer input

- Tombol dari laboratorium/perhitungan mengirim snapshot input kanonik terverifikasi ke sessionStorage lokal dengan versi schema, caseId dan jenis model. Snapshot tidak dimasukkan sebagai JSON besar pada URL.
- Akses langsung tanpa snapshot memuat preset FE yang menggabungkan baseline M0 dan tambahan F0; UI menampilkan sumber setiap field. Satu kasus tidak boleh membaca snapshot kasus lain.
- A/B, bebas/terkekang dan tengah/luar adalah subrun. Simpan input fisik sama yang harus tetap sama; jangan membawa hasil A ke B sebagai hasil solver.
- Satuan inti N/mm/MPa/rad; SI untuk massa kg. Koma/titik desimal mengikuti parser situs, tanpa pemisah ribuan. Beban arah jelas; M01/M06 dan M09 mempunyai konvensi berbeda yang harus dipetakan, bukan disatukan lewat nilai absolut.
- Membuka halaman FE tidak mengubah input analitis. Tombol 'Gunakan input ini pada hitungan analitis' melakukan transfer eksplisit hanya field yang didukung. Semua asumsi tambahan tetap terlihat.
- Tidak ada akun, pengiriman data mahasiswa, API berbayar, upload CAD atau penyimpanan server baru. Refleksi tetap lokal seperti situs sekarang. Progres FE disimpan di key terpisah ber-versi dan tidak menimpa arti tuntas modul lama.

## Kontrak run

Request masa depan: `{schemaVersion, caseId, subcaseId, runId, kernel, canonicalInput, meshSpec, boundarySpec, samplingSpec}`. Worker response menyertakan `runId`, modelVersion, input hash, status, diagnostics, mesh, displacement, rawStress, recoveredStress opsional, reactions, energy, comparison dan timing. Definisi field numerik bersatuan eksplisit; NaN/Infinity tidak menjadi JSON hasil.

Input hash mencakup material, geometri, BC, tipe beban, subrun, mesh, sampling dan versi solver. Ubah salah satunya → hasil lama berlabel tidak berlaku dan solve aktif dibatalkan/diabaikan. Cancel/reload tidak menandai run berhasil. Hasil analitis dihitung secara terpisah dari numerik FE, bukan dipakai menggambar warna pengganti solver.

## Hasil minimum dan label

1. Model, kondisi batas, total beban, dimensi/ketebalan dan data material.
2. Jenis elemen: 'elemen balok pada bidang 2D', 'solid plane stress', 'solid axisymmetric', 'torsi penampang', atau 'superposisi BEAM2 + TOR2'.
3. Jumlah node, elemen, DOF aktif; kondisi solve, residual, gaya/momen seimbang dan waktu proses.
4. Mesh, bentuk awal/terdeformasi dengan faktor perbesaran serta batas tampilan; nol beban menggambar nol deformasi.
5. Besaran relevan per kernel; jangan menampilkan σzz=0 untuk AX2 atau menggunakan von Mises plane stress untuk tensor AX2/COMB lengkap. Von Mises dihitung dari tensor di lokasi yang sama.
6. Klik elemen menunjukkan koordinat integrasi, field raw dan recovered bila ada; pilihan averaging tidak mengubah angka raw yang dipakai verifikasi.
7. Perbandingan target yang setara: analitis, FE, satuan, lokasi, selisih absolut/relatif, dan alasan bila tidak comparable.
8. Studi tiga mesh menyimpan input fisik/BC sama; menunjukkan galat dan perubahan hasil, tanpa janji semua maksimum lokal monoton. Gunakan rentang warna bersama saat membandingkan mesh/alternatif atau tampilkan jelas jika autoscale.

Tidak memberi label aman. Bedakan 'solver selesai', 'belum terverifikasi', 'belum konvergen', 'di luar domain' dan 'memenuhi kriteria latihan'. Nilai n bukan batas model material yang bersertifikat. Di luar domain deformasi/rekomendasi tidak ditampilkan sebagai prediksi sah. Mesh tidak sah/tumpuan kurang memunculkan penjelasan tindakan, bukan kotak error teknis mentah.

## Langkah perhitungan FE terpandu

Panel: (1) data/satuan/idealisasi, (2) geometri dan pilihan elemen, (3) satu elemen terpilih dan B/D/Ke, (4) perakitan, gaya nodal dan BC, (5) Kff uf=bf dan reaksi, (6) pemulihan regangan/tegangan/energi, (7) validasi dan batas interpretasi. Matriks penuh hanya dapat dibuka pada contoh kecil ≤200 DOF; kasus besar menampilkan potongan matriks dan jumlah DOF, bukan ribuan sel yang membekukan browser. Rumus B/Ke berbeda per keluarga model.

## Aksesibilitas dan kinerja

SVG/canvas memiliki ringkasan teks, legenda dengan satuan, tabel hasil yang dapat dibaca tanpa warna, dan fokus keyboard untuk pilihan node/elemen. Teks utama ≥16 px, label penting ≥14 px. Ponsel menumpuk panel, tidak memerlukan drag presisi untuk seluruh tindakan. Reduced motion menghentikan animasi deformasi. Print menyertakan input, model, mesh, angka, target dan domain; tidak hanya kontur warna. Ekspor CSV/JSON lokal hasil terverifikasi dapat dibuat F7, tanpa merekam teks pribadi.

Jangan mengaktifkan 20 tombol FE sebelum rute/model bersangkutan tersedia. Pada branch pengembangan, modul yang belum tersedia berstatus 'direncanakan'; situs publik tetap versi analitis sampai rilis FE yang ditetapkan.
