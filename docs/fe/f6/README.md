# F6 — Pelat berlubang pada sambungan 04-M/K

Implementasi selesai sebagai kandidat rilis FE, 27 November 2026; belum merge/publikasi. Seluruh 20 kasus kini memiliki halaman FE. Model ini **pelat plane stress dengan traction ditetapkan**, bukan kontak pin/clevis 3D. τpin dan σbearing nominal tetap analitis.

## Geometri dan kondisi batas

Domain [0,8d] × [−3d,3d], lubang berpusat (3d,0), r=d/2. Kiri ux=uy=0. Tepi lain bebas kecuali setengah kanan lubang: traction p0 cosφ(cosφ,sinφ), p0=2Fplate/(πrt). Gaya nodal konsisten memakai interpolasi edge T6 dan Gauss 3 titik. Koreksi resultan poligon dicatat pada `tractionCorrection` sehingga Fx=Fplate; Fy dan momen tetap nol hingga toleransi numerik.

Kasus Mesin menjalankan satu pelat F/t_center. Clevis Kapal menjalankan pelat tengah F/t_center dan satu pelat luar (F/2)/t_outer; pelat luar satunya identik dalam idealisasi. E=200 GPa, ν=0,3, Sy=250 MPa adalah asumsi tambahan F0. Bukan data sertifikat material.

Mesh T6 sisi lurus, node tengah pada tali busur. Radial logaritmik dan ray tambahan melalui sudut kanan memastikan geometri persegi panjang aktual. Kasar/sedang/halus: 64/96/128 segmen dasar +2 ray sudut dan 4/6/8 lapisan. Mesh halus 4420 node /8840 DOF total, di bawah cap 10000. Lubang tidak diisi elemen.

## Pemulihan dan domain

Medan tanpa smoothing. Path ditetapkan sebelum solve: koordinat dalam satuan d (1,0), (1.5,0), (2,1), (3,1), (4,0). Titik pada edge bersama dirata-ratakan antar elemen yang mengandung titik tersebut; nilai mentah titik Gauss tetap dapat diperiksa.

UI menampilkan kontur von Mises, mesh/deformasi dengan faktor perbesaran, nominal analitis terpisah, path σxx/σyy/τxy/ux/uy, Ke 12×12 elemen terpilih, beban/reaksi/energi dan tujuh langkah. Puncak Gauss bergantung mesh dan singularitas sudut jepit; tidak dipakai sebagai kapasitas atau disamakan dengan F/(td).

Domain: σvm<Sy, |regangan utama|≤1% termasuk εzz plane stress, dan |u|max/(8d)≤2%. Di luar domain, kontur/deformasi dan ekspor sebagai hasil elastis disembunyikan. Keputusan ini pedagogis. Tidak ada plastisitas, contact, clearance, eksentrisitas, fatigue, SWL atau aturan klasifikasi kapal.

## Pembanding independen yang dibekukan

[reference_scipy.py](reference_scipy.py) v1 membangun mesh sendiri (192 ray dasar +2 sudut, 14 lapisan, diagonal sel bergantian), menggunakan interpolasi polinomial Kartesian Vandermonde dan SciPy sparse direct `spsolve`, tanpa mengimpor kode produksi. [reference_scipy.json](reference_scipy.json) membekukan hasil: 11252 node, 5432 T6; NumPy 2.3.5 /SciPy 1.17.0. Hash SHA256 source dan hasil dicatat pada [manifest F8](../f8/release_manifest.json).

Normalisasi d=F=t=1, E=200000 MPa, ν=0,3. Energi berskala F²/t, perpindahan F/t, tegangan F/(td) pada material referensi tersebut. Tidak menyatakan benchmark lokal identik untuk semua ν/material yang dapat diubah pengguna.

Mesh halus produksi dibanding pembanding: galat energi sekitar 0,03613%, ux path pertama 0,03731%, tegangan path maksimum sekitar 1,1127% relatif skala maksimum tensor path referensi. Memenuhi target 2%/2%/5%. Reaksi, energi vs setengah kerja, nol beban, skala F dan penolakan domain diuji.

Benchmark Kirsch terpisah: annulus a≤r≤10a, traction luar dari solusi tepat Kirsch, tepi lubang bebas; hanya tiga DOF untuk mode benda tegar. Mesh 64×18 (4736 node /9472 DOF). σθθ(a,π/2)≈2,97314σ∞, galat 0,8954% (<3%). L2 tegangan berbobot luas pada ROI 1,2a≤r≤4a diperiksa <3%; komponen radial/geser di titik batas lubang diperiksa mendekati nol (masing-masing <0,03σ∞). Kondisi natural dipenuhi lemah; komponen stress boundary tidak persis nol pada mesh diskret. Perubahan displacement probe medium–fine <1%. Ini bukan klaim Kt=3 untuk pelat sambungan finite.

Reproduksi:

```sh
python docs/fe/f6/reference_scipy.py
node scripts/benchmark-fe-plate.mjs
node --test tests/fe-plate.test.mjs
```

[benchmark.json](benchmark.json) merekam 9 run pelat dan 2 run Kirsch. Ketiga seri pelat memenuhi perubahan medium–fine: energi/displacement ≤1%, path stress ≤3%. Sumber teori: [Applied Mechanics, Stress concentration](https://mechanics.ju.se/SolidMechanics/StressConcentration.html) dan kontrak F0. Benchmark numerik independen dipisahkan dari target nominal M0.
