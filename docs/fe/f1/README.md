# F1 — Fondasi solver, Worker dan viewer

27 November 2026 (WIB). **F1 selesai untuk fondasi BEAM2 dan PS2 T3 pada fixture pengembang.** F2–F8 belum diimplementasikan. Branch melanjutkan `feat/fem-f0`; aplikasi publik/main tidak diubah atau diterbitkan pada milestone ini.

F1 tidak mengaktifkan 20 kasus FE. Halaman pengembang lokal: jalankan `npm run build`, `npm run dev`, lalu buka `/assets/fe/dev.html`. Halaman ini adalah aset pengembangan, bukan rute mahasiswa dan bukan deklarasi kasus terverifikasi.

## Yang tersedia

| Berkas | Fungsi |
| --- | --- |
| `web/fe/elements.js` | Matriks BEAM2 frame bidang (aksial+Hermite), transformasi global/lokal, gaya nodal UDL konsisten, PS2 T3 dan raw B/D |
| `web/fe/algebra.js` | CSR Float64, Jacobi-PCG, dense Cholesky referensi ≤256 DOF, banded Cholesky untuk frame berpita sempit |
| `web/fe/solver.js` | Validasi schema/mesh/rigid modes, assembly, eliminasi Dirichlet dengan RHS terkoreksi, reaksi, residual, gaya/momen, energi dan pemulihan field |
| `web/fe/controller.js`, `worker.js` | Worker per run, snapshot input, runId, progress, terminasi cancel dan penolakan respons lama |
| `web/fe/fixtures.js` | Kantilever dan patch persegi dengan interior mesh tidak teratur |
| `web/fe/viewer.js` | SVG mesh awal/terdeformasi; kurva BEAM2 memakai interpolasi Hermite, PS2 berupa area segitiga; perbesaran dibatasi |
| `web/fe/dev.html`, `dev.js`, `dev.css` | Harness lokal: model, kehalusan, hasil, input aktif, diagnostik serta uji pembatalan Worker |
| `tests/fe-foundation.test.mjs` | 16 kelompok tes numerik/diagnostik/controller/visual F1 |
| `reference_numpy.py`, `reference_numpy.json` | Dua oracle independen: frame material berbeda diputar 37°, solid T3 tak teratur dibebani |
| `scripts/benchmark-fe.mjs`, `benchmark.json` | Benchmark Node yang dapat diulang beserta CPU/runtime dan status tiap model |

Kode runtime tidak memakai NumPy atau paket eksternal. NumPy hanya untuk menyiapkan oracle pengujian; tidak memanggil model JavaScript. Frame oracle mengintegrasikan fungsi kurvatur secara Gauss, sedangkan T3 oracle memakai inversi koefisien interpolasi; solusi akhir memakai direct solve NumPy.

## Kontrak kernel F1

Input `kernel` BEAM2/PS2, `nodes` berupa `[x,y]` dalam mm, `elements` dengan node indices dan E dalam MPa serta A(mm²)/I(mm⁴) atau ν/t(mm). `loads` berisi node,dof,value; gaya dalam N, momen node BEAM2 dalam Nmm. `constraints` berisi node,dof,value termasuk perpindahan nonnol. BEAM2 dof=[ux,uy,rz], PS2=[ux,uy]. `distributedLoads` qx/qy dalam N/mm pada sumbu lokal elemen BEAM2. T3 wajib CCW dan terhubung edge.

Output berhasil berstatus **solved_unverified**: displacement, reaksi hanya pada DOF terkendala, applied loads, field elemen, residual tereskala, simetri, keseimbangan, toleransi keseimbangan, energi, ½ kerja, metode solver dan waktu. BEAM2 menyimpan gaya ujung lokal setelah mengurangi beban elemen konsisten. PS2 menyimpan εxx,εyy,γxy engineering; σxx,σyy,τxy; tegangan utama dan von Mises. Tidak ada perataan kontur atau stress dari analitis yang dipakai menggantikan hasil numerik.

Status gagal: invalid_input, invalid_mesh, underconstrained, solver_failed, cancelled. Tidak mengembalikan partial displacement/field. Sistem tanpa tumpuan yang memadai ditolak bahkan bila beban nol. Tidak ada pegas lemah otomatis. Pivot dense sistem kecil membantu menemukan mekanisme. F1 menolak mesh solid yang hanya terhubung pada satu titik serta komponen lepas.

Sparse assembly dilakukan sebelum reduksi. Rotasi frame diskalakan dengan panjang karakteristik agar DOF reduced konsisten. Reaksi dan energi menggunakan K/f asli. Residual akhir memakai RHS efektif sesudah koreksi prescribed displacements, bukan hanya gaya nodal yang bisa bernilai nol pada patch test. Keseimbangan dinormalisasi dengan beban dan reaksi prescribed; tidak membandingkan gaya dalam N dengan momen dalam Nmm sebagai satu norm tanpa penskalaan.

## Hasil pengujian

**91 kelompok tes lulus**: 75 tes sebelumnya +16 F1. Gerbang 20 kasus M0 dan 133 angka situs lama tetap lulus. `tests/release.test.mjs` mempertahankan hitungan 34 rute+404 dan membedakan HTML harness di dalam aset dari rute tersebut; pembatasan aset dan dependensi eksternal tetap diperiksa.

