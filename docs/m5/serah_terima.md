# M5 — Temperatur dan Kombinasi (serta modul 07 penutup M4)

Tanggal: 27 November 2026 (WIB). Status: **M5 selesai** — modul 08 Pengaruh Temperatur dan 09 Beban Gabungan & Keamanan. Dokumen ini juga mencatat modul 07 Bentuk Penampang yang menutup M4, karena ketiganya dibangun dengan kerangka yang sama. Modul 01–09 aktif; modul 10 Studio Desain masih kerangka. Situs belum dipublikasikan.

## Kerangka laboratorium bersama

Modul 07–09 memakai `web/lab-view.js` (tata letak, keadaan sesi, satuan, reset, prediksi, latihan, pembahasan dan refleksi) dan `web/lab-core.js` (validasi, konversi satuan, penilaian). Setiap modul hanya menyediakan model (`*-model.js`), visual (`*-visuals.js`) dan konfigurasi isi/langkah (`*-lab.js`). Pola halaman sama dengan modul 05–06: dua konteks, halaman Contoh Perhitungan tersendiri, tujuh langkah penyelesaian, tabel "coba ubah", dua latihan per konteks dengan toleransi 1%. Modul 05–06 belum dipindahkan ke kerangka ini.

## Modul 07 — Bentuk Penampang

- Bentuk: persegi panjang, profil I simetris, profil T (flens di atas), pipa. Mode eksklusif; ukuran yang tidak dipakai disembunyikan dan tidak divalidasi.
- Perbandingan adil pada luas sama: A (seperti digambar), B (diputar 90°), dan bujur sangkar berluas sama. Gambar dua penampang berskala sama dengan sumbu netral, distribusi σ(y), dan batang I serta δ.
- Profil T: centroid ȳ = ΣAy/ΣA, I = Σ[I sendiri + A(y − ȳ)²], dan Z atas ≠ Z bawah. Profil L sengaja tidak disediakan karena sumbu utamanya miring.
- Batas: δ disembunyikan bila L/tinggi < 10 atau σ ≥ Sᵧ, per orientasi, dengan alasan tertulis.
- Latihan: Mesin (I persegi panjang dan rasio δ_B/δ_A), Kapal (ȳ dan σ bawah profil T).

## Modul 08 — Pengaruh Temperatur

- Dua kondisi ekstrem sebagai mode: bebas memuai dan terkekang penuh. Hasil keduanya selalu dihitung; mode menentukan gambar dan hasil aktif.
- δ bebas = αΔT·L dengan σ = 0; terkekang δ = 0, σ = −EαΔT, |R| = |σ|A, dan arah gaya tumpuan (mendorong saat dipanaskan, menarik saat didinginkan).
- Gambar pipa dengan warna hangat/dingin, grafik σ terkekang terhadap ΔT dengan garis ±Sᵧ, tombol bebas/terkekang/balik tanda ΔT.
- Tabel: ΔT×2, tanda berbalik, L×2 (σ tetap), dinding 2× lebih tebal (σ tetap, R naik), aluminium latihan.
- Batas: σ dan R disembunyikan bila |σ| ≥ Sᵧ; tumpuan parsial tidak diinterpolasi; tekuk belum dievaluasi.
- Latihan: Mesin (δ bebas dan σ terkekang saat dipanaskan), Kapal (σ tarik saat didinginkan dan |R|). Tanda tegangan ikut dinilai.

## Modul 09 — Beban Gabungan & Keamanan

- Input F (bertanda), M, T, d, Sᵧ dan target n. Titik A (atas) dan B (bawah) pada penampang yang sama.
- σ_A = F/A + Mc/I, σ_B = F/A − Mc/I, τ = Tc/J, σ_vm = √(σ² + 3τ²) di tiap titik, titik kritis, n = Sᵧ/σ_vm,max, dan tegangan utama sebagai pengayaan.
- Status terpisah: memenuhi atau belum memenuhi kriteria latihan, melampaui Sᵧ (di luar domain elastis), atau n tidak terdefinisi pada tegangan nol. Peringatan tekuk muncul bila F < 0. Tidak ada label aman.
- Gambar poros dengan beban dan elemen tegangan A/B, serta batang σ_vm terhadap Sᵧ dan Sᵧ/n.
- Tabel: T = 0, M = 0, F = 0, d × 1,2.
- Latihan: Mesin (lentur + torsi), Kapal (dorong tekan + lentur + torsi, titik B kritis).

## Data acuan

