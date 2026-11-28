# F8 — Kandidat rilis FE-1.0.0-rc.1

Audit teknis selesai 27 November 2026. Cakupan 20/20 kasus. **Belum merge ke main dan belum memperbarui situs publik.** Kandidat ini siap ditinjau dosen sebelum keputusan publikasi.

## Bukti otomatis

- `npm test`: 179/179 kelompok lulus. Mencakup 133 keluaran analitis M0, kernel/patch/solver independen, reaksi/residual/energi, domain, cancel/stale, transfer dan seluruh keluarga FE.
- Setelah penyempurnaan metrik Kirsch menjadi L2 berbobot luas dan pemeriksaan radial/geser batas, tes pelat dijalankan kembali dan lulus; jumlah kelompok keseluruhan tetap 179.
- `node scripts/audit-fe-release.mjs`: seluruh 20 kasus dengan 29 submodel preset diselesaikan dan diuji melalui serialisasi JSON/CSV yang sama dengan UI. Setiap summary dalam domain, rute tersedia dan ekspor tidak memuat NaN/Infinity.
- Build 54 rute +404; aset masih di bawah 600 KiB tanpa dependensi runtime eksternal. Angka, waktu, jenis kernel, jumlah node/elemen dan SHA256 pembanding independen tersimpan di [release_manifest.json](release_manifest.json).
- F6: 9 run pelat +2 Kirsch, benchmark independen geometri/solver terpisah dan konvergensi setiap subrun. F4/F5 dan keluarga lama tetap dicakup regresi.

Manifest tidak mengubah status solver menjadi sertifikat model fisik. Waktu audit adalah pengukuran lingkungan pengembangan, bukan jaminan laptop/ponsel mahasiswa.

## Browser yang diperiksa

| Area | Pemeriksaan |
| --- | --- |
| Navigasi lama dan baru | Home → modul04 → kalkulator → FE; snapshot input terbawa |
| PS2 pelat | Mesin satu pelat; Kapal tengah/luar; medan/path, Ke terpilih, domain luluh, studi tiga mesh |
| F7 | Prediksi/latihan/refleksi, progres setelah navigasi, ekspor aktual JSON/CSV, input berubah mengunci ekspor |
| Lintas kernel | Solve dan aktivasi ekspor BEAM2, AX2, TOR2, COMB, PS2 |
| Ponsel | Viewport 320/390 px, solve kedua konteks; halaman tidak overflow horizontal |
| Keyboard | Tab menuju pilihan latihan; kontrol native memiliki label dan dapat dioperasikan |

Keterbatasan tinjauan: belum menguji perangkat fisik mahasiswa, pembaca layar lengkap, semua browser/vendor, atau keluaran printer/PDF fisik. Tidak mengklaim sertifikasi WCAG. Perhitungan tetap model ideal pedagogis tanpa contact/plasticity/buckling/fatigue/solid3D atau pemeriksaan aturan kelas.

## Paket statis

`node scripts/package-fe-release.mjs` menyiapkan arsip statis yang berisi dist, README dan manifest audit. [package.json](package.json) menyimpan nama, ukuran dan SHA256 paket yang dibuat. Arsip ini belum merupakan penerbitan Site; publikasi Sleekdune tetap memakai workflow Site dari sumber yang disetujui. Ulangi build/audit/paket bila sumber berubah. Timestamp kinerja dalam manifest mengikuti pengukuran audit masing-masing run.

## Isi dan peta rilis

| Kasus | Model utama |
| --- | --- |
| 01-M/K,06-M/K,07-M/K,10-K | BEAM2, dengan PS2 pengayaan yang sudah tersedia |
| 02-M/K,03-M/K,08-M/K | AX2 |
| 04-M/K | PS2 pelat traction, pin analitis |
| 05-M/K,10-M | TOR2 |
| 09-M/K | Superposisi BEAM2 +TOR2 |

## Langkah publikasi berikutnya

1. Tinjau preset dan batas interpretasi bersama dosen, serta smoke test perangkat kelas.
2. Tinjau PR pengembangan; setelah keputusan rilis, gabungkan sumber yang disetujui.
3. Build ulang dengan `npm run build`, jalankan audit/regrasi jika ada perubahan; gunakan output dist dari sumber yang sama.
4. Terbitkan ke Site IKB yang sudah ada dengan audience publiknya dipertahankan. Ini langkah terpisah, belum dikerjakan oleh F8.
5. Simpan versi sebelumnya sebagai titik rollback. Setelah terbit, periksa rute FE dan contoh perhitungan pada versi terbit.

Dokumen F0–F7 tetap menyimpan riwayat keputusan, termasuk status planned pada F0 dan keterbatasan masing-masing model; tidak ditulis ulang seolah solver sudah ada saat F0.

## Perbaikan pasca-audit browser (28 November 2026)

Uji browser ulang pada 20 rute FE menemukan dua hal yang kini diperbaiki:

1. **Wilayah gulir tabel tidak dapat dijangkau keyboard** (axe `scrollable-region-focusable`, serius, di semua rute FE pada desktop; contoh tabel "Kasus aktif" 1323 px di wadah 646 px). `web/scroll-regions.js` dipasang sekali dari `web/app.js` dan memantau setiap `.table-scroll`: hanya yang benar-benar meluap diberi `tabindex="0"`, `role="region"` dan label dari judul terdekat. Pemantauan diperbarui setelah render, saat `<details>` dibuka dan saat ukuran layar berubah. Atribut yang dipasang penulis tidak ditimpa, dan tabel yang tidak meluap tidak menambah langkah Tab. Gaya fokus terlihat ditambahkan.
2. **Input pelat 04 tidak ditautkan ke pesan error**, dan isian bukan angka dilaporkan sebagai "di luar rentang". Kini setiap input pelat memiliki `aria-describedby`, elemen error dan `aria-invalid`, yang diperbarui di setiap jalur render. Isian bukan angka melaporkan "Masukkan angka yang sah"; pesan rentang dan dimensi tetap.

