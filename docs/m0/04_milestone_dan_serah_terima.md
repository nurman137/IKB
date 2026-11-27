# Milestone dan Serah Terima M0

Versi 0.1 · 27 November 2026 (WIB)

## 1. Status pekerjaan

**M0 selesai sebagai paket spesifikasi pengembangan. M1–M8 belum dimulai.** Belum ada source code aplikasi, situs aktif, atau deployment. Dataset JSON merupakan data acuan perhitungan, bukan aplikasi.

| Milestone | Lingkup final | Bukti selesai |
| --- | --- | --- |
| M0 — Spesifikasi pembelajaran | Pemetaan RPS/CPMK, 10 modul, 20 kasus Mesin–Kapal, halaman hitungan, model/batas, validasi | Empat dokumen M0, data acuan numerik, dan ringkasan verifikasi |
| M1 — Fondasi situs dan desain | Struktur proyek, identitas Polibatam, beranda, navigasi, templat modul dan halaman hitungan, rute Mesin/Kapal, tampilan laptop/ponsel | Beranda dan templat dapat dinavigasi; tautan langsung perhitungan dapat dimuat ulang; belum mengklaim 10 modul sudah selesai |
| M2 — Modul percontohan | 02 Tegangan–Regangan lengkap, dua konteks, input variabel, solusi bertahap, prediksi, simulasi elastis, latihan dan umpan balik | Dua kasus 02 sesuai dataset; reset/kembali/invalid input berfungsi; hasil ditinjau sebagai standar modul berikutnya |
| M3 — Dasar dan sambungan | 01, 03, 04 termasuk dua kasus per modul, energi elastis dan pin tunggal/ganda | Nilai acuan dasar dan fixture pengayaan lulus; materi dan geometri pin konsisten |
| M4 — Torsi, lentur, penampang | 05, 06, 07; input daya–rpm; beban titik/merata; properti profil | Rumus, diagram, batas konfigurasi dan fixture tambahan lulus; perbandingan orientasi mempunyai basis yang eksplisit |
| M5 — Temperatur dan kombinasi | 08, 09; kondisi bebas/terkekang; tegangan pada titik sama; n luluh | Tanda termal, pembacaan titik tegangan, validitas elastis dan status kriteria benar |
| M6 — Studio desain | 10; poros Mesin, balok Kapal, ringkasan rancangan dan pendamping SolidWorks | Dua alternatif per konteks, interpretasi kekuatan/deformasi/massa, dan keterbatasan jelas |
| M7 — Fitur pembelajaran terpadu | Progres perangkat, mode presentasi, glosarium, cetak ringkasan, bandingkan yang relevan | Fitur benar-benar menyimpan/menampilkan hasil aktif; tidak mengklaim rekap nilai kelas |
| M8 — Validasi dan persiapan rilis | Verifikasi seluruh model, interaksi, aksesibilitas, performa, dokumentasi, kesiapan hosting | Semua pemeriksaan relevan lulus, isu utama ditutup, sumber per modul dilengkapi; versi siap ditinjau sebelum publikasi |

Jadwal kalender belum ditetapkan. Durasi tidak diasumsikan. Setiap milestone menghasilkan perubahan yang dapat ditinjau melalui repository.

## 2. Paket hasil M0

1. `01_spesifikasi_pembelajaran.md`: keputusan, dasar RPS, pemetaan tujuan, struktur modul, asesmen dan batas cakupan.
2. `02_register_kasus.md`: 20 kasus dengan konteks, input, model, hasil acuan dan pertanyaan eksplorasi.
3. `03_perhitungan_dan_validasi.md`: kontrak halaman perhitungan, rute, validasi input serta rencana verifikasi.
4. Dokumen ini: milestone, status, hasil pemeriksaan M0 dan saran tindak lanjut.
5. `reference_cases.json`: data acuan tidak dibulatkan bagi implementasi berikutnya.

## 3. Verifikasi paket M0

PASS: 20 kasus, 133 keluaran numerik cocok melalui rumus ekuivalen berbasis SI; toleransi abs 1e-9 + rel 1e-6. Ini pemeriksaan aritmetika dataset M0, bukan uji aplikasi.

Pemeriksaan juga memastikan terdapat tepat satu pasangan Mesin–Kapal untuk masing-masing dari 10 modul. Seluruh masukan default, tujuan dan batas model ditelaah terhadap definisi kasus. Pemeriksaan fungsi tambahan (energi, mode daya–rpm, beban merata, profil lanjutan) dijadwalkan pada milestone implementasinya; belum dinyatakan lulus.

## 4. Keputusan yang sudah ditetapkan

- Struktur 10 modul tetap sebagai baseline, dengan pasangan konteks Mesin dan Kapal pada setiap modul.
- Halaman perhitungan mempunyai URL tersendiri dalam tab yang sama secara default; tombol kembali mempertahankan konteks.
- Fokus pertama pada model elastis analitis yang dapat diperiksa; tidak membangun solver FEA/frame/shell pada versi awal.
- Nilai sifat material default dan kriteria desain diberi label data latihan.
- Tidak memaksakan pembagian SKS, bobot nilai, atau jadwal baru dari situs.
- Tidak diperlukan klarifikasi tambahan untuk memulai fondasi M1.

## 5. Hal yang dapat diputuskan kemudian

- Nama domain publik dan pengaturan akses ditentukan menjelang publikasi.
- Kode/semester IKB prodi Mesin disesuaikan jika RPS prodi tersebut tersedia; konsep mekanika tetap dapat dibangun sekarang.
- Aset logo resmi dapat ditambahkan ketika tersedia; fondasi memakai teks Polibatam.
- Fitur akun, sinkronisasi antarperangkat, rekap dosen dan LMS menjadi lingkup terpisah jika kelak diminta.

## 6. Saran langkah berikutnya

**Lanjutkan M1 — Fondasi situs dan desain.** Bangun beranda dengan identitas Polibatam, navigasi 10 modul, templat halaman modul, dan dua halaman contoh perhitungan Mesin/Kapal. Halaman yang belum berfungsi harus diberi status yang jujur. M1 menyiapkan struktur; penyelesaian fungsi dan materi modul 02 dilakukan pada M2.

Setelah M1, lanjutkan M2 sebagai titik tinjauan utama: satu modul lengkap lebih dahulu untuk memeriksa apakah pola simulasi, hitungan bertahap dan umpan balik sudah sesuai sebelum diperluas.
