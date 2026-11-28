# F0 — Matriks 20 kasus

Semua status FE: **planned**. Angka awal M0 dipertahankan; nilai tambahan di bawah adalah asumsi latihan F0. Ini bukan hasil solver.

| Kasus | Nama | Tahap / kernel | Tambahan input | Batas khusus |
| --- | --- | --- | --- | --- |
| 01-M | Penyangga alat produksi | F2 / BEAM2 | b_mm=60; h_mm=120; E_MPa=200000; nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 01-K | Balok geladak penyangga peralatan | F2 / BEAM2 | b_mm=100; h_mm=200; E_MPa=200000; nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 02-M | Batang pengikat mesin | F3 / AX2 | nu=0.3; Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 02-K | Tie rod struktur kapal | F3 / AX2 | nu=0.3; Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 03-M | Batang penarik mekanisme | F3 / AX2 | Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 03-K | Batang penggantung platform | F3 / AX2 | Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 04-M | Pin mekanisme pengangkat | F6 / PS2 | plate_length_mm=96; plate_width_mm=72; hole_center_x_mm=36; hole_center_y_mm=0; hole_d_mm=12; E_MPa=200000; nu=0.3; Sy_MPa=250 | Hanya pelat; pin/dua bidang geser tetap hitungan nominal terpisah; tanpa kontak |
| 04-K | Pin clevis padeye ideal | F6 / PS2 | plate_length_mm=160; plate_width_mm=120; hole_center_x_mm=60; hole_center_y_mm=0; hole_d_mm=20; E_MPa=200000; nu=0.3; Sy_MPa=250 | Hanya pelat; pin/dua bidang geser tetap hitungan nominal terpisah; tanpa kontak |
| 05-M | Poros transmisi | F4 / TOR2 | Sy_MPa=250 | Prismatik Saint-Venant; tidak memodelkan ujung/keyway/fatigue |
| 05-K | Segmen poros propeler | F4 / TOR2 | Sy_MPa=250 | Prismatik Saint-Venant; tidak memodelkan ujung/keyway/fatigue |
| 06-M | Balok penyangga mesin | F2 / BEAM2 | nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 06-K | Balok geladak | F2 / BEAM2 | nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 07-M | Orientasi profil rangka | F2 / BEAM2 | nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 07-K | Orientasi penegar geladak | F2 / BEAM2 | nu=0.3; Sy_MPa=250 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |
| 08-M | Pipa instalasi mesin | F3 / AX2 | nu=0.3; Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 08-K | Pipa kamar mesin kapal | F3 / AX2 | nu=0.3; Sy_MPa=250 | Bobot 2πr; bukan plane stress; tanpa tekanan internal |
| 09-M | Poros lentur–torsi | F5 / COMB | L_mm=1000; E_MPa=200000; nu=0.3 | Superposisi/pemulihan tegangan; bukan solid 3D; tegangan nominal jauh dari ujung |
| 09-K | Poros dorong–torsi | F5 / COMB | L_mm=2000; E_MPa=200000; nu=0.3 | Superposisi/pemulihan tegangan; bukan solid 3D; tegangan nominal jauh dari ujung |
| 10-M | Poros pejal–berongga | F4 / TOR2 | Tidak ada angka utama baru; kontrak geometri/BC/mesh tetap ditambahkan. | Prismatik Saint-Venant; tidak memodelkan ujung/keyway/fatigue |
| 10-K | Orientasi balok geladak | F2 / BEAM2 | nu=0.3; rho_kg_m3=7850 | PS2 hanya persegi panjang; resultan strip dan ROI harus dicatat |

Detail kondisi batas, beban, field pembanding dan rute terdapat pada `case_matrix.json`.

## Aturan penambahan data

- 01: b/h hanya memungkinkan pembanding deformasi baru; reaksi M0 tidak bergantung pada asumsi kekakuan ini. δ_at_load berbeda dari δ maksimum untuk beban eksentris.
- 04: diameter lubang sama dengan pin untuk geometri submodel tanpa kontak. Pada 04-K jalankan pelat tengah F penuh dan pelat luar masing-masing F/2, dengan tebal masing-masing. Tegangan bearing nominal dan puncak FE adalah besaran berbeda.
- 09: panjang tambahan menentukan deformasi submodel, bukan mengubah tegangan nominal M0 pada F/M/T tetap.
- 07 dan 10 mempunyai subrun A/B; 08 bebas/terkekang; 04-K tengah/luar. Subrun bukan kasus kurikulum baru.
- 07 profil I/T/pipa menggunakan elemen balok dengan properti penampang; mesh PS2 persegi panjang tidak dipakai diam-diam untuk seluruh profil.
- 10-K massa memakai ρ tambahan sebagai asumsi latihan dan tidak menambahkannya ke target numerik M0 yang tidak memuat massa.