- Kantilever F=−1000 N, L=1000 mm, E=200000 MPa, A=10000 mm², I=8.333.333,333 mm⁴: uy ujung **−0,2 mm**, rotasi **−0,0003 rad**, reaksi vertikal **1000 N**, momen jepit **1.000.000 Nmm**, energi **100 Nmm**.
- UDL total −1000 N pada bentang sama: uy ujung **−0,075 mm**, momen jepit **500.000 Nmm**, termasuk gaya nodal momen UDL.
- Patch PS2 E=200000 MPa, ν=0,3, t=10 mm, u=0,001x+0,0002y, v=−0,0003y: raw σxx=**200 MPa**, σyy≈**0**, τxy=**15,38461538 MPa**; energi **10.153,84615385 Nmm**. Interior tidak teratur dan ukuran 2/4/8/16 diuji.
- Frame diputar 0/90/37°, prescribed displacement nonnol, beban nol, penggandaan beban, penskalaan unit internal, oracle NumPy dan banded frame 384 DOF cocok dalam toleransi fixture.
- Tumpuan kurang, elemen terbalik/degenerat/duplikat/terputus, material invalid, schema salah, cap, iterasi gagal, cancel dan respons run lama diuji.

## Benchmark dan keputusan cap

Awal pengujian PCG pada frame 384 DOF gagal konvergen. Keputusan: frame berpita ≤32 memakai direct banded Cholesky, bukan mengendurkan residual. Batas frame F1 **384 DOF bebas**. Lebih besar ditolak eksplisit sampai ada verifikasi tambahan. PS2 mempertahankan cap **10000 DOF bebas**, maksimum **8000 elemen** dan **10000 node**. Cap bukan jaminan semua model di bawahnya berkondisi baik; solver boleh menolak model yang gagal residual/pivot.

Benchmark Node Linux, AMD EPYC 9V74, Node v24.22.3 (lihat JSON untuk angka lengkap): frame 384 DOF berhasil sekitar 24 ms; patch 4418 DOF/4608 elemen sekitar 331 ms; patch 6962 DOF/7200 elemen sekitar 501 ms. Waktu bersifat pengukuran satu lingkungan, bukan target laptop/ponsel yang sudah dijamin. `benchmark.json` dapat berubah pada pengulangan.

## Pemeriksaan browser dalam sesi F1

- Worker browser asli: BEAM2 dan PS2 selesai dan tabel/mesh tampil; model tanpa tumpuan dan segitiga terbalik ditolak.
- Patch besar 4418 DOF: waktu solve sekitar **490,8 ms**, residual sekitar **9,1e−11**, σxx≈200 MPa dan τxy≈15,38462 MPa.
- Tombol uji pembatalan memulai Worker nyata kemudian memanggil cancel setelah 50 ms; hasil diamati **58,3 ms** tanpa field parsial. Ini pengujian terkontrol lifecycle Worker, bukan jaminan semua perangkat membatalkan pada waktu sama.
- Mengubah model/mesh membersihkan hasil lama. Viewer square sempat terpotong; skala horizontal/vertikal diperbaiki dan diperiksa ulang.
- Belum menjalankan audit axe-core, perangkat fisik/proyektor atau seluruh variasi ukuran viewport pada F1. Log ekstensi browser yang tidak berasal dari aplikasi tidak dianggap error solver.

## Batas implementasi F1

- T3 untuk patch/penjelasan elemen. T6, lentur solid yang terkonvergensi dan tujuh kasus balok kurikulum adalah F2.
- AX2, TOR2, COMB, termal, kontak, shell, plastisitas/tekuk dan studi desain belum ada pada kernel baru.
- Hanya Dirichlet DOF individual. Kendala rata-rata/Lagrange/gauge belum tersedia; harus dibuat dan diuji sebelum PS2 strip khusus/TOR2 memerlukannya.
- Mesh generator F1 hanya fixture terpandu. Validasi tidak merupakan pemeriksa lengkap semua tumpang-tindih geometri atau hanging nodes pada CAD/mesh bebas; input semacam itu belum didukung.
- Status solved_unverified tidak menandakan lolos cutoff domain F0 atau aman. Cutoff regangan/lendutan dan status verifikasi per kasus akan dipasang pada adapter F2+ sebelum kasus mahasiswa diaktifkan.
- Harness minimal belum menyediakan pemilihan elemen/fokus hasil lengkap, kontur interaktif atau pembahasan tujuh langkah. Itu pengembangan pola mahasiswa F2/F7.

## Menjalankan ulang

```sh
python docs/fe/f1/reference_numpy.py  # opsional, perlu NumPy untuk regenerasi oracle
npm test
node scripts/benchmark-fe.mjs
npm run dev
```

**Saran berikutnya: F2a — modul 06 Mesin dan Kapal sebagai percontohan.** Tambahkan adapter kasus, kondisi sendi–rol, pemindahan input, hasil analitis–FE, T6 solid, ROI, domain dan studi mesh sesuai F0. Jangan mengaktifkan FE publik sebelum gerbang kasus tersebut lulus.
