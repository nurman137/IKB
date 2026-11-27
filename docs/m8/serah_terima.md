# M8 — Validasi dan Persiapan Rilis

Tanggal: 27 November 2026 (WIB). Status: **M8 selesai — versi `1.0.0-rc.1` siap ditinjau sebelum publikasi.** Situs belum dipublikasikan; keputusan domain, akses dan waktu publikasi tetap di tangan pengelola (lihat bagian keputusan terbuka).

## Ringkasan hasil validasi

| Area | Hasil |
| --- | --- |
| Model numerik | **Gerbang rilis lulus:** 20 kasus M0, **133 dari 133** keluaran direproduksi oleh model situs (toleransi abs 1e-9 + rel 1e-6), semua di dalam domain model. Tambahan fixture independen (daya–rpm, berongga, beban merata, profil I/T/pipa, termal, gabungan, desain, 20 latihan) lulus. |
| Tes otomatis | **71 kelompok tes lulus** (`npm test`, kini membangun `dist/` lebih dahulu sehingga lulus dari checkout bersih). |
| Interaksi | Skrip browser Chromium/Playwright untuk modul 05–10 dan fitur M7: input, satuan, mode, tombol eksperimen, reset, lepas beban, reload, prediksi, latihan, pembahasan. 0 error konsol. Modul 01–04 diperiksa tampil dan berfungsi. |
| Aksesibilitas | Audit otomatis axe-core 4.10 (WCAG 2.0/2.1 A dan AA + best practice) pada 25 rute × 2 lebar layar = 50 tampilan, dengan semua `<details>` dibuka: **0 pelanggaran**. Uji keyboard: skip link sebagai Tab pertama, fokus terlihat pada semua elemen terfokus, `<summary>` dapat dibuka dengan Enter. |
| Kontras | Audit awal menemukan 26 warna teks dengan kontras < 4,5:1 (warisan palet M1). Semua digelapkan dengan rona sama hingga ≥ 4,6:1 terhadap latar tergelap; tombol utama digelapkan ke #b04f2a. |
| Responsif | 320, 390 dan 1366 px tanpa scroll horizontal pada semua halaman yang diuji. |
| Performa | Aset 428 KiB tanpa kompresi (JS ±119 KiB gzip), tanpa dependensi atau skrip eksternal; muat halaman lokal ±0,6 s. Satu bundel modul ES dimuat untuk semua halaman; pemisahan per modul dapat dipertimbangkan bila modul bertambah. |
| Hosting | 34 rute + 404 sebagai berkas statis; kunjungan langsung/reload berfungsi tanpa aturan SPA. Diuji di akar (`/`) dan subdirektori (`/IKB/`): 24 halaman tertaut dirayapi tanpa tautan rusak; 404 di URL bertingkat tampil benar. |
| Rujukan | 12 dokumen rujukan diperiksa dapat diakses (HTTP 200). Modul 05–10 kini merujuk kuliah spesifik MIT OCW 2.001 (isi PDF dicek dengan `pdftotext`), bukan hanya halaman kursus. |

## Perbaikan yang dihasilkan validasi M8

1. **404 di URL bertingkat rusak di hosting statis.** `404.html` memakai jalur aset relatif, sehingga di `/modul/99/` aset dicari di `/modul/99/assets/`. Kini memakai jalur absolut dengan `IKB_BASE` (default `/`). Server dev juga menyajikan `404.html` untuk jalur tak dikenal seperti hosting sungguhan.
2. **Kontras warna** (lihat tabel).
3. **Keterangan hero bertumpuk** dengan catatan ilustrasi pada layar lebar (cacat M1).
4. **Rujukan umum** pada modul 06–10 diganti kuliah spesifik; gerbang rilis menolak tautan yang hanya ke halaman kursus.
5. **`npm test` dari checkout bersih** sebelumnya gagal karena `dist/` belum dibangun.

## Panduan publikasi (belum dijalankan)

```sh
npm test                         # build + seluruh tes; harus lulus
npm run build                    # situs di akar domain
IKB_BASE=/IKB/ npm run build     # bila disajikan di subdirektori, mis. GitHub Pages proyek
```

- Unggah isi `dist/` apa adanya ke hosting statis apa pun (GitHub Pages, Netlify, server kampus). Tidak perlu server aplikasi, basis data atau aturan rewrite.
- `IKB_BASE` hanya memengaruhi `404.html`; halaman lain memakai jalur relatif dan bekerja di akar maupun subdirektori.
- Konfigurasikan hosting agar jalur tak dikenal menyajikan `404.html` (bawaan GitHub Pages dan Netlify).
- Disarankan: kompresi gzip/brotli, `Cache-Control` pendek untuk `*.html` dan `assets/cases.json`, HTTPS.
- Situs tidak memakai cookie, analitik atau layanan pihak ketiga; tidak memerlukan pemberitahuan cookie.

## Daftar periksa sebelum publikasi

- [x] Semua model dan 133 keluaran M0 lulus; tes otomatis lulus dari checkout bersih.
- [x] Audit aksesibilitas otomatis 0 pelanggaran; uji keyboard dasar lulus.
- [x] Hosting statis di akar dan subdirektori; 404 bertingkat.
- [x] Rujukan per modul spesifik dan dapat diakses.
- [x] Setiap halaman menyatakan data latihan, model ideal dan batas kesimpulan; tidak ada label "aman".
- [ ] **Tinjauan dosen pengampu** atas isi, istilah, preset latihan baru dan kriteria latihan (n ≥ 2, θ ≤ 2°, δ ≤ L/1000).
- [ ] Uji pada perangkat fisik (ponsel Android/iOS, proyektor kelas) dan pembaca layar sungguhan (NVDA/VoiceOver). Audit otomatis tidak menggantikannya.
- [ ] Keputusan domain, akses (publik/terbatas) dan aset logo resmi Polibatam.
- [ ] Penyesuaian kode/semester IKB untuk prodi Teknik Mesin bila RPS tersedia.

## Keputusan terbuka (di luar wewenang pengembangan)

- Nama domain publik dan pengaturan akses.
- Penggunaan logo resmi; saat ini identitas memakai teks dan tanda kubus laboratorium.
- Kebutuhan akun, sinkronisasi, rekap dosen atau integrasi LMS, yang merupakan lingkup terpisah.

## Keterbatasan yang diketahui

- Model analitis ideal; tidak ada FEA. Batas tiap modul dinyatakan di halaman masing-masing.
- Preset latihan di luar data M0 (daya–rpm, beban merata, profil I/T/pipa, aluminium, ρ Kapal, 20 latihan) dihitung dengan pembanding Python independen tetapi belum ditinjau dosen.
- Modul 01–06 memakai tampilan masing-masing; modul 07–10 memakai kerangka laboratorium bersama. Perilaku pengguna setara, tetapi penyatuan kode dapat menyederhanakan pemeliharaan.
- Rumus lendutan standar balok sederhana (PL³/48EI, 5wL⁴/384EI) diturunkan dari hubungan momen–kelengkungan pada rujukan; rujukan tidak dikutip per rumus.
