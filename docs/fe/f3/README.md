# F3 — Axisymmetric AX2 untuk tarik dan termal

Implementasi pengembangan **02-M/K, 03-M/K dan 08-M/K**. Bersama F2, total **13 dari 20 kasus** memiliki jalur FE. Branch `feat/fem-f0`; belum merge ke main atau diterbitkan ke situs publik.

## Rute dan pengalaman belajar

| Modul | Rute | Pembelajaran |
| --- | --- | --- |
| 02 | `/modul/02/fe/mesin/`, `/modul/02/fe/kapal/` | Tarik batang pejal: tegangan, regangan, perubahan panjang dan kontraksi radial |
| 03 | `/modul/03/fe/mesin/`, `/modul/03/fe/kapal/` | Poisson, perubahan diameter dan kekakuan F/ΔL dari FE |
| 08 | `/modul/08/fe/mesin/`, `/modul/08/fe/kapal/` | Pipa bebas/terkekang, pemanasan/pendinginan, reaksi muka dan energi elastis |

Tombol dari laboratorium dan perhitungan mengirim snapshot input kanonis ber-versi, terpisah modul dan konteks. Akses langsung memakai M0 dan tambahan F0 (ν=0,3, Sy=250 MPa bila belum tersedia). Input FE tidak menimpa input analitis. Modul 08 selalu menghitung dua subrun, terlepas kondisi gambar yang sebelumnya dipilih pada halaman analitis.

Halaman menyediakan geometri r–z, deformasi dari DOF FE dengan faktor perbesaran, kontur σzz/σθθ tanpa smoothing, tabel analitis–FE, tujuh langkah penyelesaian, pemilihan elemen untuk Ke 12×12 dan seluruh 36 titik integrasi mentah, serta studi tiga mesh per kondisi. Dinding pipa terlihat sebagai domain annular tanpa elemen di rongga. Plot memakai skala r/z berbeda dan menyatakannya; warna autoscale per subrun dan mesh, dengan rentang minimum ±10⁻⁶ MPa agar noise mendekati nol tidak tampak sebagai tegangan besar. Nilai tabel tidak dipotong menjadi nol.

## Formulasi dan integrasi solver

- Koordinat node **[r,z]**, DOF **[ur,uz]**, urutan strain **[εrr, εzz, εθθ, γrz]**. εθθ=ur/r, γrz=∂ur/∂z+∂uz/∂r. Bukan plane stress: D isotropik 3D mencakup tiga tegangan normal serta geser rz. Von Mises dan regangan utama memakai tensor tersebut.
- T6 sisi lurus, node tengah konform. Ke=∫ BᵀDB (2πr)dA dan fth=∫ BᵀD[β,β,β,0] (2πr)dA; β=αΔT. Kuadratur Gauss–Duffy **6×6** memiliki bobot positif dan seluruh titik di r>0. Ur/r membuat integrand umum tidak polinomial, sehingga tidak memakai kuadratur tiga titik PS2.
- Di seluruh node r=0 wajib ur=0. Evaluasi di sumbu memakai limit ur/r=∂ur/∂r pada medan regular. Radius negatif, node tengah salah, mesh terputus, elemen terbalik/degenerat dan tidak adanya penahan translasi aksial ditolak.
- AX2 hanya memiliki mode translasi aksial sebagai rigid mode dalam ruang simetri ini; translasi radial/rotasi bidang bukan mode rigid AX2. Pemeriksaan tiga rigid mode PS2 tidak diterapkan padanya.
- Node diurutkan menurut z lalu r agar sistem tereduksi berpita sempit. Solver SPD banded Cholesky memakai batas bandwidth 96, tiga iterative refinements, dan perkalian terkompensasi untuk reaksi. Fallback PCG tetap tersedia bila struktur pita tidak sesuai; tidak menambah pegas stabilisasi. Jalur BEAM2/PS2 sebelumnya tetap diuji.
- Reaksi dihitung dari K asli: r=Ku−fmek−fth. Beban yang dipakai solver, beban ekuivalen termal dan reaksi tetap tersedia terpisah. Residual tereduksi ≤1e−8 dan simetri ≤1e−12 diperiksa.
- Keseimbangan fisik global diperiksa pada sumbu z: ΣFz mekanis+reaksi. Skala toleransi mencakup gaya nodal ekuivalen termal, sesuai besar suku yang saling menghapus. **Jumlah gaya radial meridian tidak dipaksa nol**: kontribusi hoop adalah bagian persamaan radial, bukan gaya Cartesian luar yang bisa dijumlahkan begitu saja.

## Kondisi batas, traksi dan titik pembanding

Tarik: uz=0 pada muka z=0; muka z=L menerima traksi F/[π(ro²−ri²)]. Integrasi sisi konsisten memakai 2πr, sehingga resultan tepat **F untuk seluruh lingkaran**, bukan F per radian. Semua muka ujung bebas radial, kecuali regularitas sumbu. Gaya awal nonnegatif seperti modul 02/03.

