# M0 — Spesifikasi Pembelajaran Situs IKB

Versi: 0.1 · Tanggal: 27 November 2026 (WIB)

Status: M0 selesai disusun sebagai baseline pengembangan; belum ada aplikasi, publikasi situs, atau pengujian aplikasi. Dokumen ini bukan pengganti RPS resmi.

## 1. Keputusan dasar

- Nama kerja: **IKB — Laboratorium Kekuatan Bahan**, Politeknik Negeri Batam.
- Sasaran: mahasiswa rumpun Teknik Mesin dan Teknologi Rekayasa Konstruksi Perkapalan. Identitas kode/semester pada RPS yang ditemukan hanya berlaku bagi prodi yang tercantum di RPS tersebut.
- Acuan pengalaman belajar: https://pengenalan-material.sleekdune.chatgpt.site/ . Adaptasi navigasi modul, tampilan terang, eksplorasi, prediksi, pembacaan bukti, serta progres perangkat.
- Setiap modul menyediakan pasangan **Kasus Mesin** dan **Kasus Kapal**, dengan tombol **Contoh Perhitungan** menuju halaman tersendiri.
- Angka masukan dapat diedit; persamaan, substitusi, hasil, penjelasan, dan visual terkait harus mengikuti input yang sama.
- Source code dan dokumentasi: https://github.com/nurman137/IKB . M0 hanya menambahkan dokumentasi serta data acuan.
- Versi awal memakai model analitis. Animasi tidak boleh ditampilkan sebagai hasil analisis elemen hingga (FEA).
- Data kasus dan sifat material default adalah **asumsi latihan**. Bukan hasil pengujian material, data kapal tertentu, atau nilai minimum suatu standar.
- Identitas dan logo institusi pada mockup harus diperbaiki menjadi Polibatam; penggunaan aset logo resmi menunggu aset yang sah. Teks identitas cukup untuk prototipe.

## 2. Dasar RPS dan penanganan ketidakkonsistenan

Sumber internal yang telah dibaca: `RPS IKB No.FO.6.1.2-V4 Format Rencana Pembelajaran Semester (RPS) (2).pdf`, 11 halaman; identitas KP 401, Ilmu Kekuatan Bahan, prodi Teknologi Rekayasa Konstruksi Perkapalan, semester 3. Tanggal 25 Oktober 2021 pada dokumen adalah tanggal format; tahun ajaran belum diisi.

| Temuan pada RPS | Keputusan desain situs M0 |
| --- | --- |
| Identitas awal 3 SKS (1 teori + 2 praktikum), bagian penilaian menyebut 2 teori + 1 praktik | Tidak menetapkan ulang SKS/jam; pembagian resmi memerlukan keputusan akademik di luar pekerjaan situs |
| Indikator beberapa pertemuan membahas gerak, fluida, gelombang, dan kelistrikan | Tidak disalin sebagai indikator IKB; gunakan tujuan situs pada bagian 3 |
| Bending dan kombinasi beban disebut dalam deskripsi, belum rinci dalam jadwal | Sediakan modul 06 dan 09; ini pengorganisasian situs, bukan revisi RPS resmi |
| Konsep energi serta pengantar kegagalan disebut dalam deskripsi | Energi regangan elastis U = Fδ/2 diperkenalkan di 03; kegagalan/yield dan interpretasi awal pada 09–10. Analisis kegagalan komprehensif belum menjadi kalkulator tersendiri |
| CPMK menyebut beam, frame, dan sambungan | Cakup beam pada 06–07, pin pada 04, komponen/rangka idealisasi pada 10; penyelesaian frame lengkap disertai latihan SolidWorks, bukan solver frame otomatis versi awal |
| Tugas desain pipa, padeye, dan PBL kapal cepat tak berawak | Pipa aksial/termal pada 08, pin/padeye awal pada 04, komponen kapal pada 10; bukan desain lengkap kapal |
| UAS disebut sertifikasi CSWA; bobot penilaian dan jadwal 18 pertemuan memerlukan telaah | Situs tidak menganggap CSWA sebagai sertifikasi analisis kekuatan dan tidak mengubah UTS/UAS, jadwal, atau bobot resmi |

