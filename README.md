# IKB — Laboratorium Kekuatan Bahan

Rencana situs pembelajaran interaktif untuk konteks Teknik Mesin dan Perkapalan, Politeknik Negeri Batam.

**Status per 27 November 2026: M0 selesai disusun. M1–M8 belum dimulai.** Repositori saat ini berisi dokumentasi dan data acuan; belum ada aplikasi atau deployment situs.

## Paket M0

| Dokumen | Isi |
| --- | --- |
| [Spesifikasi pembelajaran](docs/m0/01_spesifikasi_pembelajaran.md) | Dasar RPS, pemetaan lima CPMK, 10 modul, tujuan, asesmen dan batas cakupan |
| [Register kasus](docs/m0/02_register_kasus.md) | 20 kasus: satu Mesin dan satu Kapal pada setiap modul; input, model dan hasil acuan |
| [Halaman perhitungan dan validasi](docs/m0/03_perhitungan_dan_validasi.md) | Input yang dapat diedit, langkah perhitungan, penjelasan, navigasi dan pemeriksaan |
| [Milestone dan serah terima](docs/m0/04_milestone_dan_serah_terima.md) | M0–M8, kriteria selesai, verifikasi M0 dan langkah berikutnya |
| [Data acuan numerik](docs/m0/reference_cases.json) | Preset dan 133 keluaran numerik untuk 20 kasus dasar |

## Prinsip pembelajaran

Prediksi → eksplorasi → baca bukti → contoh hitungan bertahap → latihan → refleksi.

Setiap modul memiliki **Kasus Mesin**, **Kasus Kapal**, dan tautan **Contoh Perhitungan** ke halaman tersendiri. Angka dapat diubah dan seluruh langkah mengikuti input aktif.

Seluruh nilai default merupakan asumsi latihan. Model awal elastis analitis dan tidak menyatakan kelayakan desain industri atau kepatuhan aturan klasifikasi kapal.

## Verifikasi M0

Dua puluh kasus dan 133 keluaran numerik diperiksa melalui hitungan pembanding berbasis SI. Ini pemeriksaan aritmetika dataset, **bukan pengujian aplikasi**. Mode dan pengayaan tambahan memerlukan fixture tersendiri saat implementasi.

## Langkah berikutnya

**M1 — Fondasi situs dan desain:** beranda, navigasi, identitas Polibatam, templat modul serta halaman perhitungan Mesin/Kapal. Lalu **M2 — Tegangan–Regangan lengkap** menjadi acuan untuk modul berikutnya.
