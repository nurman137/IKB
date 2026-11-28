# Progres keseluruhan dan serah terima IKB Polibatam

**Diperbarui: 28 November 2026 (WIB).** Dokumen ini menjadi titik awal untuk melanjutkan proyek di Claude atau lingkungan pengembangan lain.

## 1. Posisi saat serah terima

| Bagian | Posisi terverifikasi |
| --- | --- |
| Repository | https://github.com/nurman137/IKB |
| Branch pengembangan FE | `feat/fem-f0` — lanjutkan dari branch ini, bukan hanya `main` |
| Commit implementasi terakhir | `8d15507382dcc5cf234c63ee362d8ec5e1c5d27c` |
| Branch main | `8aa939defe0b41d832186b6b7eeece6477ad1568` |
| Pull request | [PR #2](https://github.com/nurman137/IKB/pull/2), open, **draft**, belum merge |
| Hasil cek GitHub saat dokumen dibuat | PR mergeable=true, mergeable_state=clean; dapat berubah jika branch berubah |
| Situs yang sudah ada | https://ikb-polibatam.sleekdune.chatgpt.site/ |
| Status publik terakhir yang tercatat | Versi pembelajaran analitis M0–M8 sudah publik; pengembangan FE belum diterbitkan |
| Cakupan FE | **20/20 kasus**, 10 modul × Mesin/Kapal |
| Kandidat rilis FE | **FE-1.0.0-rc.1**, implementasi F0–F8 selesai untuk ditinjau |
| Pengujian terakhir | **189/189 kelompok tes lulus** (setelah perbaikan aksesibilitas dan ekspor JSON ringkas, 28 November); audit 20 kasus /29 submodel |

Commit di atas adalah baseline implementasi sebelum commit dokumentasi serah terima ini. Periksa HEAD terbaru sebelum melanjutkan. Permintaan saat ini hanya membuat dokumentasi progres; tidak ada merge atau deploy pada tahap serah terima ini.

## 2. Tujuan produk dan keputusan pengguna

Situs pembelajaran Ilmu Kekuatan Bahan untuk Politeknik Negeri Batam, relevan bagi Teknik Mesin dan Perkapalan. Setiap modul memiliki contoh hitungan pada halaman tersendiri, angka yang dapat diubah, solusi langkah demi langkah dan penjelasan singkat. Terdapat 20 kasus: satu Mesin dan satu Kapal untuk setiap modul.

Pengayaan FE memakai model yang sesuai bagi tiap kasus. Istilah 2D tidak berarti semua kasus diselesaikan sebagai pelat plane stress. Label elemen garis, axisymmetric, torsi penampang, plane stress dan superposisi harus tetap jelas.

Keputusan yang perlu dipertahankan:

- Kalkulator analitis dan data acuan M0 tetap tersedia; FE merupakan pengayaan, bukan pengganti diam-diam.
- Konteks Mesin/Kapal dan subrun A/B, bebas/terkekang, tengah/luar tidak boleh tercampur.
- Input, konversi satuan, tanda, kondisi batas, titik sampling dan batas model harus terlacak.
- Jangan menampilkan hasil lama sebagai hasil aktif setelah input/mesh berubah; cancel harus membatalkan interpretasi hasil lama.
- Tidak ada klaim poros/sambungan aman, SWL, atau kepatuhan aturan klasifikasi kapal.
- Tanpa akun/LMS/server data mahasiswa; progres dan ekspor berada di browser/perangkat.
- Gaya antarmuka dan materi berbahasa Indonesia dipertahankan.

## 3. Milestone situs dasar M0–M8

Seluruh tahap situs dasar selesai sebelum penambahan FE. Detail historis ada di `docs/m0` sampai `docs/m8`.

| Tahap | Hasil |
| --- | --- |
| M0 | Spesifikasi pembelajaran, register 20 kasus, input/output acuan dan validasi |
| M1 | Fondasi situs, navigasi, pilihan konteks dan kerangka halaman |
| M2 | Modul 02 tegangan–regangan, kalkulator dan visual aktif |
| M3 | Modul 01/03/04: beban, Hooke/Poisson/energi, geser/sambungan |
| M4 | Implementasi awal modul 05–07: torsi, lentur dan penampang |
| M5 | Penyelesaian modul 07–09: penampang, termal dan beban gabungan |
| M6 | Modul 10 Studio Desain, perbandingan alternatif dan pendamping SolidWorks |
| M7 | Progres lokal, glosarium, mode presentasi dan cetak ringkasan |
| M8 | Validasi rilis, koreksi prapublikasi dan persiapan hosting |

Kesepuluh modul: 01 Membaca Beban; 02 Tegangan–Regangan; 03 Elastisitas/Hukum Hooke; 04 Geser/Sambungan; 05 Torsi/Poros; 06 Lentur Balok; 07 Bentuk Penampang; 08 Temperatur; 09 Beban Gabungan/Keamanan; 10 Studio Desain.

## 4. Milestone FE F0–F8

| Tahap | Status dan hasil | Bukti utama |
| --- | --- | --- |
| F0 | Selesai: pemetaan 20 kasus, formulasi/tanda/BC, tambahan asumsi, toleransi dan milestone | [Spesifikasi F0](docs/fe/f0/README.md) |
| F1 | Selesai: elemen BEAM2/PS2, sparse assembler, solver, BC, reaksi, diagnostik, Worker/cancel | [Fondasi F1](docs/fe/f1/README.md) |
| F2a | Selesai: percontohan 06 Mesin/Kapal, BEAM2 dan pengayaan PS2 T6 | [F2a](docs/fe/f2a/README.md) |
| F2b | Selesai: 01/07 Mesin–Kapal dan 10-K; total 7 kasus FE | [F2b](docs/fe/f2b/README.md) |
| F3 | Selesai: AX2 02/03/08 Mesin–Kapal; total 13 kasus | [F3](docs/fe/f3/README.md) |
| F4 | Selesai: TOR2 05-M/K dan 10-M; total 16 kasus | [F4](docs/fe/f4/README.md) |
| F5 | Selesai: superposisi 09-M/K; total 18 kasus | [F5](docs/fe/f5/README.md) |
| F6 | Selesai: PS2 pelat sambungan 04-M/K, pembanding independen; total 20 kasus | [F6](docs/fe/f6/README.md) |
| F7 | Selesai: prediksi, pemahaman, refleksi, progres FE terpisah, cetak, JSON/CSV, glosarium | [F7](docs/fe/f7/README.md) |
| F8 | Audit teknis selesai; kandidat rilis disiapkan, belum diterbitkan | [Audit F8](docs/fe/f8/README.md) |

**Catatan membaca dokumen:** F0 sengaja menyimpan status `planned` dan keterangan belum ada solver sebagai riwayat spesifikasi saat F0 dibuat. Jangan menyimpulkan implementasi terkini belum ada dari keterangan historis tersebut. Gunakan dokumen ini dan F8 untuk posisi keseluruhan.

## 5. Pemetaan lengkap 20 kasus

M = Teknik Mesin; K = Perkapalan. Semua rute berikut tersedia pada branch FE, belum berarti tersedia di situs publik.

| Kasus | Model utama | Rute FE |
| --- | --- | --- |
| 01-M | BEAM2, beban eksentris/statika/potongan | `/modul/01/fe/mesin/` |
| 01-K | BEAM2, beban eksentris/statika/potongan | `/modul/01/fe/kapal/` |
| 02-M | AX2 tarik/Poisson | `/modul/02/fe/mesin/` |
| 02-K | AX2 tarik/Poisson | `/modul/02/fe/kapal/` |
| 03-M | AX2 Hooke/Poisson/energi | `/modul/03/fe/mesin/` |
| 03-K | AX2 Hooke/Poisson/energi | `/modul/03/fe/kapal/` |
| 04-M | PS2 T6 pelat berlubang, satu pelat | `/modul/04/fe/mesin/` |
| 04-K | PS2 T6 pelat tengah F dan satu pelat luar F/2 | `/modul/04/fe/kapal/` |
| 05-M | TOR2 torsi penampang | `/modul/05/fe/mesin/` |
| 05-K | TOR2 torsi penampang | `/modul/05/fe/kapal/` |
| 06-M | BEAM2; PS2 T6 pengayaan lentur persegi panjang | `/modul/06/fe/mesin/` |
| 06-K | BEAM2; PS2 T6 pengayaan lentur persegi panjang | `/modul/06/fe/kapal/` |
| 07-M | BEAM2 properti/orientasi penampang; PS2 untuk persegi panjang | `/modul/07/fe/mesin/` |
| 07-K | BEAM2 properti/orientasi penampang; PS2 untuk persegi panjang | `/modul/07/fe/kapal/` |
| 08-M | AX2 termal bebas dan terkekang aksial | `/modul/08/fe/mesin/` |
| 08-K | AX2 termal bebas dan terkekang aksial | `/modul/08/fe/kapal/` |
| 09-M | COMB: BEAM2 +TOR2 pada titik A/B yang sama | `/modul/09/fe/mesin/` |
| 09-K | COMB: BEAM2 +TOR2 pada titik A/B yang sama | `/modul/09/fe/kapal/` |
| 10-M | TOR2 alternatif poros pejal/berongga | `/modul/10/fe/mesin/` |
| 10-K | BEAM2 alternatif orientasi balok; PS2 pengayaan persegi panjang | `/modul/10/fe/kapal/` |

Halaman analitis tetap `/modul/{id}/perhitungan/{mesin|kapal}/`. Jumlah rute hasil build: **54 +404**.

## 6. Hal teknis yang tidak boleh berubah tanpa validasi

### BEAM2 dan PS2

BEAM2 adalah elemen garis dengan pemulihan tegangan dari gaya dalam N/M dan properti A/I. Jangan menyebut kontur rekonstruksinya sebagai tegangan mesh solid. PS2 adalah solid plane stress dengan T6 sisi lurus; node tengah harus berada tepat di tengah sisi. Beban terdistribusi memakai gaya nodal konsisten, termasuk momen untuk BEAM2.

### AX2

AX2 memakai domain meridian r–z dan bobot 2πr, tensor isotropik 3D dan tegangan hoop. Ujung tarik tidak dikunci radial; kontraksi Poisson harus bebas. Pada termal, regangan awal dan reaksi dihitung konsisten; ini bukan solver perpindahan panas.

### TOR2

Satu DOF ψ per node, satuan mm². Semua batas natural; pin/gauge numerik hanya menghilangkan konstanta, kemudian rata-rata area dinolkan. Rongga harus benar-benar berlubang. Jt dari integral medan FE, bukan rumus lingkaran yang disuntikkan sebagai keluaran solver. Lingkaran ideal memiliki ψ konstan; validasi nonlingkaran independen diperlukan dan sudah ada. Mesh lingkaran F4 memakai keliling 128/192/256 dan radial 2/4/8 untuk mengendalikan galat geometri poligon.

### COMB

Global poros z, penampang x/y; A=(0,+d/2,L/2), B=(0,−d/2,L/2). Kopel lokal BEAM2 = −M kasus agar M positif membuat A tarik. Normal dipulihkan dari BEAM2, komponen geser dievaluasi dari TOR2 di titik sama. Komponen geser A/B berlawanan tanda walau magnitudo sama. Von Mises berasal tensor tiap titik; jangan menjumlahkan maksimum dari lokasi berbeda.

### Pelat sambungan

Domain [0,8d] × [−3d,3d], pusat lubang (3d,0), radius d/2, kiri dijepit. Traction tumpu ditetapkan pada setengah kanan lubang. Pin, kontak, clearance dan clevis 3D tidak diselesaikan. τpin tetap analitis. Puncak lokal tidak ditargetkan sama dengan F/(td); path perbandingan tetap ditentukan sebelum solve. Detail normalisasi resultan poligon dan batas ada di F6.

### Status dan domain

`solved_unverified` adalah status internal kontrak solver, bukan sertifikat kelayakan. Bedakan selesai solve, konvergensi, di luar domain dan memenuhi kriteria latihan. Beban nol tidak boleh menghasilkan NaN/Infinity atau faktor keamanan tak hingga. Batas material/regangan/deformasi pedagogis harus tetap diterapkan sebelum interpretasi/ekspor.

## 7. Bukti validasi terakhir

Ini ringkasan run yang sudah dilakukan, bukan klaim pengujian ulang pada setiap pembacaan dokumen.

| Bukti | Hasil |
| --- | --- |
| Seluruh tes | 189/189 kelompok lulus (179 + 5 aksesibilitas + 5 ekspor ringkas) |
| Ekspor JSON ringkas | 20 rute: 6–36 KB (lengkap hingga 17,9 MB); input dan ringkasan identik dengan ekspor lengkap; lihat F8 |
| Audit browser ulang | 20 rute FE: solve, invalidasi, cancel, studi mesh, ekspor JSON/CSV, progres, keyboard, 320 px lulus; axe WCAG 2.1 AA 0 pelanggaran setelah perbaikan; lihat F8 |
| Regresi analitis | 133 keluaran acuan M0 tetap diuji |
| Audit rilis | 20 kasus /29 submodel, solve dan serialisasi JSON/CSV lulus |
| Ukuran aset | 601891 byte, di bawah batas 600 KiB (sisa ±12,5 KiB) |
| Benchmark F4 | 21 perhitungan, seri lingkaran konvergen; nonlingkaran dibanding pembanding independen |
| Benchmark F5 | 6 kombinasi /12 solve kernel; kedua seri konvergen |
| Benchmark F6 | 9 run pelat +2 Kirsch; ketiga seri pelat konvergen |
| Pelat vs SciPy independen, mesh halus | Energi sekitar 0,036%, ux sekitar 0,037%, stress path sekitar 1,113% |
| Kirsch akhir | Galat hoop puncak sekitar 0,895%; L2 stress berbobot luas sekitar 0,268% |

Pembanding pelat F6 memakai mesher lain, interpolasi Kartesian Vandermonde dan sparse direct SciPy, tanpa impor kode produksi. Referensi normalisasi dibekukan pada E=200000 MPa, ν=0,3; ini bukan pembanding universal untuk semua input material. Source, hasil dan hash tersedia di `docs/fe/f6` dan manifest F8. Jangan menyatakan pembanding ini sebagai hasil perangkat lunak komersial.

Browser telah memeriksa transfer kalkulator, konteks/subrun, Ke dan data mentah, pembatalan, invalidasi hasil, domain, studi mesh, unduhan JSON/CSV, progres persisten, ekspor lintas kernel, viewport 320/390 px dan navigasi Tab. Viewport ponsel bukan bukti perangkat fisik.

**Belum tercakup penuh:** perangkat fisik mahasiswa, semua browser/vendor, pembaca layar menyeluruh, hasil printer/PDF fisik, dan tinjauan akhir isi oleh dosen. Tidak ada klaim sertifikasi WCAG atau validasi industri.

## 8. Struktur kode dan berkas penting

| Lokasi | Fungsi |
| --- | --- |
| `web/app.js`, `web/model.js` | Routing, shell, konteks dan integrasi tampilan |
| `web/*-model.js`, `web/*-view.js`, `web/*-lab.js` | Kalkulator/visual/pembelajaran analitis |
| `web/fe/solver.js`, `algebra.js`, `elements.js`, `triangle6.js` | Kernel, assembler, solver dan field PS2/BEAM2 |
| `web/fe/controller.js`, `worker.js` | Worker, runId, snapshot dan cancel |
| `web/fe/bending-*`, `beam-family.js`, `family-*` | Balok dan keluarga kasus penampang/desain |
| `web/fe/axisymmetric-*` | Elemen, kasus, transfer dan UI AX2 |
| `web/fe/torsion-*` | Mesh, solver warping, kasus, transfer dan UI TOR2 |
| `web/fe/combined-*` | Orkestrasi BEAM2/TOR2, tensor dan UI COMB |
| `web/fe/plate-*`, `kirsch.js` | Pelat berlubang dan benchmark Kirsch |
| `web/fe/learning.js` | Prediksi/latihan/refleksi, progres FE dan ekspor |
| `web/progress.js`, `web/glossary.js` | Progres analitis dan glosarium bersama |
| `scripts/build.mjs`, `scripts/serve.mjs` | Build statis dan server pengembangan |
| `scripts/audit-fe-release.mjs` | Audit seluruh kasus dan ekspor |
| `scripts/benchmark-fe-*.mjs` | Benchmark keluarga FE |
| `scripts/package-fe-release.mjs` | Paket statis lokal, bukan deploy Site |
| `tests/*.test.mjs` | Regresi analitis, kernel, kasus, progres/ekspor dan rilis |
| `docs/m0/reference_cases.json` | Register input/output analitis independen |
| `docs/fe/f0/analytic_fixtures.json` | Acuan SI F0; bukan output numerik FE |
| `docs/fe/f8/release_manifest.json` | Audit 20 kasus, ukuran, waktu dan hash referensi |
| `docs/fe/f8/package.json` | Metadata/hash paket yang pernah dibuat; bukan arsip biner |

Arsitektur browser ES modules, tanpa framework/bundler atau dependensi npm runtime eksternal. Build menyalin source web menjadi aset statis dan membuat index.html per rute. `dist/` diabaikan Git dan harus dibangun ulang.

Versi `package.json` masih `1.0.0-rc.2` dari situs analitis. Label rilis FE terpisah `FE-1.0.0-rc.1` ada di `web/fe/learning.js`; jangan menganggap perbedaan label ini sebagai kehilangan implementasi.

## 9. Cara mulai di Claude

```sh
git clone https://github.com/nurman137/IKB.git
cd IKB
git fetch origin
git switch feat/fem-f0
git status
git log -5 --oneline
npm test
node scripts/audit-fe-release.mjs
npm run dev
```

Jika memakai checkout yang sudah ada, jangan clone ulang; periksa branch dan perubahan lokal dahulu. Jangan reset/menimpa pekerjaan baru pengguna. Sinkronkan HEAD terbaru dengan aman sebelum mengedit.

Memerlukan Node.js ≥20. `npm install` tidak diperlukan karena tidak ada dependensi npm eksternal. Server default `npm run dev` adalah http://127.0.0.1:5173/; setelah source diubah, build ulang dan reload. Untuk output subdirektori, gunakan `IKB_BASE=/IKB/ npm run build` sesuai tujuan hosting.

Perintah tambahan sesuai kebutuhan:

```sh
node scripts/benchmark-fe-torsion.mjs
node scripts/benchmark-fe-combined.mjs
node scripts/benchmark-fe-plate.mjs
node scripts/package-fe-release.mjs
```

Python/NumPy/SciPy hanya dibutuhkan untuk meregenerasi pembanding offline, bukan menjalankan situs. Versi referensi F6 tercatat di JSON; NumPy 2.3.5 dan SciPy 1.17.0 pada run yang dibekukan. Regenerasi fixture harus disengaja dan perubahannya ditinjau; jangan memperbarui hasil acuan hanya agar tes menjadi lulus.

Arsip paket lokal sebelumnya tidak disimpan sebagai biner di repo. Regenerasi paket dari source/dist yang benar; metadata lama tidak membuktikan suatu arsip masih tersedia. Audit memiliki waktu kinerja pengukuran sehingga hash paket dapat berubah setelah audit ulang.

## 10. Prioritas tindak lanjut

1. Baca dokumen ini, README dan F8; verifikasi branch/PR terbaru, karena pengguna mungkin sudah melanjutkan di alat lain.
2. Jalankan regresi dan audit pada checkout Claude. Bila ada gagal, periksa input, tanda, kondisi batas dan lokasi sampling sebelum mengubah toleransi.
3. Tinjau materi/preset serta lakukan smoke test perangkat kelas, aksesibilitas dan hasil cetak yang belum tercakup penuh.
4. Bila ada perbaikan, buat perubahan terfokus; pertahankan bukti validasi independen, catat dampak dan jalankan pemeriksaan yang relevan.
5. Setelah keputusan rilis pengguna: tinjau dan merge PR #2, build sumber yang disetujui, lalu terbitkan pembaruan ke Site IKB yang sudah ada dengan audience publik dipertahankan.
6. Simpan titik rollback versi lama dan periksa rute FE/kalkulator pada versi terbit. Jangan melaporkan situs sudah diperbarui hanya karena source telah dipush atau build berhasil.

**Tidak perlu membuat ulang F0–F8 dari awal.** Pekerjaan berikutnya berpusat pada tinjauan akhir dan rilis, kecuali pengguna meminta fitur baru atau menemukan masalah.

## 11. Riwayat commit implementasi FE

| Commit | Tahap |
| --- | --- |
| `abdd616` | Spesifikasi F0 |
| `99a2890` | Fondasi F1 |
| `dcf9afd` | F2a, percontohan modul 06 |
| `8d92d59` | F2b, keluarga balok tambahan |
| `6d0f360` | F3, axisymmetric |
| `754af67` | F4, torsi dan desain poros |
| `25d618d` | F5, beban gabungan |
| `8d15507` | F6/F7/F8, pelat, pembelajaran dan kandidat rilis |

Riwayat lengkap tersedia melalui `git log` pada branch FE. Dokumen ini tidak memuat kredensial, data mahasiswa atau hasil penilaian kelas.
