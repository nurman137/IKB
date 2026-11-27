# F2a — Percontohan FE modul 06

Implementasi pengembangan untuk kasus **06-M** (balok penyangga mesin) dan **06-K** (balok geladak kapal). Belum digabung ke main atau diterbitkan ke situs publik.

## Halaman dan alur belajar

- `/modul/06/fe/mesin/` dan `/modul/06/fe/kapal/` mempunyai berkas rute statis; kunjungan langsung dan reload bekerja.
- Tombol **Eksplorasi FE 2D** pada laboratorium/perhitungan modul 06 membawa input kanonis, terpisah per konteks dan versi skema. Tanpa transfer memakai preset M0. Pergantian satuan mempertahankan besaran fisik; reset kembali ke preset konteks.
- BEAM2 Euler–Bernoulli: 4/8/16 elemen, sendi kiri–rol kanan; titik tengah atau beban merata konsisten (termasuk momen nodal).
- PS2 T6 plane stress: dua segitiga kuadratik per sel; node tengah sisi bersama, integrasi tiga titik eksak untuk BᵀDB polinomial derajat dua pada sisi lurus. Ketebalan adalah b. Asumsi plane stress ini pendekatan pendidikan terhadap komponen 3D.
- Worker menangani setiap run; pembatalan/input berubah mengakhiri worker, menghapus hasil dan studi lama. Studi memakai snapshot fisik yang sama untuk ketiga mesh.
- Diagram geometri/deformasi, kontur σxx pusat elemen tanpa smoothing, panah beban/tumpuan dan penanda ROI. Faktor deformasi dicantumkan dan dibatasi viewer. Kontur memakai rentang aktif, bukan kode kelayakan.
- Tabel analitis–FE mencantumkan selisih absolut dan relatif. Tujuh langkah menjelaskan satuan, diskretisasi, Ke numerik elemen pertama, perakitan/kendala, penyelesaian/reaksi/energi, ROI, serta interpretasi.

## Tumpuan, pembebanan, ROI

Solid memakai kendala rata-rata berbobot integrasi sisi: rata-rata ux strip kiri = 0; rata-rata uy strip kiri dan kanan = 0. Kendala dieliminasi dengan u=Pz+g, tanpa pegas, penalti besar atau penguncian rotasi strip. Hanya kelompok DOF yang terpisah didukung; overlap ditolak.

Strip nominal s₀=min(0,02L; 0,25h); pilihan 0,5 / 1 / 2 × s₀. Default F2a **0,5 × s₀**. Beban titik total P didistribusikan konsisten di strip atas tengah; resultan dan centroid tetap P serta L/2. UDL memakai seluruh sisi atas. Tumpuan solid berpusat di s/2 dan L−s/2, sehingga berbeda dari tumpuan titik acuan pada 0 dan L.

Lendutan dibandingkan di (L/2,0). σxx dibandingkan di x=L/4, y=±h/2; posisi ini setidaknya satu tinggi penampang dari strip untuk rentang input L/h≥10 dan seluruh pilihan strip. Evaluasi T6 menggunakan B pada titik ROI, rata-rata aritmetika hanya jika titik dimiliki beberapa elemen (jumlah tidak dianggap sampel independen). Bukan ekstrapolasi atau perataan nodal untuk menyamarkan puncak lokal. Maksimum von Mises domain berasal dari titik integrasi; pada BEAM2 dari momen lentur FE.

## Penyesuaian terhadap rancangan F0

1. Mesh T6 memakai **4/6/8 lapis tinggi**, menggantikan rencana 4/8/16. Mesh halus 16 lapis melebihi batas 10.000 DOF pada preset. Koordinat x tetap memuat tepi strip dan ROI; tidak sekadar mengganti ukuran gambar. Benchmark halus terbesar saat ini 8.327 DOF bebas.
2. Default strip diperkecil menjadi 0,5 × s₀ untuk mengurangi pergeseran pusat tumpuan terhadap acuan titik. Pada strip nominal 1 × s₀, contoh UDL Mesin memiliki selisih lendutan sekitar 6,2% walaupun mesh sudah halus. Ini dicatat sebagai perbedaan model, bukan dipaksa menjadi galat mesh. Pilihan 1 dan 2 tetap tersedia; UI menandai bila selisih melampaui 5%.
3. PCG T6 memakai target residual relatif 1e−9 (gerbang akhir 1e−8 tetap). Saat residual rekursif mencapai target tetapi residual terhitung ulang belum, arah pencarian dimulai ulang. Ini menghindari stagnasi akibat mengganti residual tanpa memulai ulang arah konjugat. Solver F1 lainnya mempertahankan target 1e−10.