| Kasus | Sumber | Hasil utama |
| --- | --- | --- |
| 07-M | M0 | A = 4.000 mm²; I_A = 3.333.333,33; I_B = 533.333,333 mm⁴; σ 7,5/18,75 MPa; δ 0,0625/0,390625 mm |
| 07-K | M0 | A = 9.600 mm²; I_A = 20.480.000; I_B = 2.880.000 mm⁴; σ 9,765625/26,0416667 MPa; δ 0,203450521/1,44675926 mm |
| Profil I Mesin (b_f 50, t_f 6, h 100, t_w 5) | Baru | A = 1.040 mm²; I kuat = 1.611.146,67; I lemah = 125.916,667 mm⁴; δ kuat = 0,129307491 mm; σ lemah = 99,2720053 MPa |
| Profil T (b_f 100, t_f 10, h 150, t_w 8; P 5 kN, L 2 m) | Baru | A = 2.120 mm²; ȳ = 105,377358 mm; I = 4.809.364,78 mm⁴; Z atas/bawah = 107.778,576/45.639,4509 mm³; σ −23,1957044/+54,7771708 MPa; δ = 0,866365281 mm; δ lemah = 4,96441507 mm |
| Pipa 114/100 (P 5 kN, L 2 m) | Baru | I = 3.381.925,28 mm⁴; σ = 42,1357624 MPa |
| 08-M | M0 | A = 452,389342 mm²; δ bebas = 0,96 mm; σ = −96 MPa; \|R\| = 43.429,3768 N |
| 08-K | M0 | A = 1.319,46891 mm²; δ bebas = 1,8 mm; σ = −120 MPa; \|R\| = 158.336,27 N |
| 08-M aluminium latihan | Baru | δ bebas = 1,84 mm; σ = −64,4 MPa; \|R\| = 29.133,8736 N |
| 09-M | M0 | σ_A/σ_B = ±47,7464829 MPa; τ = 15,9154943 MPa; σ_vm = 55,1328895 MPa; n = 4,53449841; tegangan utama A (baru) = 52,5653069/−4,81882394 MPa |
| 09-K | M0 | σ_A = σ_B = −12,9922403 MPa; τ = 29,6965491 MPa; σ_vm = 53,0514222 MPa; n = 4,71240901 |
| Latihan 07 | Baru | Mesin: I_A = 1.280.000 mm⁴; δ_B/δ_A = 7,11111111. Kapal: ȳ = 86,9148936 mm; σ bawah = 101,033557 MPa |
| Latihan 08 | Baru | Mesin: δ bebas = 1,8 mm; σ = −144 MPa. Kapal: σ = +72 MPa; \|R\| = 112,644946 kN |
| Latihan 09 | Baru | Mesin: σ_vm = 58,0823857 MPa; n = 4,30423091. Kapal: σ_vm,A/B = 53,0475029/55,3835763 MPa; n = 4,51397358 |

Nilai baru dihitung terpisah dengan Python dalam satuan SI, tidak memakai fungsi situs. Ukuran profil I/T/pipa dan material aluminium adalah preset latihan, bukan profil standar atau spesifikasi material.

## Pemeriksaan yang dilakukan

- **55 kelompok tes otomatis lulus** (47 sebelumnya + 8 baru di `tests/m5-modules.test.mjs`). Keenam kasus M0 cocok pada 50 keluaran numerik (24 + 10 + 16).
- Tes modul 07 menemukan bug sebelum rilis: langkah penyelesaian profil T kehilangan data luas/letak flens–badan. Bug sudah diperbaiki dan dicakup tes.
- 07: luas sama pada A/B/bujur sangkar; δ_B/δ_A = (h/b)²; centroid T di atas tengah tinggi; σ bawah T lebih besar; I profil I tanpa rongga sama dengan persegi panjang; geometri invalid (2t_f ≥ h, t_w > b_f, dᵢ ≥ d) ditolak; batas L/tinggi per orientasi.
- 08: σ bebas = 0, δ terkekang = 0, tanda berbalik bersama ΔT, ΔT = 0 tanpa reaksi, L×2 tidak mengubah σ, dinding tebal menaikkan R, batas Sᵧ hanya pada mode terkekang.
- 09: T = 0 → σ_vm = |σ|; M = F = 0 → √3·τ; titik kritis B pada kasus dorong + lentur; n tidak terdefinisi pada tegangan nol; n tepat sama dengan target memenuhi; target n ≤ 1 ditolak; d × 1,2 menurunkan σ_vm lentur dengan 1,2³.
- Browser (Chromium/Playwright): keenam halaman perhitungan dibuka langsung; ganti bentuk/mode, tombol eksperimen, input invalid, reset, lepas/pulihkan ΔT, ganti satuan, reload, prediksi, latihan dan pembahasan. Tidak ada error konsol. Lebar 390/320 px tanpa scroll horizontal. Modul 05–06 diperiksa ulang tanpa regresi. Bukan uji perangkat fisik atau audit aksesibilitas menyeluruh.

## Rujukan konsep

[MIT OCW 2.001 Mechanics & Materials I](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/): momen inersia dan lentur, regangan termal pada struktur terkekang, tegangan gabungan dan kriteria luluh. Halaman kursus dirujuk secara umum; bab spesifik perlu dilengkapi saat M8. Gambar dan uraian UI dibuat sendiri.

## Langkah berikutnya

**M6 — Studio Desain (modul 10):** poros pejal–berongga (Mesin) dan orientasi balok geladak (Kapal), dua alternatif per konteks dengan pemeriksaan kekuatan dan deformasi terpisah, massa, serta ringkasan rancangan dan pendamping SolidWorks. Model 05, 06, 07 dan 09 dapat dipakai ulang.
