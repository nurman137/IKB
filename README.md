# IKB — Laboratorium Kekuatan Bahan

Ruang belajar Ilmu Kekuatan Bahan, Politeknik Negeri Batam, untuk konteks **Teknik Mesin** dan **Perkapalan**.

**Status 27 November 2026: M0–M6 selesai — kesepuluh modul aktif. M7–M8 belum dimulai.** Fondasi situs dapat dijalankan lokal; belum diterbitkan. Publikasi mengikuti tahap kesiapan rilis yang disepakati.

## Modul yang sudah aktif

- Beranda visual, peta 10 modul, navigasi dan pilihan konteks Mesin–Kapal.
- Templat modul dengan tujuan, konsep awal dan pertanyaan eksplorasi.
- Dua puluh halaman contoh perhitungan dengan input, validasi dasar, desimal koma/titik, reset dan ringkasan data aktif.
- Kerangka solusi yang dapat dibuka/tutup; konteks dan input dipisahkan dalam sesi browser.
- Tampilan responsif, menu ponsel, navigasi keyboard dan status pengembangan yang jelas.

Kesepuluh modul sudah aktif untuk Mesin dan Kapal, masing-masing dengan halaman perhitungan tersendiri, input variabel, konversi satuan, langkah beserta penjelasan, prediksi, latihan, umpan balik dan pembahasan:

| Modul | Fitur inti |
| --- | --- |
| 01 — Membaca Beban | Lima jenis pembebanan, diagram benda bebas, reaksi, potongan, gaya geser dan momen |
| 02 — Tegangan–Regangan | Tegangan, regangan, pertambahan panjang dan grafik elastis |
| 03 — Elastisitas/Hukum Hooke | Kekakuan, Poisson, kontraksi lateral, modulus geser, energi dan pembanding E |
| 04 — Geser dan Sambungan | Satu/dua bidang geser pin, tumpu pelat tengah dan luar, pembagian gaya |
| 05 — Torsi dan Poros | Torsi langsung atau daya–putaran, poros pejal/berongga, J, τ(r), sudut puntir dan perbandingan parameter |
| 06 — Lentur Balok | Beban titik di tengah atau merata penuh, diagram V/M, σ(y) penampang, kurva lendutan, batas L/h dan putar penampang |
| 07 — Bentuk Penampang | Persegi panjang, profil I, profil T dan pipa; orientasi A/B dan bujur sangkar berluas sama; centroid, I, Z atas/bawah |
| 08 — Pengaruh Temperatur | Pipa bebas vs terkekang penuh, tanda tegangan, gaya tumpuan, grafik σ–ΔT dan pembanding material |
| 09 — Beban Gabungan & Keamanan | Gaya aksial, lentur dan torsi pada titik A/B yang sama, von Mises, titik kritis, faktor keamanan luluh terhadap target latihan |
| 10 — Studio Desain | Poros pejal vs berongga (Mesin) dan orientasi balok (Kapal); massa, kekuatan dan kekakuan terpisah, matriks keputusan, ringkasan rancangan dan pendamping SolidWorks |

Data contoh dipisahkan dari soal latihan. Hasil dan visual mengikuti satu model hitung per kasus.

Progres belajar, penilaian kelas, LMS dan akun belum tersedia. Situs belum dipublikasikan.

## Menjalankan

Memerlukan Node.js ≥20. Tanpa dependensi npm eksternal; tidak perlu `npm install`.

```sh
npm run build
npm test
npm run dev
```

Server default: `http://127.0.0.1:5173/`. Host/port opsional: `npm run dev -- --host 127.0.0.1 --port 4173`.

Output `dist/` dapat disajikan pada hosting statis. Tiap rute memiliki `index.html` sendiri untuk kunjungan langsung/reload tanpa aturan SPA fallback. Setelah mengubah source, build kembali dan muat ulang browser.

## Struktur