## Validasi numerik

`npm test`: **107 kelompok lulus** (91 sebelumnya + 16 F2a). Tidak ada dependensi runtime tambahan. Build 36 rute + 404, aset tetap di bawah 600 KiB tanpa kompresi.

- Oracle NumPy independen memakai interpolasi polinomial Kartesius dan sistem KKT, bukan eliminasi MPC implementasi browser. Mencakup gaya nodal bebas serta kendala rata-rata tidak nol; perpindahan, reaksi dan energi dibandingkan.
- Manufactured pure bending kuadratik pada segitiga miring dan patch dengan midpoint internal bebas menguji kemampuan T6 mereproduksi tegangan linier.
- Empat konfigurasi (Mesin/Kapal × titik/UDL), tiga tingkat mesh setiap kernel: reaksi/ROI/lendutan BEAM2 sesuai analitis; 12 run solid memenuhi selisih acuan 5% pada default strip.
- Seluruh studi solid memenuhi perubahan sedang–halus: lendutan dan energi ≤1%, tegangan ROI ≤3%. Residual, kendala rata-rata, kesetimbangan dan energi diuji terpisah.
- Beban nol, input invalid, sisi T6 tidak lurus/midpoint salah, MPC overlap, batas alokasi mesh, domain material/geometri, transfer lintas konteks dan rute FE modul lain diuji.

Hasil solid mesh halus (nilai lengkap pada [benchmark.json](benchmark.json)):

| Kasus | DOF bebas | δ FE (mm) | Selisih δ | Selisih σ ROI terbesar |
| --- | ---: | ---: | ---: | ---: |
| Mesin · point | 6967 | 0.322273 | 0.9978% | 2.0864% |
| Mesin · udl | 6967 | 0.186586 | 2.1753% | 2.5052% |
| Kapal · point | 8327 | 0.834238 | 1.1274% | 1.7386% |
| Kapal · udl | 8327 | 0.464628 | 2.1032% | 2.1180% |

Pemeriksaan browser: transfer 12 kN dari kalkulator Mesin; BEAM2 dan T6; UDL dan studi tiga mesh; kontur; reaksi/energi pada langkah 5; perubahan satuan L dari mm ke m; pembatalan; input invalid dan domain L/h; perpindahan ke konteks Kapal; tampilan 320/390 px tanpa overflow halaman. Browser bukan pengganti uji perangkat fisik atau pembaca layar.

Regenerasi:

```sh
npm test
node scripts/benchmark-fe-bending.mjs
python docs/fe/f2a/reference_numpy.py
```

NumPy hanya diperlukan untuk regenerasi oracle. Tidak diperlukan saat membuka situs atau menjalankan tes Node dengan fixture tersimpan.

## Batas hasil dan tindak lanjut

L/h≥10, elastis linier, regangan utama ≤1%, δ/L≤2%, rotasi/kemiringan ≤0,05 rad dan σvonMises<Sy latihan. Kondisi di luar domain menyembunyikan deformasi, kontur dan nilai perbandingan FE; kegagalan solver tidak dipakai sebagai hasil sah. Domain material solid dievaluasi di titik integrasi, sehingga puncak lokal masih bergantung mesh dan bukan bukti tidak ada plastisitas di seluruh komponen.

Belum mencakup plastisitas, kontak, tekuk, beban dinamis, validasi komponen industri atau aturan klasifikasi kapal. F2b berikutnya memperluas pemetaan ke 01, 07, dan 10-K setelah tinjauan percontohan ini. Spesifikasi F0 tetap arsip rancangan, F1 tetap arsip fondasi; dokumen ini mencatat perubahan implementasi F2a.
