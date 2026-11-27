# IKB — Laboratorium Kekuatan Bahan

Ruang belajar Ilmu Kekuatan Bahan, Politeknik Negeri Batam, untuk konteks **Teknik Mesin** dan **Perkapalan**.

**Status 27 November 2026: M0–M3 selesai. M4–M8 belum dimulai.** Fondasi situs dapat dijalankan lokal; belum diterbitkan. Publikasi mengikuti tahap kesiapan rilis yang disepakati.

## Modul yang sudah aktif

- Beranda visual, peta 10 modul, navigasi dan pilihan konteks Mesin–Kapal.
- Templat modul dengan tujuan, konsep awal dan pertanyaan eksplorasi.
- Dua puluh halaman contoh perhitungan dengan input, validasi dasar, desimal koma/titik, reset dan ringkasan data aktif.
- Kerangka solusi yang dapat dibuka/tutup; konteks dan input dipisahkan dalam sesi browser.
- Tampilan responsif, menu ponsel, navigasi keyboard dan status pengembangan yang jelas.

Empat modul sudah aktif untuk Mesin dan Kapal, masing-masing dengan halaman perhitungan tersendiri, input variabel, konversi satuan, langkah beserta penjelasan, prediksi, latihan, umpan balik dan pembahasan:

| Modul | Fitur inti |
| --- | --- |
| 01 — Membaca Beban | Lima jenis pembebanan, diagram benda bebas, reaksi, potongan, gaya geser dan momen |
| 02 — Tegangan–Regangan | Tegangan, regangan, pertambahan panjang dan grafik elastis |
| 03 — Elastisitas/Hukum Hooke | Kekakuan, Poisson, kontraksi lateral, modulus geser, energi dan pembanding E |
| 04 — Geser dan Sambungan | Satu/dua bidang geser pin, tumpu pelat tengah dan luar, pembagian gaya |

Data contoh dipisahkan dari soal latihan. Hasil dan visual mengikuti satu model hitung per kasus.

Modul 05–10 masih berupa kerangka M1. Progres belajar, penilaian kelas, LMS dan akun belum tersedia. Situs belum dipublikasikan.

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
| `scripts/build.mjs` | Build 32 halaman dan 404 |
| `scripts/serve.mjs` | Server pengembangan |
| `tests/foundation.test.mjs`, `tests/axial.test.mjs`, `tests/foundation-models.test.mjs` | Pemeriksaan fondasi, aksial dan model M3 |
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
| [Serah terima M3](docs/m3/serah_terima.md) | Tiga modul baru, enam kasus dan hasil pemeriksaan terbaru |

Nilai default adalah asumsi latihan. Model ideal tidak menyatakan kelayakan desain industri atau kepatuhan aturan klasifikasi kapal. Identitas institusi memakai teks; tanda kubus adalah identitas laboratorium, bukan logo resmi Polibatam.

## Langkah berikutnya

**M4 — Torsi, Lentur dan Penampang:** lengkapi modul 05–07: poros pejal/berongga, hubungan daya–rpm, balok dengan beban titik/merata, serta properti dan orientasi penampang. Pertahankan pola dua konteks dan validasi terpisah untuk setiap konfigurasi.
