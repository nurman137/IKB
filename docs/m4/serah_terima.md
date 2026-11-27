# M4 — Torsi, Lentur dan Penampang (sebagian: modul 05)

Tanggal: 27 November 2026 (WIB). Status: **modul 05 Torsi & Poros selesai** dengan satu kasus Mesin dan satu Kapal. Modul 06 Lentur Balok dan 07 Bentuk Penampang belum dimulai, sehingga M4 secara keseluruhan **belum selesai**. Modul 01–05 aktif; 06–10 masih kerangka. Situs belum dipublikasikan.

## Fitur modul 05

- Dua sumber torsi yang saling eksklusif: **torsi langsung** atau **daya dan putaran** (ω = 2πn/60, T = P/ω). Kolom sumber yang tidak aktif disembunyikan dan tidak divalidasi, jadi hanya ada satu nilai T.
- Poros pejal dan berongga (0 ≤ dᵢ < d); tombol cepat pejal, berongga dᵢ = 0,6d, dan gandakan L.
- Hasil: T, ω (khusus mode daya), G, J, Zp, τmax, τ pada dinding dalam, θ (rad, °, °/m) dan γmax.
- Diagram poros dengan ujung tetap: garis acuan permukaan dan penampang ujung terpuntir. Perbesaran 1/10/20/40×, dibatasi 75°. Geometrinya konsisten (γL = cθ).
- Grafik distribusi τ(r) yang linier, dengan rongga ditandai dan garis Sᵧ/√3 sebagai batas domain.
- Tabel "coba ubah satu parameter" (L×2, T×2, d dan dᵢ×2) pada T aktif yang tetap, beserta rasionya.
- Prediksi konsep (L digandakan), tujuh langkah penyelesaian, dua latihan mandiri dengan pembahasan, dan refleksi. Halaman Contoh Perhitungan Mesin/Kapal bisa dibuka langsung dan dimuat ulang.
- Konversi satuan: N·m/N·mm/kN·m, kW/W, mm/m, GPa/MPa.

## Data acuan

| Kasus | Sumber | Hasil utama |
| --- | --- | --- |
| 05-M | M0 | J = 79.521,564 mm⁴; τmax = 37,7256161 MPa; θ = 0,0196173204 rad = 1,12398966° |
| 05-K | M0 | J = 1.272.345,02 mm⁴; τmax = 35,3677651 MPa; θ = 0,0306520631 rad = 1,75623385° |
| Preset daya Mesin | Baru, latihan | 30 kW, 1450 rpm → ω = 151,843645 rad/s; T = 197.571,653 N·mm; τmax = 37,2675618 MPa; θ = 1,11034248° |
| Preset daya Kapal | Baru, latihan | 90 kW, 600 rpm → ω = 62,8318531 rad/s; T = 1.432.394,49 N·mm; τmax = 33,7737279 MPa; θ = 0,0292705642 rad |
| Fixture berongga | Baru | 05-M dengan dᵢ = 18 mm → J = 69.215,5693 mm⁴; τmax = 43,3428494 MPa; τ(rᵢ) = 26,0057097 MPa; θ = 1,29134842° |
| Latihan Mesin | Baru | 7,5 kW, 1450 rpm, d = 25 mm, L = 500 mm → τmax = 16,0995867 MPa; θ = 0,479667952° |
| Latihan Kapal | Baru | T = 2,5 kN·m, d = 80 mm, dᵢ = 50 mm, L = 3 m → τmax = 29,3457688 MPa; θ = 1,63935398° |

Nilai baru dihitung terpisah dengan Python dalam satuan SI, tidak memakai fungsi situs. Semua preset adalah asumsi latihan, bukan data motor atau kapal tertentu.

## Pemeriksaan yang dilakukan

- **36 kelompok tes otomatis lulus** (26 sebelumnya + 10 baru untuk modul 05). Tes membutuhkan `npm run build` lebih dahulu karena sebagian tes fondasi membaca `dist/`.
- Kedua kasus M0 cocok pada 8 keluaran acuan dengan toleransi abs 1e-9 + rel 1e-6. Fixture daya, berongga dan latihan juga cocok.
- Aturan verifikasi M0 diperiksa: L×2 → θ×2 dengan τ tetap; poros pejal d×2 → τ/8 dan θ/16; T×2 → keduanya ×2; T = 0 → τ = θ = 0; daya sama pada setengah putaran → T×2.
- Eksklusivitas mode diperiksa: input mode yang tidak aktif boleh tidak valid tanpa memengaruhi hasil. n = 0 ditolak; P = 0 sah.
- Domain diperiksa: √3·τmax ≥ Sᵧ atau γ > 1% menyembunyikan θ/γ. dᵢ ≥ d, d/L/E = 0, ν di luar [0; 0,5), torsi negatif dan angka ekstrem membersihkan hasil.
- Browser (Chromium/Playwright): kedua halaman perhitungan dibuka langsung, pergantian konteks, mode daya, n = 0, tombol berongga/gandakan L, lepas/pulihkan beban, konversi satuan, reload dengan input tersimpan, reset, prediksi, latihan dan pembahasan. Tidak ada error konsol. Lebar 390 dan 320 px tanpa scroll horizontal. Ini bukan uji perangkat fisik atau audit aksesibilitas menyeluruh.

## Konvensi dan batas model

Poros bulat pejal atau cincin konsentris, seragam sepanjang L, torsi statis murni, elastis linier isotropik, G = E/[2(1+ν)]. T dan P dimasukkan sebagai besaran tanpa tanda; arah putar tidak dibedakan. Pemeriksaan √3·τmax terhadap Sᵧ hanya menandai batas domain elastis, bukan faktor keamanan. Tidak menghitung alur pasak, bahu poros, flens, lentur, gaya dorong propeler, fatigue, tekuk dinding tipis, getaran torsional atau putaran kritis. Bukan pemeriksaan aturan klasifikasi poros propeler.

## Rujukan konsep

- [David Roylance, Shear and Torsion, MIT OCW 3.11](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf): torsi poros melingkar, J, τ = Tr/J dan θ = TL/(GJ). Gambar dan uraian UI dibuat sendiri.

## Langkah berikutnya

Lanjutkan M4 dengan **modul 06 Lentur Balok**: beban titik di tengah dan beban merata penuh sebagai konfigurasi terpisah, diagram V/M, tegangan lentur, lendutan dan batas kelangsingan L/h ≥ 10. Siapkan fixture baru untuk beban merata sebelum modul dinyatakan selesai.
