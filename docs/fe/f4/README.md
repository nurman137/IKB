# F4 — TOR2 untuk torsi poros

Status: selesai pada branch `feat/fem-f0`, 27 November 2026. Belum merge atau publikasi. Kasus baru: 05-M, 05-K, 10-M; jumlah halaman FE menjadi 16/20. 10-K tetap memakai BEAM2. Berikutnya F5 (09-M/K, beban gabungan).

## Cakupan pembelajaran

- Input torsi langsung atau daya–rpm pada modul 05, penampang pejal/berongga, arah positif/negatif, konversi satuan dan pemindahan data dari kalkulator analitis.
- Kontur tegangan geser, arah vektor geser dan fungsi warping, serta rekonstruksi rotasi penampang ujung dari sudut puntir. Visual rotasi bukan deformasi solid 3D.
- Tujuh langkah perhitungan, matriks kekakuan 6×6 aktual dan tiga titik integrasi mentah untuk elemen yang dipilih.
- Perbandingan Jt, tegangan luar/dalam, sudut puntir, integral torsi dan energi terhadap acuan lingkaran. Studi tiga mesh memeriksa konvergensi.
- Modul 10-M menghitung alternatif A/B secara terpisah; faktor keamanan dan kekakuan dari FE dipakai sebelum membandingkan massa. Kedua konteks dapat dipindah melalui tombol Mesin/Perkapalan.
- Worker, pembatalan, snapshot per konteks dan invalidasi hasil saat input berubah. Keputusan tidak mempertahankan hasil lama setelah input diubah.

## Formulasi dan satuan

Elemen segitiga kuadratik T6 mempunyai satu DOF skalar ψ per node, dalam mm². Dengan koordinat x,y (mm):

Kij = ∫(Ni,x Nj,x + Ni,y Nj,y)dA; fi = ∫(y Ni,x − x Ni,y)dA.

Semua tepi memakai kondisi batas natural, termasuk tepi rongga. Satu node dipin sebagai gauge numerik; setelah solve, rata-rata berbobot luas dikurangkan sehingga ∫ψ dA=0. Pin ini bukan tumpuan fisik. Matriks dirakit sparse dan diselesaikan dengan Jacobi PCG; dense tersedia sebagai pembanding tes.

q=(ψ,x−y, ψ,y+x); Jt=∫q·q dA; κ=T/(GJt); θ=κL; τ=Gκq; perpindahan aksial w=κψ. Pemeriksaan independen memakai Jtorque=∫(x qy−y qx)dA, energi U=Gκ²JtL/2 dan setengah kerja Tθ/2. Tegangan dalam MPa, torsi/energi N·mm, Jt mm⁴. ψ geometrik dapat tidak nol ketika T=0, tetapi w, τ, θ dan energi harus nol.

Pemulihan menggunakan gradien elemen dan titik integrasi mentah; tidak ada smoothing nodal yang menyamarkan diskontinuitas. Nilai permukaan memakai evaluasi T6 di titik geometrik aktual. Resultan geser, kompatibilitas Neumann, residual penuh, gauge dan simetri diperiksa.

## Mesh dan perubahan terhadap F0

| Tingkat | Segmen keliling | Lapisan radial | Node pejal | Node berongga |
| --- | ---: | ---: | ---: | ---: |
| Kasar | 128 | 2 | 897 | 1280 |
| Sedang | 192 | 4 | 2881 | 3456 |
| Halus | 256 | 8 | 7937 | 8704 |

Sisi T6 lurus dengan node tengah pada tali busur. Jadwal 32/64/128 pada spesifikasi awal dinaikkan menjadi 128/192/256 karena galat momen polar geometri poligon harus ≤0,2%; 32 dan 64 segmen tidak memenuhinya. Geometri rongga benar-benar berlubang: dua loop batas, tanpa elemen yang melintasi pusat. Batas solver 10.000 DOF/node dan 8.000 elemen. Benchmark paling besar memakai 8.703 DOF bebas setelah gauge.