Termal bebas: uz=0 di muka kiri, kanan bebas. Termal terkekang: uz=0 di kedua muka; keduanya tetap bebas radial. ΔT seragam diberikan sebagai input, tanpa solve perpindahan panas atau tekanan internal.

| Kondisi | Solusi homogen pembanding |
| --- | --- |
| Tarik | σzz=F/A, εzz=σzz/E, ur=−νσzz r/E |
| Termal bebas | uz=βz, ur=βr; semua tegangan nol |
| Termal terkekang | σzz=−Eβ, uz=0, ur=(1+ν)βr; σrr=σθθ=τrz=0 |

ΔL adalah selisih perpindahan rata-rata dua muka dengan bobot 2πr. ROI tegangan/strain di r tengah ketebalan, z=L/2; ur luar di ro,L/2. Jika titik dimiliki beberapa elemen, evaluasi B u pada titik tersebut dirata-ratakan dan berbeda dari tabel integrasi mentah. Reaksi muka dijumlahkan sebagai resultan; reaksi kedua muka tidak dijumlahkan magnitudonya menjadi 2R. Tanda reaksi adalah gaya tumpuan pada benda, arah z positif ke kanan.

Modul 03 menampilkan Δd=2ur luar, strain radial, serta k=F/ΔL hanya bila ΔL tidak nol. G=E/[2(1+ν)] tetap sifat material, bukan keluaran independen solver tarik; perubahan E dapat diuji melalui input.

## Energi termal yang dibedakan

Energi elastis tersimpan **Uel=∫½(ε−εth)ᵀD(ε−εth)dV**. Keluaran ini dibandingkan dengan σzz² V/(2E). Pada pemuaian bebas Uel≈0.

Diagnostik **½uᵀKu** dan **½uᵀ(fmek+fth+r)** menguji identitas sistem algebra. Untuk kasus termal keduanya tidak disamakan dengan energi elastis atau kerja beban mekanis saja. UI menampilkan keduanya dengan label berbeda. Contoh bebas dengan u bukan nol dapat memiliki ½uᵀKu besar dan Uel hampir nol; ini bukan kegagalan konservasi energi.

## Penyesuaian terhadap rencana F0

1. Mesh memakai **1/2/3 sel radial** untuk kasar/sedang/halus (T6 kuadratik), menggantikan target 2/4/8. Pipa panjang tipis pada M0 akan melampaui cap bila target itu dipaksakan dengan rasio sisi≤5. Pembagian aksial dipilih agar rasio sisi sel sebenarnya, dalam kedua arah, ≤5. Mesh terhalus preset paling besar 8.407 DOF bebas; cap 10.000 tidak dinaikkan. Mesh di luar cap atau rasio sisi ditolak, tidak diam-diam diganti BEAM2 atau diberi label sudah konvergen.
2. Kasus homogen affine dapat tepat sejak mesh kasar. Studi menguji perubahan hasil; tidak mengarang galat yang menurun. Keberhasilan ini tidak membuktikan akurasi untuk beban/geometri sembarang.
3. Pada termal bebas, pengurangan Ku dan fth yang besar menyisakan roundoff reaksi beberapa mikro-newton. Benchmark saat ini mencatat maksimum sekitar **2,41×10⁻⁵ N**, dan tegangan mendekati nol maksimum sekitar **1,19×10⁻⁸ MPa**. Fixture homogen F3 memakai batas absolut nol **1e−4 N** dan **1e−7 MPa**; gerbang residual 1e−8 dan keseimbangan berskala tetap. Ini penyesuaian presisi absolut terhadap target awal F0, dicatat terbuka; nilai tidak dibulatkan menjadi nol agar tes lulus.
4. Konvergensi σzz yang mendekati nol memakai batas absolut 1e−7 MPa, energi nol 1e−6 N·mm dan perpindahan nol 1e−8 mm; selain itu ambang sedang–halus 1% perpindahan/energi dan 3% tegangan. Pembandingan relatif tidak dipakai untuk acuan nol.

## Validasi

**140 kelompok tes lulus**: 124 sebelumnya + 16 F3. Build 47 rute + 404, enam berkas AX2 dapat dibuka/reload langsung serta di subdirektori. Aset runtime tetap <600 KiB tanpa kompresi; tidak ada dependensi runtime tambahan.

