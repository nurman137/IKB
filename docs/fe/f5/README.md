# F5 — Superposisi beban gabungan COMB

Selesai pada branch `feat/fem-f0`, 27 November 2026. Dua kasus baru: 09-M dan 09-K, sehingga FE tersedia pada **18/20 kasus**. Tidak merge dan tidak menerbitkan pembaruan situs publik. Berikutnya F6 untuk 04-M/K (submodel pelat sambungan).

## Implementasi

`web/fe/combined-case.js` menyiapkan dan menggabungkan dua solusi nyata: BEAM2 untuk aksial/lentur, TOR2 T6 untuk torsi. `solveCombined` memanggil solver secara berurutan, berhenti jika submodel gagal/dibatalkan; UI memakai Worker terpisah melalui FEController. Tidak ada kernel solid 3D baru.

- Poros pejal prismatik, kantilever dengan F aksial dan kopel ujung M; tidak ada gaya lintang. N dan M konstan sepanjang poros, dipulihkan dari gaya ujung elemen BEAM2 di z=L/2.
- TOR2 menyelesaikan warping pada penampang yang sama, lalu mengevaluasi komponen geser aktual di A=(0,+d/2,L/2) dan B=(0,−d/2,L/2).
- Input M/T pada FE dapat bertanda. Kalkulator analitis lama tetap memakai magnitudo M/T dan inputnya ditransfer dalam satuan kanonik.
- Tambahan F0 tetap eksplisit: L=1000 mm Mesin, L=2000 mm Kapal, E=200000 MPa, ν=0,3. Pengguna dapat mengubahnya.
- UI menyediakan dua konteks, konversi satuan, reset, pembatalan, kontur TOR2, titik A/B, kurva lendutan BEAM2, perbandingan analitis, tujuh langkah, matriks Ke kedua submodel, tensor per titik dan titik integrasi mentah elemen terpilih.
- Snapshot transfer versi 1 terpisah per konteks, memvalidasi dan membatasi field. Input/mesh berubah menghapus seluruh hasil/studi lama. Hasil parsial tidak menjadi keputusan gabungan.

## Pemetaan sumbu dan tanda

Sumbu poros global z, penampang x/y. Sumbu BEAM lokal s→z dan v→y; sumbu rotasi lokal menuju −x. Karena itu kopel global Mx=+M kasus dimasukkan sebagai **kopel lokal −M**. Konvensi ini membuat A tarik untuk M kasus positif, sesuai register M0.

Pada elemen yang mencakup z=L/2, N=−f0 dan M kasus=−(−f2+f1·jarak). Tegangan normal dipulihkan sebagai σzz=N/A+M kasus·y/I. Ini pemulihan nominal BEAM2, bukan tegangan solid FE. A/I memakai geometri lingkaran analitis sebagaimana formulasi elemen garis; Jt dan geser TOR2 berasal integrasi mesh poligon aktual.

TOR2 memberi τxz=Gκ(ψx−y), τyz=Gκ(ψy+x). Untuk T positif, A mempunyai τxz negatif dan B positif; magnitudo sama tidak berarti komponen bertanda sama. Tensor global pada setiap titik:

```
[[0,    0,    τxz],
 [0,    0,    τyz],
 [τxz,  τyz,  σzz]]
```

Von Mises dihitung dari invariant tensor: σvm=√(σzz²+3τxz²+3τyz²). Tegangan utama dihitung dari eigenvalues tensor khusus ini; regangan utama memakai hukum elastis isotropik dengan Poisson. Titik kritis dipilih setelah tensor A dan B selesai digabung, bukan menjumlahkan maksimum dari lokasi berbeda. n=Sy/max(σvmA,σvmB). Beban seluruhnya nol menghasilkan n tidak terdefinisi dan tidak memberi keputusan lulus.

Energi total U=U BEAM2+U TOR2 diperiksa terhadap jumlah setengah kerja masing-masing submodel. Tidak ada visual deformasi gabungan solid 3D; kurva yang ditampilkan hanya lendutan BEAM2 dengan faktor perbesaran berlabel.

## Domain dan mesh

Gerbang sebelum/sesudah solve: L/d≥10, σvm<Sy, |regangan utama|≤1%, γ≤1%, |δ ujung|/L≤2%, |rotasi lentur|≤0,05 rad dan |θ puntir|≤0,05 rad. Geometri TOR2 harus mempunyai galat area dan momen polar ≤0,2%. Di luar domain, kontur/deformasi, faktor keamanan dan keputusan tidak digunakan.