Pada lingkaran ideal ψ konstan. Pada mesh poligon reguler T6 yang dipakai, proyeksi ruas kanan diskret juga dapat nol hingga roundoff sehingga PCG memerlukan nol iterasi. Jt tetap diintegrasikan dari mesh aktual; rumus lingkaran tidak disuntikkan ke solver. Kasus simetris ini tidak membuktikan solver warping umum. Oleh sebab itu pengujian menambahkan penampang persegi panjang tak beraturan dengan referensi NumPy independen dan elips dengan ψ tidak nol, Jt berbeda dari momen polar. Elips hanya fixture validasi internal, belum menjadi pilihan UI.

## Gerbang hasil

- Geometri: galat luas dan momen polar terhadap lingkaran ideal ≤0,2%.
- Domain: √3|τ|max < Sy, γmax ≤1%, |θ| ≤0,05 rad. Gerbang diperiksa sebelum dan sesudah solve. Ini batas latihan elastis/deformasi kecil, berbeda dari target faktor keamanan dan batas sudut desain.
- Konvergensi sedang–halus: perubahan Jt, θ, U ≤1%, tegangan ≤3%; acuan nol menggunakan toleransi absolut.
- Geometri invalid, konektivitas terputus/tidak konform, node yatim, duplikasi, gauge invalid, BC mekanis yang tidak didukung, material invalid, rpm nol dan pembatalan menghasilkan status terkendali.

## Bukti validasi

`npm test`: **156/156 kelompok tes lulus** (140 sebelumnya +16 TOR2). Build 50 rute dan 404; aset 532.173 byte, masih di bawah batas 600 KiB. Regresi model analitis lama tetap lulus.

`node scripts/benchmark-fe-torsion.mjs` menghasilkan [benchmark.json](benchmark.json): 21 perhitungan (12 baseline 05-M/K dan 10-M A/B, 6 tambahan poros berongga, 3 elips internal). Enam seri lingkaran seluruhnya memenuhi konvergensi. Pada mesh halus, galat momen polar lingkaran sekitar 0,02008%. Waktu terlama yang tercatat sekitar 1,23 s pada lingkungan pengujian ini, bukan jaminan perangkat mahasiswa.

[reference_numpy.py](reference_numpy.py) merakit interpolasi T6 melalui Vandermonde Kartesian dan menyelesaikan sistem KKT rata-rata nol dengan NumPy, tanpa mengimpor solver produksi. [reference_numpy.json](reference_numpy.json) membekukan ψ/J dari persegi panjang ber-node interior tidak simetris. Tes membandingkan dense dan PCG terhadap referensi ini, lalu mengubah node gauge. Tes lain memeriksa tanda vektor, torsi negatif/nol, skala dimensi/beban/panjang, transmisi daya, keputusan A/B, pemindahan konteks, rongga dan penolakan hasil di luar domain.

Browser: pemindahan input 05-M, poros berongga, arah negatif, visual rotasi, daya–rpm, rpm nol, batas domain, pembatalan studi, konvergensi tiga mesh, pilihan elemen/matriks, keputusan A/B dan pergantian 10-M/K telah diperiksa. Tampilan viewport 320 dan 390 px menyelesaikan perhitungan tanpa overflow horizontal halaman. Ini pengujian browser dengan lebar ponsel; uji perangkat fisik dan pembaca layar masih bagian tinjauan rilis. Perbaikan blur pada input pemilih elemen juga diterapkan ke AX2 agar pembukaan langkah tidak tertelan render ulang.

## Sumber dan batas

Formulasi warping dibandingkan dengan implementasi sumber primer [sectionproperties — fea, _assemble_torsion](https://sectionproperties.readthedocs.io/en/stable/_modules/sectionproperties/analysis/fea.html). Implementasi TOR2 proyek ini mandiri. Acuan perhitungan lingkaran tetap mengikuti register M0 dan spesifikasi F0.

Model Saint-Venant elastis isotropik dengan warping bebas, tanpa efek ujung, restrain warping, plastisitas, buckling, fatigue atau 3D solid. Kriteria modul 10 adalah keputusan latihan, bukan pengesahan desain industri/kapal. Status internal tetap `solved_unverified` sampai tinjauan rilis keseluruhan.