- Oracle NumPy independen: interpolasi polinomial Kartesius, integrasi 8×8, D3D dan solve Dirichlet. Dua geometri (menyentuh sumbu dan annular), beban tidak seragam, gaya radial tambahan, regangan termal serta prescribed uz tidak nol. Perpindahan, reaksi, tegangan pusat dan energi dibandingkan. Toleransi displacement 1e−5 relatif +1e−10 mm, reaksi/stress 5e−4 relatif +1e−5 N/MPa, energi 2e−6 relatif. Perbedaan kuadratur pada kasus nonhomogen dicatat; ini bukan solver plane stress yang digunakan kembali.
- Patch ur=a r, uz=b z pada mesh solid/annular **dengan node interior digeser dan midpoint diperbarui**. Tegangan dibandingkan D3D independen; abs untuk shear nol 1e−8 MPa. Limit sumbu, tidak adanya titik Gauss r=0, volume penuh dan resultan traksi diuji.
- Seluruh enam baseline, tiga mesh, plus kedua kondisi termal: tegangan, regangan, ΔL, ur, reaksi, energi dan volume memenuhi toleransi homogen 0,5% dengan batas nol di atas. Target M0 SI tersimpan digunakan terpisah untuk 02/03/08, termasuk Δd dan k pada 03.
- ν=0, E=70 GPa, F=0, ΔT=0/positif/negatif, α×2, L×2, perubahan ketebalan, domain luluh/strain, geometri/radius/material/BC invalid, cap, snapshot rusak/lintas konteks/versi dan rute yang belum tersedia diuji.
- Regresi BEAM2, PS2, controller cancel/stale, seluruh modul analitis dan 133 target M0 tetap lulus.

[benchmark.json](benchmark.json) memuat **24 run dan delapan pemeriksaan konvergensi**, semuanya memenuhi ambang. Nilai mesh halus:

| Kasus / kondisi | DOF bebas | ΔL (mm) | ur luar (mm) | σzz ROI (MPa) |
| --- | ---: | ---: | ---: | ---: |
| 02-M / free | 786 | 0.159155 | -0.00095493 | 63.662 |
| 02-K / free | 1566 | 0.397887 | -0.00119366 | 66.3146 |
| 03-M / free | 786 | 0.079577 | -0.00047746 | 31.831 |
| 03-K / free | 1254 | 0.152789 | -0.00057296 | 30.5577 |
| 08-M / free | 8407 | 0.960000 | 0.00960000 | -7.84178e-09 |
| 08-M / fixed | 8400 | 0.000000 | 0.01248000 | -96 |
| 08-K / free | 8407 | 1.800000 | 0.02280000 | 1.18977e-08 |
| 08-K / fixed | 8400 | 0.000000 | 0.02964000 | -120 |

Waktu per run yang direkam terlama sekitar 2,2 detik pada executor pengembangan. Ini bukan jaminan kinerja peramban/perangkat mahasiswa. Browser QA memeriksa transfer 02 (15 kN), transfer ν=0,25 dari 03, pendinginan dari 08, kedua kondisi, kontur hoop/aksial, perbedaan energi, tiga mesh, cancel, invalidasi saat unit berubah, domain per kondisi, pemilih elemen/raw/Ke, serta 320/390 px tanpa overflow halaman saat tabel dan matriks dibuka. Belum merupakan uji perangkat fisik atau pembaca layar.

Reproduksi:

```sh
npm test
node scripts/benchmark-fe-axisymmetric.mjs
python docs/fe/f3/reference_numpy.py
```

NumPy hanya untuk regenerasi oracle, tidak dipakai di runtime website.

## Sumber formulasi

- [FEniCSx — Axisymmetric elasticity](https://bleyerj.github.io/comet-fenicsx/tours/linear_problems/axisymmetric_elasticity/axisymmetric_elasticity.html): strain ur/r dan integrasi meridian dengan bobot radial.
- [FEniCSx — Linear thermoelasticity](https://bleyerj.github.io/comet-fenicsx/tours/multiphysics/thermoelasticity_weak/thermoelasticity_weak.html): σ=C:(ε−αΔT I) dan pemindahan initial strain ke RHS.
- [MOOSE — Axisymmetric RZ strain](https://mooseframework.inl.gov/modules/solid_mechanics/common/supplementalAxisymmetricRZStrain.html): tensor 3D dalam model axisymmetric 2D dan konvensi urutan komponen.

## Batas dan langkah berikutnya

Statis, isotropik, elastis linier, seluruh field axisymmetric. |εutama total|≤1%, |αΔT|≤1%, von Mises<Sy latihan; ν≤0,45. Di luar domain, hanya penjelasan kondisi yang ditampilkan, tanpa deformasi/kontur atau nilai perbandingan sah. Tidak mencakup plastisitas, kontak, tekuk, tekanan internal, gradien temperatur, torsion, fatigue atau verifikasi komponen/perpipaan nyata.

**F4 berikutnya:** TOR2 untuk 05-M/K dan 10-M, gauge warping, geometri lingkaran/berongga, Jt, torsi/energi dan tanda tegangan. Publikasi FE tetap menunggu keputusan rilis terpisah.