## 3. Pemetaan CPMK sumber dan tujuan belajar situs

Label C1–C5 di bawah hanya indeks urutan lima CPMK pada RPS, bukan nomor CPL baru. Uraian diringkas. Tujuan situs diberi label TS untuk membedakannya dari keputusan akademik resmi.

| CPMK pada RPS | Tujuan terukur situs | Modul pengampu | Bukti belajar |
| --- | --- | --- | --- |
| C1: menjelaskan tegangan, regangan, sifat mekanik | TS1: mengidentifikasi jenis beban dan menggambar diagram benda bebas; TS2: menjelaskan perbedaan tegangan, regangan, kekuatan, dan kekakuan | 01–04 | Diagram/label benar, prediksi beralasan, interpretasi grafik |
| C2: menghitung tegangan-regangan, Hooke, keamanan, deformasi aksial, torsi | TS3: memilih model dan menghitung dengan satuan konsisten; TS4: menilai pengaruh dimensi, material, temperatur, serta kombinasi beban | 02–09 | Urutan hitungan, hasil, alasan pemilihan model, perbandingan parameter |
| C3: menggunakan simulasi komputer untuk perhitungan tersebut | TS5: membandingkan hasil analitis dengan simulasi dan menjelaskan sumber selisih | 02–10 | Ringkasan eksperimen; perbandingan dengan SolidWorks untuk geometri sederhana yang sepadan |
| C4: mengenal profil beam dan frame | TS6: menghitung properti penampang dan memilih orientasi untuk arah lentur tertentu | 06–07, 10 | A, I, c, Z dan rekomendasi orientasi yang dijelaskan |
| C5: mendesain sambungan beam/frame dan menghitung dengan simulasi | TS7: menyusun evaluasi awal komponen/sambungan dengan kriteria eksplisit, keterbatasan, serta usulan verifikasi lanjutan | 04, 09–10 | Alternatif desain, pemeriksaan kriteria, alasan dan batas kesimpulan |

## 4. Struktur 10 modul

