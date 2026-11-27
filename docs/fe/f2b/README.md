# F2b — Lima kasus balok tambahan

Status: implementasi branch pengembangan `feat/fem-f0`, belum merge ke main dan belum diterbitkan. Bersama F2a, **7 dari 20 kasus** kini mempunyai jalur FE.

## Cakupan dan rute

| Kasus | Jalur | Model dan target |
| --- | --- | --- |
| 01-M/K | `/modul/01/fe/mesin/`, `/modul/01/fe/kapal/` | BEAM2; beban pada a, potongan x, RA/RB, M, V kiri/kanan, δ pada beban dan δ maksimum |
| 07-M/K | `/modul/07/fe/mesin/`, `/modul/07/fe/kapal/` | A/B; persegi panjang, I, T, pipa melalui properti BEAM2; T6 hanya persegi panjang |
| 10-K | `/modul/10/fe/kapal/` | Dua alternatif geometri; perbandingan FE; keputusan latihan BEAM2 berdasarkan kekuatan dan kekakuan; T6 sebagai pengayaan |
| 06-M/K | F2a, tetap tersedia | Percontohan BEAM2/T6, titik/UDL dan sensitivitas strip |

`10-M` tidak mendapat tombol FE pada tahap ini; poros mengikuti TOR2 pada F4. Modul FE lain yang belum diimplementasikan tetap 404, bukan tautan semu.

## Perilaku numerik

### Modul 01

- Mesh dibagi menjadi dua bagian bila 0<a<L; node berada tepat di a. Pada a=0/L beban masuk DOF tumpuan. Reaksi memikul P, sedangkan seluruh gaya dalam dan deformasi nol.
- Konvensi x ke kanan, y ke atas, P ke bawah. V kiri dan kanan pada potongan dibedakan; di luar ujung balok V=0. M sagging positif; σ atas negatif.
- δ pada beban dan δ maksimum dipisahkan. Maksimum FE dicari dari akar kuadrat turunan interpolasi Hermite di setiap elemen dan dibandingkan dengan solusi analitis independen. Lokasi tidak dipaksakan ke a atau L/2. Jika respons nol, lokasi maksimum tidak unik.
- b/h/E/Sy adalah tambahan F0 yang ditampilkan sebagai asumsi latihan. Geometri Mesin 60×120 mm, Kapal 100×200 mm; E=200 GPa dan Sy=250 MPa. Reaksi baseline M0 tidak bergantung EI.
- Beban sangat dekat tumpuan yang menghasilkan elemen terlalu pendek ditolak; gunakan a tepat 0/L. Domain Euler–Bernoulli tetap diperiksa.

### Modul 07

- Dua subrun tersendiri dengan A/I dan jarak serat dari centroid. A seperti gambar, B diputar 90°. Bentuk penampang divisualisasikan pada skala sama; gambar itu geometri, bukan mesh solid.
- I/T memakai teorema sumbu sejajar dan sumbu kuat/lemah. T tidak disamakan dengan persegi panjang atau diasumsikan punya serat atas/bawah simetris. Pipa mempunyai respons identik pada rotasi 90°.
- A/I dilabeli properti geometri, bukan hasil solver FE. Tegangan dihitung dari momen FE dan jarak serat yang sesuai, σxx=−My/I.
- Profil I/T/pipa tidak pernah diam-diam diubah menjadi mesh persegi panjang; opsi T6 dinonaktifkan. Ukuran selain persegi panjang adalah preset latihan modul 07, bukan baseline M0 baru.

### Modul 10-K

- Kedua alternatif diselesaikan dengan mesh dan properti sendiri, P/L/E yang sama. Kriteria BEAM2 memakai σ dan δ dari FE: n=Sy/σmax (tidak terdefinisi pada beban nol), kekuatan n≥target, kekakuan δ≤batas.
- Massa=ρ b h L ×10⁻⁹ kg; ρ=7.850 kg/m³ adalah tambahan F0. Massa tetap properti geometri/material.
- Di antara alternatif yang memenuhi kedua kriteria, pilih massa lebih kecil; jika massa sama pilih margin kekuatan lebih besar. Seri penuh mempertahankan A. Tidak ada pilihan bila keduanya belum memenuhi. Jika salah satu subrun di luar domain/gagal, rekomendasi disembunyikan.
- Pada preset, A memenuhi kekuatan dan kekakuan; B memenuhi kekuatan tetapi belum memenuhi kekakuan. Kriteria latihan tidak sama dengan batas domain.
- T6 membandingkan δ tengah, σ ROI dan reaksi strip. Tegangan nominal BEAM2 tidak ditukar dengan puncak lokal T6 untuk memberi rekomendasi. Keputusan desain dari pengayaan solid dinyatakan belum tersedia.

## Solid dan pengendalian ukuran mesh

Formulasi T6, integrasi, eliminasi kendala rata-rata dan domain memakai F2a. ν=0,3; strip default=0,5×min(0,02L;0,25h). Titik perbandingan δ=(L/2,0), σxx=(L/4,±h/2); reaksi resultan tiap strip=P/2. Perbedaan letak pusat tumpuan/efek model tetap dijelaskan. Kontur pusat elemen tanpa smoothing memakai **rentang otomatis tiap subrun dan mesh**, sehingga warna A/B tidak boleh dipakai sebagai perbandingan kuantitatif.

F2b mempertahankan 4/6/8 lapis tinggi dengan maksimum 64/96/128 pembagian aksial awal; koordinat tepi strip dan ROI tetap ditambahkan. Ini mengatasi orientasi rebah yang melebihi 10.000 DOF pada pembagian mendekati persegi F2a. Ukuran aktual dicatat di tiap run, bukan sekadar label kasar/sedang/halus. Pengayaan solid F2b dibatasi L/tinggi≤100; pilih BEAM2 untuk rentang lebih ramping. Cap solver 10.000 DOF tidak dinaikkan. F2a memakai pembagian sebelumnya bila opsi pembagian aksial tidak diberikan.