| Lokasi | Fungsi |
| --- | --- |
| `web/index.html` | Templat dokumen |
| `web/app.js` | Halaman, konteks, form dan keadaan sesi |
| `web/model.js` | Isi modul, rute, parser angka dan validasi |
| `web/figures.js` | Ikon dan ilustrasi SVG konseptual |
| `web/axial-model.js` | Model hitung aksial, satuan, batas model dan penilaian latihan |
| `web/axial-view.js` | Laboratorium dan halaman perhitungan modul 02 |
| `web/axial-visuals.js`, `web/axial.css` | Diagram, grafik dan tampilan modul aktif |
| `web/styles.css` | Identitas visual dan responsif |
| `web/foundation-model.js`, `web/foundation-content.js` | Model dan isi pembelajaran 01/03/04 |
| `web/foundation-view.js`, `web/foundation-visuals.js`, `web/foundation.css` | Antarmuka dan diagram M3 |
| `web/torsion-model.js`, `web/torsion-content.js` | Model hitung dan isi modul 05 |
| `web/torsion-view.js`, `web/torsion-visuals.js` | Antarmuka, diagram poros dan distribusi τ modul 05 |
| `web/bending-model.js`, `web/bending-content.js` | Model hitung dan isi modul 06 |
| `web/bending-view.js`, `web/bending-visuals.js` | Antarmuka, balok, lendutan, σ(y) dan diagram V/M modul 06 |
| `web/lab-core.js`, `web/lab-view.js` | Kerangka laboratorium bersama (validasi, satuan, penilaian, halaman) untuk modul 07–09 |
| `web/section-*.js`, `web/thermal-*.js`, `web/combined-*.js`, `web/design-*.js` | Model, visual dan konfigurasi modul 07, 08, 09, 10 |
| `web/m4.css` | Gaya bersama modul 05–09 |
| `scripts/build.mjs` | Build 32 halaman dan 404 |
| `scripts/serve.mjs` | Server pengembangan |
| `tests/foundation.test.mjs`, `tests/axial.test.mjs`, `tests/foundation-models.test.mjs`, `tests/torsion.test.mjs`, `tests/bending.test.mjs`, `tests/m5-modules.test.mjs`, `tests/design.test.mjs` | Pemeriksaan fondasi, aksial, model M3, torsi, lentur, penampang, temperatur, beban gabungan dan studio desain |
| `docs/m0/reference_cases.json` | Data acuan, bukan fungsi hitung aplikasi |

Contoh rute: `/modul/02/`, `/modul/02/perhitungan/mesin/`, dan `/modul/02/perhitungan/kapal/`. Pola tersedia untuk modul 01–10. Konteks modul dapat dipilih lewat `?kasus=mesin` atau `?kasus=kapal`.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [Spesifikasi M0](docs/m0/01_spesifikasi_pembelajaran.md) | RPS, tujuan dan struktur 10 modul |
| [Register 20 kasus](docs/m0/02_register_kasus.md) | Input, model dan hasil acuan Mesin–Kapal |
| [Spesifikasi perhitungan](docs/m0/03_perhitungan_dan_validasi.md) | Solusi bertahap dan validasi |
| [Milestone dasar](docs/m0/04_milestone_dan_serah_terima.md) | Baseline historis M0–M8 |
| [Serah terima M1](docs/m1/serah_terima.md) | Cakupan fondasi dan pemeriksaan historis |
| [Serah terima M2](docs/m2/serah_terima.md) | Fitur modul 02 dan hasil uji historis |
| [Serah terima M3](docs/m3/serah_terima.md) | Tiga modul baru, enam kasus dan hasil pemeriksaan |
| [Serah terima M4](docs/m4/serah_terima.md) | Modul 05–07, fixture daya–rpm, berongga dan beban merata |
| [Serah terima M5](docs/m5/serah_terima.md) | Modul 07–09, kerangka laboratorium bersama, fixture profil/termal/gabungan |
| [Serah terima M6](docs/m6/serah_terima.md) | Modul 10 Studio Desain, aturan keputusan, pendamping SolidWorks dan hasil pemeriksaan terbaru |

Nilai default adalah asumsi latihan. Model ideal tidak menyatakan kelayakan desain industri atau kepatuhan aturan klasifikasi kapal. Identitas institusi memakai teks; tanda kubus adalah identitas laboratorium, bukan logo resmi Polibatam.

## Langkah berikutnya

**M7 — Fitur pembelajaran terpadu:** progres per perangkat, mode presentasi, glosarium, cetak ringkasan perhitungan aktif dan perbandingan yang relevan, tanpa mengklaim rekap nilai kelas. Setelah itu **M8 — validasi dan persiapan rilis**.

> Catatan: `npm test` membaca sebagian berkas dari `dist/`, jadi jalankan `npm run build` lebih dahulu.
