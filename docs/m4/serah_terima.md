# M4 — Torsi, Lentur dan Penampang

Tanggal: 27 November 2026 (WIB). Status: **M4 selesai** — modul 05 Torsi & Poros, 06 Lentur Balok dan 07 Bentuk Penampang, masing-masing dengan satu kasus Mesin dan satu Kapal. Modul 07 dibangun di atas kerangka laboratorium bersama yang juga dipakai M5; rinciannya ada di [serah terima M5](../m5/serah_terima.md). Situs belum dipublikasikan. Situs belum dipublikasikan.

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

- **36 kelompok tes otomatis lulus saat modul 05 selesai** (26 sebelumnya + 10 baru untuk modul 05). Tes membutuhkan `npm run build` lebih dahulu karena sebagian tes fondasi membaca `dist/`.
- Kedua kasus M0 cocok pada 8 keluaran acuan dengan toleransi abs 1e-9 + rel 1e-6. Fixture daya, berongga dan latihan juga cocok.
- Aturan verifikasi M0 diperiksa: L×2 → θ×2 dengan τ tetap; poros pejal d×2 → τ/8 dan θ/16; T×2 → keduanya ×2; T = 0 → τ = θ = 0; daya sama pada setengah putaran → T×2.
- Eksklusivitas mode diperiksa: input mode yang tidak aktif boleh tidak valid tanpa memengaruhi hasil. n = 0 ditolak; P = 0 sah.
- Domain diperiksa: √3·τmax ≥ Sᵧ atau γ > 1% menyembunyikan θ/γ. dᵢ ≥ d, d/L/E = 0, ν di luar [0; 0,5), torsi negatif dan angka ekstrem membersihkan hasil.
- Browser (Chromium/Playwright): kedua halaman perhitungan dibuka langsung, pergantian konteks, mode daya, n = 0, tombol berongga/gandakan L, lepas/pulihkan beban, konversi satuan, reload dengan input tersimpan, reset, prediksi, latihan dan pembahasan. Tidak ada error konsol. Lebar 390 dan 320 px tanpa scroll horizontal. Ini bukan uji perangkat fisik atau audit aksesibilitas menyeluruh.

## Konvensi dan batas model

Poros bulat pejal atau cincin konsentris, seragam sepanjang L, torsi statis murni, elastis linier isotropik, G = E/[2(1+ν)]. T dan P dimasukkan sebagai besaran tanpa tanda; arah putar tidak dibedakan. Pemeriksaan √3·τmax terhadap Sᵧ hanya menandai batas domain elastis, bukan faktor keamanan. Tidak menghitung alur pasak, bahu poros, flens, lentur, gaya dorong propeler, fatigue, tekuk dinding tipis, getaran torsional atau putaran kritis. Bukan pemeriksaan aturan klasifikasi poros propeler.

## Rujukan konsep

- [David Roylance, Shear and Torsion, MIT OCW 3.11](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf): torsi poros melingkar, J, τ = Tr/J dan θ = TL/(GJ). Gambar dan uraian UI dibuat sendiri.

## Modul 06 — Lentur Balok

### Fitur

- Dua konfigurasi beban yang saling eksklusif dengan rumus, diagram dan latihan terpisah: **beban titik di tengah** (R = P/2, Mmax = PL/4, δ = PL³/(48EI)) dan **beban merata penuh** (R = wL/2, Mmax = wL²/8, δ = 5wL⁴/(384EI)).
- Balok sendi–rol dengan kurva lendutan dari rumus aktif (perbesaran 1/100/500/1000×, dibatasi ruang gambar), reaksi, dan beban titik atau merata.
- Penampang persegi panjang berproporsi b:h dengan distribusi σ(y): tekan di serat atas, tarik di serat bawah, nol di sumbu netral.
- Diagram V dan M: loncatan V dan M segitiga untuk beban titik; V linier dan M parabola untuk beban merata.
- Hasil: R, Mmax, I, Z, σ serat bawah/atas, δmax, L/δ (informasi, bukan kriteria) dan L/h.
- Tabel "coba ubah satu parameter": h×2, b×2, L×2 (P atau w tetap), dan putar penampang b↔h dengan luas sama. Penampang yang diputar menjadi jembatan ke modul 07.
- Prediksi (h digandakan), tujuh langkah, dua latihan (Mesin: beban titik; Kapal: beban merata), pembahasan dan refleksi.

### Data acuan