Studi memegang input/BC tetap; A/B mempunyai tabel konvergensi terpisah. Ambang sedang–halus δ/energi≤1%, σ ROI≤3%. BEAM2 dengan beban titik sudah dapat tepat secara polinomial pada mesh kasar; UI tidak mengarang tren galat yang menurun.

## Integrasi, pembatalan dan tampilan

- Tombol FE pada laboratorium dan kalkulator 01/07/10-K mengirim input kanonis ke snapshot sessionStorage ber-versi, terpisah berdasarkan modul/konteks. Input invalid ditolak; akses langsung memakai preset. Membuka FE tidak menimpa input analitis.
- Worker dan nomor run F1 dipakai kembali. Perubahan input, satuan, bentuk, mesh atau model membatalkan worker dan menghapus seluruh hasil/studi/rekomendasi lama; pembatalan eksplisit dan pagehide ditangani.
- Diagram beban/tumpuan, bentuk awal/deformasi berskala, kontur T6, tabel angka, tujuh langkah, matriks elemen numerik 6×6 atau 12×12 tersedia. Studi dan perubahan tampilan tetap memakai model mesh yang menghasilkan hasil tersebut.
- Subrun luar domain tidak menampilkan deformasi, kontur atau nilai perbandingan sahnya. Subrun lain yang sah tetap dapat dipelajari; keputusan 10-K memerlukan keduanya sah.
- Batas: L/tinggi≥10, σ<Sy, |ε|≤1%, |δ|/L≤2%, |kemiringan|≤0,05 rad. Tidak ada plastisitas, kontak, tekuk lokal/lateral, sambungan, klasifikasi kapal atau verifikasi komponen nyata.

## Validasi dan reproduksi

`npm test`: **124 kelompok lulus**, termasuk 17 tambahan F2b dan 107 regresi sebelumnya. Build 41 rute + 404; tujuh berkas kasus FE dapat dibuka/reload langsung, termasuk pada base path subdirektori. Aset runtime tetap di bawah 600 KiB tanpa kompresi.

Pengujian mencakup:

- Lima baseline cocok dengan fixture SI F0 tersimpan (tanpa menganggap hasil analitis sebagai validasi solver). Reaksi, momen, tegangan dan deformasi FE dibandingkan secara numerik; A/I dipisahkan sebagai properti geometri.
- Beban eksentris tiga mesh, simetri refleksi, V kiri/kanan, x=0/L, a=0/L, δ maksimum dan lokasi dari FE, energi=P δ(a)/2 serta penskalaan E.
- Profil I/T/pipa A/B; centroid dan tegangan T juga dibandingkan dengan perhitungan SI terpisah. Domain diuji per subrun.
- Kriteria alternatif: hanya A memenuhi, massa sama, massa lebih kecil, tidak ada yang memenuhi, beban nol, input invalid dan di luar domain. T6 tidak memberi keputusan nominal desain.
- T6 persegi panjang A/B, konvergensi tiap orientasi, residual/energi, penolakan kernel/bentuk yang tidak tersedia, rentang geometri, transfer rusak/lintas konteks/versi salah dan rute belum tersedia.

Browser QA: transfer 12 kN dari 01-M, beban tepat di tumpuan dan tiga mesh, transfer profil T dari 07, kedua orientasi, opsi T6 non-persegi panjang dinonaktifkan, cancel solid/studi, solid mesh halus A/B, 10-K kekuatan dan lendutan terpisah, perubahan batas δ, domain salah satu alternatif, reset, satuan L mm→m, serta tampilan 320/390 px. Matriks yang dibuka tetap di dalam panel scroll tanpa overflow halaman. Ini bukan uji perangkat fisik atau pembaca layar.

Benchmark pada [benchmark.json](benchmark.json) merekam 42 run (24 BEAM2 + 18 T6) dan 14 pemeriksaan konvergensi dari kelima preset F2b. Hasil dan metrik berikut dihasilkan di executor pengembangan; waktu proses bukan jaminan kinerja perangkat mahasiswa.

```sh
npm test
node scripts/benchmark-fe-family.mjs
```


### Ringkasan benchmark solid mesh halus

| Kasus / subrun | DOF bebas | δ FE (mm) | Selisih relatif terbesar* |
| --- | ---: | ---: | ---: |
| 07-M / A | 5743 | 0.062659 | 2.1068% |
| 07-M / B | 9007 | 0.386646 | 1.0701% |
| 07-K / A | 6967 | 0.201420 | 2.0864% |
| 07-K / B | 9007 | 1.434360 | 0.8571% |
| 10-K / A | 7919 | 0.621086 | 1.8771% |
| 10-K / B | 9007 | 3.150479 | 0.8945% |

*Terbesar di antara δ tengah, σ ROI atas/bawah dan reaksi strip; bukan puncak tegangan lokal. Seluruh 14 pemeriksaan konvergensi memenuhi ambang. Maksimum 9.007 DOF bebas. Waktu per run yang direkam paling lama sekitar 5,2 detik di executor ini; hasil waktu dapat berubah saat script diulang.

## Langkah berikutnya

F3: kernel axisymmetric AX2 dan enam kasus 02-M/K, 03-M/K, 08-M/K, termasuk regularitas r=0, kontraksi Poisson, beban seluruh lingkaran serta regangan awal termal. F2a/F2b tetap pengembangan; publikasi menunggu tahap rilis yang ditetapkan terpisah.
