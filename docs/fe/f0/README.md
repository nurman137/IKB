# F0 — Spesifikasi pengembangan Analisis FE IKB

**F0 selesai sebagai paket spesifikasi v0.1, 27 November 2026 (WIB). F1–F8 belum diimplementasikan.** Seluruh 20 kasus sudah dipetakan dengan input tambahan, model, kondisi batas, beban, hasil pembanding dan gerbang pengujian. Ini tidak mengubah aplikasi atau situs publik.

Baseline: IKB `1.0.0-rc.2`, commit `8aa939defe0b41d832186b6b7eeece6477ad1568`. Branch pengembangan: `feat/fem-f0`. Data M0 dan source analitis dipertahankan. Tidak ada solver FE atau angka hasil FE pada paket ini.

## Isi paket

| Berkas | Isi |
| --- | --- |
| [01_spesifikasi_model.md](01_spesifikasi_model.md) | Formulasi BEAM2/PS2/AX2/TOR2/COMB; koordinat, tanda, BC, beban dan batas |
| [02_matriks_20_kasus.md](02_matriks_20_kasus.md) | Ringkasan pemetaan per kasus, tambahan preset serta batas |
| [03_validasi_dan_toleransi.md](03_validasi_dan_toleransi.md) | Kriteria numerik, fixture kernel/kasus, konvergensi mesh dan ROI |
| [04_alur_belajar_dan_data.md](04_alur_belajar_dan_data.md) | Rute rencana, transfer input, kontrak run, pembandingan dan pengalaman belajar |
| [05_milestone_dan_risiko.md](05_milestone_dan_risiko.md) | F0–F8, dependensi, bukti selesai, risiko dan mitigasi |
| [06_rujukan.md](06_rujukan.md) | Sumber teori dan keterlacakan asumsi |
| [case_matrix.json](case_matrix.json) | Kontrak terstruktur 20 kasus; semua berstatus planned |
| [analytic_fixtures.json](analytic_fixtures.json) | Referensi analitis SI independen, bukan output FE |
| [prepare_f0.py](prepare_f0.py) | Generator spesifikasi data/fixture dan pemeriksaan kecocokan M0 |
| [check_f0.py](check_f0.py) | Pemeriksaan integritas paket tersimpan tanpa menulis ulang |
| [verification_f0.json](verification_f0.json) | Hasil pemeriksaan data F0, tidak menyatakan solver lulus |

## Pemetaan dan keputusan utama

- F2: **7 kasus balok** — 01-M/K,06-M/K,07-M/K,10-K. BEAM2 (elemen garis pada bidang 2D); PS2 sebagai pengayaan persegi panjang. Modul 06 Mesin/Kapal menjadi percontohan pertama.
- F3: **6 kasus axisymmetric** — 02-M/K,03-M/K,08-M/K. Tidak mengganti batang bulat dengan pelat plane stress. Termal adalah regangan awal, bukan simulasi perpindahan panas.
- F4: **3 kasus torsi** — 05-M/K,10-M. TOR2 memakai bentuk lemah warping dengan batas natural/gauge yang juga sah untuk penampang berlubang.
- F5: **2 kasus gabungan** — 09-M/K. Superposisi submodel pada titik dan sumbu yang sama; bukan solver solid 3D.
- F6: **2 kasus sambungan** — 04-M/K. FE pelat berlubang dengan traction tumpu ideal; pin, kontak dan clevis 3D tidak diselesaikan oleh model ini. τpin tetap analitis.

Angka material/geometri tambahan diberi asal `Asumsi tambahan F0 untuk FE`. Label elemen garis, solid 2D, axisymmetric, torsi penampang dan hasil superposisi wajib dibedakan pada UI. Tidak ada klaim kapasitas industri/SWL/aturan kelas.

## Pemeriksaan yang benar-benar dilakukan

```sh
python docs/fe/f0/prepare_f0.py
python docs/fe/f0/check_f0.py
```

PASS: tepat 20 ID dan dua konteks; cakupan 7+6+3+2+2; input M0 dipertahankan; asal semua tambahan eksplisit; rute rencana unik; **133/133 hasil analitis dihitung ulang dalam SI dan cocok dengan M0** (abs 1e−9 + rel 1e−6); status planned/reference_only. Pemeriksaan ini tidak menguji matriks, solver, mesh, browser atau konvergensi FE karena belum diimplementasikan.

## Saran langkah berikutnya

**F1 — Fondasi solver dan tampilan.** Mulai dari kernel murni, matriks elemen BEAM2 dan PS2 patch, perakitan/BC/reaksi, diagnostik, worker/cancel, serta viewer minimal. Luluskan kasus kecil dan invalid input sebelum membuat percontohan modul 06 pada F2a. Gunakan gerbang di dokumen 03; jangan mengaktifkan tombol publik FE sebelum implementasi dan pemeriksaannya siap.
