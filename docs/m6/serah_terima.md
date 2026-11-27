# M6 — Studio Desain (modul 10)

Tanggal: 27 November 2026 (WIB). Status: **M6 selesai** — modul 10 Studio Desain dengan satu kasus Mesin dan satu Kapal. **Kesepuluh modul kini aktif.** M7 (fitur pembelajaran terpadu) dan M8 (validasi dan persiapan rilis) belum dimulai. Situs belum dipublikasikan.

## Pendekatan

Kedua konteks memakai model yang berbeda, sehingga modul 10 memakai konfigurasi per konteks pada kerangka laboratorium bersama (`web/lab-view.js`). Perhitungan memanggil model modul 05 (`evaluateTorsion`) dan 06 (`evaluateBending`), jadi angka di Studio Desain identik dengan modul asalnya, termasuk batas domain elastis dan kelangsingan.

## Fitur

- **Mesin — poros pejal vs berongga** dengan diameter luar sama: massa m = ρAL, τmax, n = Sᵧ/(√3·τmax), θ; kriteria latihan n ≥ target dan θ ≤ batas. Tombol "dinding lebih tipis (dᵢ = 0,8d)" dan "perketat batas θ".
- **Kapal — orientasi balok geladak** dengan luas sama: σmax, n = Sᵧ/σmax, δ; kriteria latihan n ≥ target dan δ ≤ batas. Tombol "tinggi minimum B agar δ ≤ batas" (h = ∛(12I/b) dengan I = PL³/(48Eδ)) dan "batas δ = L/1000".
- Gambar kedua alternatif berskala sama; grafik **pemakaian kriteria** (n target/n dan θ/batas atau δ/batas, garis 100%); **matriks keputusan** dengan ✓/✗ tertulis, bukan hanya warna.
- **Aturan keputusan latihan yang dinyatakan:** hanya alternatif yang memenuhi semua kriteria yang dipertimbangkan, lalu dipilih yang lebih ringan, dan bila massanya sama, yang margin kekuatannya lebih besar. Mahasiswa diminta boleh berargumen lain dengan alasan.
- **Ringkasan rancangan** (tujuan, kriteria, hasil, keputusan, batas kesimpulan) dan **pendamping SolidWorks**: geometri, material, tumpuan/beban, konvergensi mesh ±2%, lokasi pembacaan yang menghindari singularitas, dan format laporan selisih.
- Prediksi (lulus kekuatan ≠ lulus kekakuan), tujuh langkah penyelesaian termasuk rencana verifikasi, dua latihan dengan pembahasan, dan refleksi keputusan.

## Data acuan

| Kasus | Sumber | Hasil utama |
| --- | --- | --- |
| 10-M A (pejal) | M0 | J = 147.323,515 mm⁴; τ = 17,8179295 MPa; θ = 0,606701626°; m = 6,04206807 kg; n = 8,10069247 |
| 10-M B (dᵢ 20) | M0 | J = 131.615,552 mm⁴; τ = 19,9444516 MPa; θ = 0,679109839°; m = 4,06914788 kg; n = 7,23697849 |
| 10-K A (80×180) | M0 | I = 38.880.000 mm⁴; σ = 21,7013889 MPa; δ = 0,627933706 mm |
| 10-K B (180×80) | M0 | I = 7.680.000 mm⁴; σ = 48,828125 MPa; δ = 3,17891439 mm |
| 10-K n dan massa | Baru | n_A = 11,52; n_B = 5,12; m = 282,6 kg (ρ 7.850 latihan) |
| 10-K tinggi minimum B | Baru | h_min = 86,6701593 mm pada b = 180 mm, δ ≤ 2,5 mm |
| 10-M B dᵢ = 0,8d | Baru | m = 2,17514451 kg; n = 4,78264884; θ = 1,02761116° |
| Latihan Mesin | Baru | T 250 N·m, d 40, dᵢ_B 28, L 1 m → m_B = 5,03094648 kg; θ_B = 0,97501139° |
| Latihan Kapal | Baru | P 12 kN, L 3 m, 70×200 vs 200×70, batas 3 mm → δ_B = 5,90379009 mm; n_A = 12,962963 |

Nilai baru dihitung terpisah dengan Python dalam satuan SI.

**Interpretasi M0 terpenuhi:** 10-M, kedua alternatif memenuhi n ≥ 2 dan θ ≤ 2°, dan rekomendasi latihan jatuh pada B karena lebih ringan 32,65%. 10-K, A memenuhi keduanya, sedangkan B memenuhi kekuatan (n = 5,12) tetapi tidak memenuhi lendutan (3,179 > 2,5 mm). Kedua pemeriksaan ditampilkan terpisah.

## Pemeriksaan yang dilakukan

- **61 kelompok tes otomatis lulus** (55 sebelumnya + 6 baru di `tests/design.test.mjs`). Kedua kasus 10 cocok pada 24 keluaran M0.
- Tes menemukan satu bug sebelum rilis: skala grafik pemakaian kriteria menghasilkan NaN karena faktor 1,1 dikalikan ke array, bukan ke tiap nilai. Sudah diperbaiki.
- Aturan keputusan: hanya satu yang lulus, keduanya lulus dengan massa berbeda, massa sama (margin), dan tidak ada yang lulus. Torsi nol memberi n tak terdefinisi tanpa memblokir keputusan. Domain L/h dan luluh memberi δ/θ "tidak dihitung" dan kriteria kekakuan tidak dianggap lulus.
- Browser (Chromium/Playwright): kedua konteks, pergantian konteks, keempat tombol eksperimen, input invalid, reset, prediksi, latihan, pembahasan, pendamping SolidWorks, halaman perhitungan langsung dan reload. Modul 01–09 diperiksa ulang tetap tampil. Tidak ada error konsol; 390/320 px tanpa scroll horizontal.

## Batas model

Kriteria n ≥ 2, θ ≤ 2° dan δ ≤ L/1000 adalah kriteria latihan, bukan standar atau aturan klasifikasi. Rekomendasi mengikuti aturan keputusan latihan, bukan pernyataan aman. Belum memeriksa alur pasak, lentur poros, fatigue, getaran torsional, putaran kritis, tekuk dinding tipis (Mesin), tegangan geser, tekuk lateral-torsional, pelat geladak yang ikut bekerja, sambungan dan beban gelombang (Kapal).

## Langkah berikutnya

**M7 — Fitur pembelajaran terpadu:** progres per perangkat (prediksi/latihan yang sudah dikerjakan), mode presentasi, glosarium istilah, cetak ringkasan perhitungan aktif, dan perbandingan yang relevan. Fitur harus benar-benar menyimpan dan menampilkan hasil aktif, tanpa mengklaim rekap nilai kelas.
