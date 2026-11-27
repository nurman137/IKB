# IKB — Laboratorium Kekuatan Bahan

Ruang belajar Ilmu Kekuatan Bahan, Politeknik Negeri Batam, untuk konteks **Teknik Mesin** dan **Perkapalan**.

**Status 27 November 2026: M0 dan M1 selesai. M2–M8 belum dimulai.** Fondasi situs dapat dijalankan lokal; belum diterbitkan. Publikasi mengikuti tahap kesiapan rilis yang disepakati.

## Tersedia pada M1

- Beranda visual, peta 10 modul, navigasi dan pilihan konteks Mesin–Kapal.
- Templat modul dengan tujuan, konsep awal dan pertanyaan eksplorasi.
- Dua puluh halaman contoh perhitungan dengan input, validasi dasar, desimal koma/titik, reset dan ringkasan data aktif.
- Kerangka solusi yang dapat dibuka/tutup; konteks dan input dipisahkan dalam sesi browser.
- Tampilan responsif, menu ponsel, navigasi keyboard dan status pengembangan yang jelas.

**Belum tersedia:** perhitungan numerik, grafik respons, simulasi interaktif, latihan bernilai, progres belajar, LMS atau akun. Input baru memperbarui data, belum menjalankan analisis.

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
| `web/styles.css` | Identitas visual dan responsif |
| `scripts/build.mjs` | Build 32 halaman dan 404 |
| `scripts/serve.mjs` | Server pengembangan |
| `tests/foundation.test.mjs` | Pemeriksaan fondasi |
| `docs/m0/reference_cases.json` | Data acuan, bukan fungsi hitung aplikasi |

Contoh rute: `/modul/02/`, `/modul/02/perhitungan/mesin/`, dan `/modul/02/perhitungan/kapal/`. Pola tersedia untuk modul 01–10. Konteks modul dapat dipilih lewat `?kasus=mesin` atau `?kasus=kapal`.

## Dokumentasi

| Dokumen | Isi |
| --- | --- |
| [Spesifikasi M0](docs/m0/01_spesifikasi_pembelajaran.md) | RPS, tujuan dan struktur 10 modul |
| [Register 20 kasus](docs/m0/02_register_kasus.md) | Input, model dan hasil acuan Mesin–Kapal |
| [Spesifikasi perhitungan](docs/m0/03_perhitungan_dan_validasi.md) | Solusi bertahap dan validasi |
| [Milestone dasar](docs/m0/04_milestone_dan_serah_terima.md) | Baseline historis M0–M8 |
| [Serah terima M1](docs/m1/serah_terima.md) | Cakupan aktual, pemeriksaan dan tindak lanjut |

Nilai default adalah asumsi latihan. Model ideal tidak menyatakan kelayakan desain industri atau kepatuhan aturan klasifikasi kapal. Identitas institusi memakai teks; tanda kubus adalah identitas laboratorium, bukan logo resmi Polibatam.

## Langkah berikutnya

**M2 — Tegangan–Regangan lengkap:** dua kasus, perhitungan variabel dengan penjelasan langkah, deformasi elastis, grafik, prediksi dan latihan dengan umpan balik. Verifikasi terhadap 02-M dan 02-K sebelum memperluas fungsi.