Bukti: 184/184 kelompok tes lulus (+5 di `tests/fe-a11y-fixes.test.mjs`). axe-core WCAG 2.1 A/AA pada 52 tampilan (20 rute FE × 2 lebar layar setelah solve, ditambah sampel halaman analitis): 0 pelanggaran. Tabel dapat difokus dengan Tab dan digeser dengan tombol panah. Rumus, solver, preset dan hasil numerik tidak berubah.

## Ekspor JSON ringkas (28 November 2026)

Ekspor JSON lengkap pada kasus dengan medan mentah terlalu besar untuk ponsel (modul 08 ±17,9 MB, 04-Kapal ±3,7 MB). Kini tersedia tombol **Ekspor JSON ringkas** (`IKB-FE-{id}-{konteks}-ringkas.json`) di samping **Ekspor JSON lengkap** yang tidak berubah.

- `makeCompactExport` memanggil `makeExport` lebih dahulu, sehingga validasi domain, status `solved_unverified` dan penolakan angka tidak finite sama persis.
- `input` dan `summaries` disalin utuh tanpa pembulatan. Di `models`/`results`, array lebih dari 24 nilai (node, elemen, perpindahan, tegangan per titik integrasi) dan teks lebih dari 512 karakter (mis. `inputSnapshot` serialisasi model dari Worker) diganti penanda `{_omitted, length}`, dan setiap penggantian dicatat di `omittedArrays`. Skalar seperti reaksi, energi dan diagnostik tetap ikut.
- Tombol ringkas aktif dan terkunci bersama ekspor lain; tidak memakai hasil lama setelah input berubah atau dibatalkan.

Ukuran unduhan nyata di browser (20 rute): ringkas **6–36 KB**, misalnya 08-M 17,9 MB → 13,4 KB, 04-K 3,7 MB → 11,2 KB, 10-M 2,3 MB → 12,4 KB. Kasus balok tanpa medan panjang (06) hampir tidak berubah. `scripts/audit-fe-release.mjs` kini juga memeriksa bahwa ekspor ringkas setiap kasus memiliki `input` dan `summaries` identik dengan ekspor lengkap dan tanpa NaN/Infinity, dan mencatat `compactJsonBytes` di manifest.

Bukti: 189/189 kelompok tes lulus (+5 di `tests/fe-compact-export.test.mjs`, termasuk bentuk hasil Worker dengan `inputSnapshot`); audit 20 kasus/29 submodel lulus; browser 20/20 rute; axe WCAG 2.1 A/AA 52 tampilan 0 pelanggaran. Ukuran aset 601.891 byte, masih di bawah batas 600 KiB dengan sisa ±12,5 KiB.

## Pemeliharaan rilis (28 November 2026)

- **CI GitHub Actions** (`.github/workflows/ci.yml`): pada setiap pull request dan push ke `main`, Node 20 dan 22 menjalankan `npm test`, audit rilis FE dan generator lembar tinjauan, lalu memeriksa bahwa `docs/fe/f8/release_manifest.json` dan `docs/tinjauan_dosen.md` yang di-commit sudah mutakhir.
- **Manifest audit dapat direproduksi:** waktu per kasus tidak lagi disimpan di manifest, melainkan di `.cache/fe-audit-timing.json` yang diabaikan Git. Ukuran ekspor dihitung dengan `diagnostics.elapsedMs` dinolkan, karena nilai itu berubah setiap run. Dua run berturut-turut serta Node 20 vs 22 menghasilkan manifest identik.
- **Kode FE dimuat per rute:** `web/app.js` memuat tampilan FE dan modul pembelajaran FE dengan `import()` hanya di rute `/fe/`. Halaman analitis mengirim data ke FE melalui `web/fe-link.js`: modul transfer diunduh saat tautan didekati atau difokus, ditunggu saat diklik, lalu halaman berpindah. Input tidak valid tetap menahan perpindahan dengan pesan yang sama, dan Ctrl/Cmd+klik tetap membuka tab baru. Unduhan halaman analitis turun dari 570 KiB menjadi 357 KiB; halaman FE hanya memuat keluarga kernelnya. Batas total aset 600 KiB tetap diukur seperti sebelumnya.
- **Lembar tinjauan dosen** (`docs/tinjauan_dosen.md`) dihasilkan oleh `node scripts/review-sheet.mjs` dari definisi di kode: kriteria latihan, preset di luar M0 (analitis dan tambahan F0 untuk FE), 20 soal latihan dengan kunci jawaban, serta pertanyaan prediksi analitis dan FE, masing-masing dengan kolom keputusan.

Bukti: 194/194 kelompok tes lulus di Node 20 dan 22 (+5 di `tests/release-hygiene.test.mjs`); audit 20 kasus lulus; 10/10 tautan kalkulator→FE memindahkan nilai yang diubah; 20 rute FE solve tanpa error dan axe WCAG 2.1 A/AA 0 pelanggaran.