BEAM2: 4/8/16 elemen (kasar/sedang/halus), selalu mempunyai node z=L/2. TOR2 memakai jadwal F4: keliling 128/192/256, radial 2/4/8, dengan 897/2881/7937 node. Tetap di bawah cap kernel yang sudah ada; kedua submodel diselesaikan terpisah. Galat geometri poligon dikendalikan terpisah dari konvergensi.

Studi tiga mesh: perubahan sedang–halus von Mises kedua titik ≤3%, sudut puntir dan energi ≤1%; acuan nol memakai toleransi absolut 1e−8. Solusi kopel murni BEAM2 memang tepat pada interpolasi kubiknya; konvergensi tegangan geser tetap dipengaruhi geometri TOR2.

## Bukti pemeriksaan

`npm test`: **170/170 kelompok tes lulus**, termasuk 14 kelompok F5. Build **52 rute +404**; aset 559279 byte, di bawah batas 600 KiB. Model analitis M0 dan regresi FE F1–F4 tetap lulus.

Tes F5 mencakup:

- Dua baseline tiga tingkat mesh dibandingkan fixture SI independen F0 yang sudah dibekukan.
- Koordinat A/B sama di kedua submodel, pemetaan kopel, komponen geser berlawanan, simetri tensor, von Mises dan tegangan/regangan utama.
- F/M negatif yang memindahkan titik kritis; T negatif membalik geser/θ tanpa mengubah energi/von Mises.
- F=0, M=0, T=0, semua nol; perubahan L menjaga tegangan namun mengubah perpindahan aksial/rotasi/puntir secara linear, lendutan secara kuadrat.
- Penggandaan beban menggandakan tensor, melipatempatkan energi dan membagi n menjadi dua.
- Input invalid, domain luluh/deformasi/strain, galat geometri, submodel gagal/dibatalkan, snapshot salah konteks/versi, rute langsung/reload.
- Referensi analitis yang sengaja diubah tidak mengubah tegangan FE; nilai memang berasal medan/gaya dalam submodel.

`node scripts/benchmark-fe-combined.mjs`: [benchmark.json](benchmark.json) merekam **6 kombinasi /12 penyelesaian kernel**. Kedua seri memenuhi konvergensi. Selisih relatif terbesar terhadap pembanding sekitar 0,08036% (mesh kasar). Run gabungan terlama sekitar 0,703 s pada lingkungan ini; bukan jaminan kinerja perangkat mahasiswa.

Hasil mesh halus (MPa, n tanpa satuan, θ rad):

| Kasus | σzz A | σzz B | σvm maksimum | n | θ |
| --- | ---: | ---: | ---: | ---: | ---: |
| 09-M | 47.746483 | -47.746483 | 55.135658 | 4.534271 | 0.01034715 |
| 09-K | -12.992240 | -12.992240 | 53.061437 | 4.711520 | 0.02206472 |

Browser desktop: link dari kalkulator dan pemindahan F=10 kN, solve kedua kernel, inspeksi Ke elemen 3, pembalikan F/T, penghapusan hasil lama, pembatalan, studi tiga mesh, penolakan L di luar domain, serta pergantian konteks Kapal diperiksa. Viewport iframe 320/390 px menyelesaikan run dan tabel tensor tanpa overflow horizontal halaman. Tabel lebar dapat digulir di dalam panel; uji perangkat fisik dan pembaca layar tetap bagian tinjauan rilis.

## Sumber dan batas

- [MIT OCW 2.001, lecture notes](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/pages/lecture-notes/): bending, superposition, torsion, energy methods.
- [MIT, catatan superposisi dan lendutan](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/e5a0d036c217b7c10b335ab17b56dcad_lec21.pdf).
- [MIT, failure of materials dan tensor/von Mises](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/0536dc7d752d099f72b85de5d8876f22_lec17.pdf).
- [F0: spesifikasi COMB](../f0/01_spesifikasi_model.md), [F4: solver warping dan validasinya](../f4/README.md).

Tidak memodelkan tekuk poros tekan, fatigue, alur pasak/bahu, konsentrasi tegangan, warping restraint ujung, plastisitas atau aturan klasifikasi kapal. Keputusan hanya kriteria latihan. Status solusi tetap `solved_unverified` mengikuti kontrak pengembangan sampai tinjauan rilis F8.
