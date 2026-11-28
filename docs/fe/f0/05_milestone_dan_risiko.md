# F0 — Milestone, dependensi dan risiko

## Urutan pelaksanaan

| Tahap | Dependensi | Hasil konkret | Gerbang selesai |
| --- | --- | --- | --- |
| F0 | M8 rc.2 | Spesifikasi, 20 kontrak kasus, fixture analitis, tolok ukur, alur, rencana | Seluruh kasus terpetakan; tambahan data dan batas jelas; pemeriksaan paket F0 lulus |
| F1 | F0 | Kernel assembler/solver, BC, worker, diagnostik, viewer minimal; BEAM2 dan PS2 patch pada fixture kecil | Residual/reaksi/energi, patch, rigid modes, invalid/cancel, pembandingan solver kecil independen, benchmark cap DOF |
| F2a | F1 | Percontohan 06-M dan 06-K: FE balok, PS2 persegi panjang dan perbandingan | Toleransi target dan domain teruji; mesh CST vs T6 dijelaskan; pengalaman belajar dapat ditinjau |
| F2b | F2a | 01-M/K, 07-M/K, 10-K | Total 7 kasus; load at support, orientasi, profil beam dan kriteria alternatif benar |
| F3 | F1; pola UI F2a | AX2 02-M/K,03-M/K,08-M/K | Total 13 kasus; sumbu r=0, Poisson, thermal, bobot 2πr dan reaksi teruji |
| F4 | F1 | TOR2 05-M/K,10-M | Total 16 kasus; gauge, rongga, Jt/energi, arah dan geometri melengkung teruji |
| F5 | F2,F4 | COMB 09-M/K | Total 18 kasus; mapping tensor, tanda M/F, lokasi dan pemulihan tegangan benar |
| F6 | F1 PS2; UI F2a | Pelat berlubang 04-M/K, subrun tengah/luar | Total 20 kasus terpaut; Kirsch/benchmark independen pelat, nominal vs lokal, batas tanpa kontak jelas |
| F7 | Tiap keluarga sudah lulus | Konsistensi prediksi/latihan/refleksi, progres FE lokal, print/ekspor, glosarium | Hasil/session/konteks/aksesibilitas konsisten; tidak mengklaim rekap nilai kelas |
| F8 | F2–F7 | Audit lintas model, dokumentasi dan paket rilis | Semua fixture gerbang lulus; browser/ponsel/keyboard, performa, regression situs lama, baru tinjau publikasi |

Jadwal kalender/durasi belum ditetapkan; tidak menyatakan F1–F8 sudah mulai. Default branch pengembangan `feat/fem-f0` dari M8. Tidak merge ke main atau deploy pada F0. Keputusan rilis parsial kelak dapat diambil terpisah; milestone implementasi tidak otomatis menerbitkan semua model yang belum selesai.

## Risiko dan mitigasi

| Risiko | Dampak | Tindakan yang ditetapkan |
| --- | --- | --- |
| CST terlalu kaku pada lentur | Lendutan terlihat salah walau solver konvergen | T3 sebagai pembelajaran; T6 utama, patch dan benchmark lentur |
| Mesh axial sangat ramping/DOF besar | Halaman lambat atau solver ill-conditioned | Worker, cap, penskalaan, mesh berkualitas; fallback BEAM2 berlabel jika dipilih |
| '2D' dianggap solver solid semua komponen | Salah interpretasi frame/axisym/torsi | Label kernel dan bidang fisik wajib; tidak menggambar FE 3D palsu |
| Beban/tumpuan solid mengubah kasus pembanding | Galat model disalahartikan sebagai galat solver | BC/strip/centroid/ROI direkam; studi sensitivitas, pembandingan matched |
| Maximum stress singular atau hasil smoothing | Keputusan desain salah | Raw field tersedia, ROI tetap sebelum solve, peringatan singularitas, tanpa klaim kapasitas |
| Torsi cincin/gauge salah | J/τ/θ salah walau kontur menarik | Weak warping natural pada semua batas, gauge tepat; integral torque/energi/analitis |
| Tumpuan aksial menahan Poisson | Tegangan tiga arah palsu | ur bebas di end face; hanya uz ditahan; AX-PATCH dan AX-LOAD |
| Kontak pin dipersepsikan tersedia | Geser pin/SWL dianggap dihitung FE | Submodel pelat saja; τpin tetap analitis; kontak dan clevis 3D dikeluarkan |
| Field A/B tercampur | Von Mises/faktor keamanan salah | Koordinat/sumbu yang sama, tensor superposition; uji pergantian titik kritis |
| Hasil lama muncul setelah input berubah | Angka tak sesuai kasus | runId/hash, invalidasi hasil, cancel dan stale-response tests |
| Preset tambahan dianggap data industri/RPS | Sumber data keliru | additional_input_origin per field; label data latihan |
| Tes analitis dianggap validasi FE | Kelulusan palsu | Status planned/reference_only pada F0; kelulusan solver dipisahkan |

## Keputusan yang telah diambil dan yang belum

Sudah ditetapkan pada F0: mapping 7/6/3/2/2, formulasi/tanda/BC, tambahan preset, tipe elemen, bentuk UI, cap awal untuk benchmark, toleransi gerbang dan daftar fixture. Tidak diperlukan data RPS tambahan untuk mulai F1; semua tambahan diberi status asumsi latihan.

Sebelum F6 mengklaim tegangan lokal pelat terverifikasi, pengembang harus membekukan berkas/versi solusi pembanding independen sebagaimana kontrak PIN-PLATE. Ini tugas validasi F6, bukan alasan menunda F1. Batas performa awal akan diuji dan dicatat pada F1; hasilnya dapat mengubah cap mesh secara transparan. Penggunaan logo resmi, rekap LMS dan akun tetap di luar lingkup FE ini.