| ID | Modul dan prasyarat | Hasil belajar yang dapat diamati | Interaksi/visual | Contoh hitungan dan bukti asesmen |
| --- | --- | --- | --- | --- |
| 01 | Membaca Beban; prasyarat Mekanika Teknik dasar | Menamai tarik/tekan/geser/lentur/torsi; memisahkan beban luar, reaksi, dan gaya dalam | Diagram benda bebas, sendi–rol, potongan, panah dan arah sumbu | Reaksi balok dengan beban titik eksentris; mahasiswa menjelaskan keseimbangan dan lokasi momen maksimum |
| 02 | Tegangan–Regangan; 01 | Menghitung σ, ε, δ; membedakan satuan tegangan dan regangan | Batang tarik, luas penampang, panjang awal/akhir, grafik elastis | Batang aksial Mesin/Kapal; prediksi saat F atau d diubah dan satu hitungan mandiri |
| 03 | Elastisitas dan Hukum Hooke; 02 | Membandingkan E, k, kekuatan; menghitung kontraksi lateral serta energi elastis | Dua batang A–B, pelepasan beban elastis, perubahan diameter diperbesar | Hitung k, ε lateral, δ dan U; jelaskan mengapa mengubah E pada batang statis tertentu mengubah δ tetapi bukan σ nominal |
| 04 | Geser dan Sambungan; 01–03 | Menentukan jumlah bidang geser dan memisahkan tegangan geser pin dari tegangan tumpu pelat | Sambungan pin tunggal/ganda; bidang potong dan luas proyeksi | Pin mekanisme dan pin clevis/padeye ideal; mahasiswa menggambar bidang geser dan membedakan hasil pin/pelat |
| 05 | Torsi dan Poros; 03 | Menghitung J, τ, θ dan menghubungkan daya–kecepatan–torsi | Poros melingkar pejal/berongga; garis acuan puntiran, distribusi τ(r) | Poros transmisi dan poros propeler; hitungan torsi langsung dan mode daya–rpm dengan sumber input tunggal |
| 06 | Lentur Balok; 01–03 | Menghitung reaksi, V(x), M(x), tegangan lentur dan lendutan | Balok sendi–rol; diagram V/M, bentuk lendutan dan penampang | Beban titik di tengah dan beban merata penuh sebagai konfigurasi terpisah; alasan tanda diagram dan posisi serat kritis |
| 07 | Bentuk Penampang; 06 | Menghitung A, centroid, I dan Z; membandingkan orientasi secara adil | Persegi panjang diputar, pipa, profil I/T/L ideal tanpa fillet | Mesin/Kapal: rotasi persegi panjang berluas sama; profil tak simetris memakai centroid dan Z atas/bawah, bukan bh³/12 secara langsung |
| 08 | Pengaruh Temperatur; 03 | Membedakan pemuaian bebas dari tegangan akibat pengekangan | Pipa lurus bebas/mengunci kedua ujung, ΔT positif/negatif | Pipa instalasi mesin dan kamar mesin; hitung δ bebas dan σ/reaction terkekang, tanpa tekanan internal |
| 09 | Beban Gabungan dan Keamanan; 04–06 | Menggabungkan komponen tegangan pada titik yang sama dan mengevaluasi luluh material ulet | Potongan poros dan dua titik permukaan; indikator kriteria dan batas model | Mesin: lentur+torsi; Kapal: aksial+torsi; von Mises, tegangan utama sebagai penjelasan tambahan, n luluh |
| 10 | Studio Desain; 01–09 sesuai kasus | Membandingkan alternatif berdasarkan syarat eksplisit dan menyampaikan batas keputusan | Dua rancangan berdampingan, ringkasan massa/tegangan/deformasi, lembar kerja | Mesin: poros pejal–berongga diameter luar sama; Kapal: orientasi balok geladak; rekomendasi beralasan dan rencana pembandingan SolidWorks |

Urutan belajar dasar: 01 → 02 → 03; 04 dan 05 dapat dipelajari setelah 03; 06 → 07; 08 setelah 03; 09 setelah 05–06; 10 setelah modul terkait. Semua modul dapat dibuka ulang tanpa penguncian wajib.

## 5. Pola pengalaman belajar

1. Kasus kontekstual dengan diagram dan pertanyaan, tanpa langsung menampilkan hasil akhir.
2. Prediksi dan alasan singkat sebelum eksperimen. Jawaban prediksi tidak mengunci eksplorasi.
3. Eksplorasi satu parameter dan perbandingan A–B; selalu jelaskan parameter yang dipertahankan.
4. Penjelasan bertahap: hubungan fisik → simbol/satuan → persamaan → pembacaan hasil.
5. Tombol **Contoh Perhitungan**: halaman baru dalam tab yang sama, dengan tombol kembali ke modul dan konteks Mesin/Kapal yang dipertahankan. Pengguna tetap dapat membuka tab lain melalui perilaku tautan standar.
6. Latihan mandiri: satu soal konsep dan satu soal hitungan per konteks minimal, ditambah refleksi. Umpan balik menunjukkan alasan, bukan hanya benar/salah.
7. Ringkasan eksperimen dan refleksi, dengan cetak/export sederhana direncanakan pada M7.

## 6. Asesmen dan progres