| Kasus | Sumber | Hasil utama |
| --- | --- | --- |
| 06-M | M0 | R = 4.000 N; Mmax = 3.000.000 N·mm; I = 8.640.000 mm⁴; σmax = 20,8333333 MPa; δmax = 0,325520833 mm |
| 06-K | M0 | R = 10.000 N; Mmax = 15.000.000 N·mm; I = 66.666.666,7 mm⁴; σmax = 22,5 MPa; δmax = 0,84375 mm |
| 10-K A/B | M0 | Dipakai ulang untuk menguji model titik pada kedua orientasi; semua 12 keluaran cocok |
| Beban merata Mesin | Baru, latihan | w = 5 kN/m pada geometri 06-M → R = 3.750 N; Mmax = 1.406.250 N·mm; σmax = 9,765625 MPa; δmax = 0,190734863 mm |
| Beban merata Kapal | Baru, latihan | w = 6 kN/m pada geometri 06-K → R = 9.000 N; Mmax = 6.750.000 N·mm; σmax = 10,125 MPa; δmax = 0,474609375 mm |
| Kurva lendutan | Baru | 06-M, x = L/4: titik 0,223795573 mm; merata 5 kN/m 0,13589859 mm |
| Putar 06-M (b = 120, h = 60) | Baru | σmax = 41,6666667 MPa; δmax = 1,30208333 mm |
| Latihan Mesin | Baru | P = 12 kN, L = 2 m, b = 80 mm, h = 160 mm → σmax = 17,578125 MPa; δmax = 0,366210938 mm |
| Latihan Kapal | Baru | w = 8 kN/m, L = 4 m, b = 120 mm, h = 240 mm → σmax = 13,8888889 MPa; δmax = 0,964506173 mm |

Nilai baru dihitung terpisah dengan Python dalam satuan SI.

### Pemeriksaan

- **11 kelompok tes baru lulus; total 47.** Kedua kasus 06 cocok pada 12 keluaran M0, dan 10-K A/B pada 12 keluaran.
- Aturan verifikasi: h×2 → σ/4 dan δ/8; b×2 → σ/2 dan δ/2; E tidak mengubah σ; beban merata dengan L×2 → σ×4 dan δ×16. Pada beban total sama, beban merata memberi M/2 dan 5/8 δ.
- Relasi balok: lendutan nol di tumpuan dan maksimum di tengah, simetri v(x), dM/dx = V, loncatan V sebesar P di tengah, M ujung nol.
- Domain: σ ≥ Sᵧ atau L/h < 10 menyembunyikan δ, dengan σ tetap ditampilkan dan alasan tertulis. L/h = 10 tepat masih valid. Beban nol memberi δ = 0 dan L/δ tidak terdefinisi. Geometri nol/negatif, beban negatif dan angka ekstrem membersihkan hasil.
- Browser: kedua halaman perhitungan, ganti konfigurasi, gandakan h, putar penampang, input invalid, reset, lepas/pulihkan beban, satuan m, reload, prediksi, latihan dan pembahasan. Tidak ada error konsol; lebar 390/320 px tanpa scroll horizontal. Modul 05 diperiksa ulang tanpa regresi.

### Catatan pedagogis

Pada kedua kasus default, h×2 membuat L/h turun menjadi 6,25 (Mesin) dan 7,5 (Kapal), sehingga δ pada baris itu disembunyikan dengan alasan tertulis, sesuai aturan kelangsingan M0. Prediksi tetap menjelaskan hubungan δ/8 dengan catatan L/h ≥ 10.

### Batas model

Balok prismatik persegi panjang, sendi–rol, elastis linier, Euler–Bernoulli, beban simetris ke bawah, berat sendiri tidak dihitung. Tidak menghitung tegangan geser balok, tekuk lateral-torsional, tekuk lokal, konsentrasi tegangan di tumpuan/beban, fatigue, getaran atau sambungan. L/δ bukan kriteria aturan klasifikasi.

Rujukan konsep: [MIT OCW 2.001 Mechanics & Materials I](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/), materi lentur balok. Gambar dan uraian UI dibuat sendiri.

## Modul 07 — Bentuk Penampang

Ringkasan; data dan pemeriksaan lengkap ada di [serah terima M5](../m5/serah_terima.md).

- Empat bentuk: persegi panjang, profil I simetris, profil T (flens di atas) dan pipa. Kolom ukuran yang tidak dipakai disembunyikan.
- Setiap bentuk dibandingkan pada luas yang sama: A (seperti digambar), B (diputar 90°) dan bujur sangkar berluas sama sebagai acuan netral.
- Profil T memakai centroid dan teorema sumbu sejajar secara eksplisit, dengan Z atas dan bawah yang berbeda. Profil L tidak disediakan karena lentur tak simetris tidak dapat dimodelkan dengan satu I horizontal.
- Kedua kasus M0 cocok pada 24 keluaran (orientasi A dan B).

## Langkah berikutnya

M4 selesai. Lanjutan berada di M5 (modul 08–09, sudah selesai) dan M6 (modul 10 Studio Desain).