- Target minimal per modul: dua prediksi (satu per konteks), dua latihan hitungan, dan satu refleksi perbandingan. Pada 10, latihan berupa evaluasi rancangan.
- Rubrik formatif: identifikasi beban/model; penggunaan data/satuan; langkah dan hasil; interpretasi/batas model. Masing-masing diberi umpan balik **perlu diperbaiki / memadai / kuat**, tanpa mengklaim bobot RPS.
- Status progres: belum mulai, sedang dipelajari, latihan selesai. Membuka halaman saja tidak menandai latihan selesai.
- Input yang sudah diperlihatkan jawabannya tidak dihitung sebagai bukti kemampuan hitung mandiri. Latihan mandiri memakai input berbeda dan solusi yang dapat dibuka setelah mencoba.
- Data tersimpan lokal pada perangkat. Belum ada akun, rekap kelas, integrasi LMS, atau penilaian resmi.
- Keberhasilan awal dinilai dari kemampuan menjelaskan perubahan hasil, bukan banyaknya klik atau lamanya berada di halaman.

## 7. Batas cakupan versi awal

- Balok analitis Euler–Bernoulli dengan geometri dan pembebanan yang disediakan. Portal/frame penuh, pelat, shell lambung dan buckling bukan solver aktif versi awal.
- Material homogen isotropik elastis linier; input yang melampaui luluh menghasilkan status **di luar asumsi elastis**, bukan animasi plastis yang seolah dihitung.
- Tekuk, fatigue, impact, getaran, korosi, sambungan las terperinci, konsentrasi tegangan, warping profil nonmelingkar dan aturan klasifikasi kapal perlu analisis lanjutan; tidak disimpulkan telah lolos oleh kalkulator.
- Perbandingan n terhadap target hanya diberi label **memenuhi kriteria latihan untuk model ini**. Nilai n tidak membuktikan kelayakan komponen nyata.
- Studio padeye hanya evaluasi awal terpisah untuk pin, tumpu, dan penampang sederhana; tidak diberi kapasitas angkat/SWL atau klaim sertifikasi.

## 8. Sumber dan status bukti

- **Fakta dokumen:** identitas, lima CPMK, cakupan dan inkonsistensi berasal dari RPS internal yang telah dibaca. Berkas lengkap RPS dan identitas personal pengampu tidak disalin ke repositori publik.
- **Usulan desain:** TS1–TS7, 10 modul, dua konteks kasus, pola asesmen, urutan situs, dan batas versi awal adalah keputusan M0 untuk pengembangan situs.
- **Asumsi latihan:** seluruh nilai default, properti material, target faktor keamanan dan batas lendutan. Tidak diklaim sebagai data industri atau persyaratan standar.
- **Referensi pendukung terverifikasi 27 November 2026:** [MIT OCW, Mechanics & Materials I, lecture notes](https://ocw.mit.edu/courses/2-001-mechanics-materials-i-fall-2006/pages/lecture-notes/) sebagai peta rujukan topik; [David Roylance, Shear and Torsion, MIT](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf) untuk model geser/torsi.
- Buku yang tercantum pada RPS mencakup Hibbeler, Beer, Timoshenko, Shigley, dan Lee. Isi/nomor halaman buku tersebut belum diverifikasi pada M0; tidak mengarang kutipan atau menyalin gambarnya. Sebelum publikasi, setiap panel sumber modul harus memiliki rujukan bab/halaman atau tautan materi yang benar-benar diperiksa.

## 9. Kriteria M0 selesai

- [x] Sepuluh modul memiliki tujuan, prasyarat, interaksi, dan bukti belajar.
- [x] Lima CPMK sumber dipetakan tanpa menyatakan revisi akademik resmi.
- [x] Dua puluh kasus dasar Mesin–Kapal memiliki input, model dan hasil acuan.
- [x] Halaman contoh perhitungan memiliki spesifikasi perilaku serta batas input.
- [x] Asumsi, batas fisik, ketidakkonsistenan RPS, dan kriteria verifikasi tercatat.
- [x] Milestone lanjutan serta hasil yang perlu ditinjau ditetapkan.
- [ ] Pengembangan aplikasi: baru dimulai pada M1, di luar penyelesaian M0.
