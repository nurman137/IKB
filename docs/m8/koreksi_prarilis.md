# Koreksi prarilis — 1.0.0-rc.2

27 November 2026 (WIB). Baseline: branch M4–M8 pada ef205a3.

- Modul 06/07/10: regangan nominal |σ|/E ≤ 1% dan lendutan nominal |δ|/L ≤ 2% menjadi batas pembelajaran tambahan. Batas ini bukan standar desain. Jika terlampaui, deformasi disembunyikan dan alternatif desain tersebut tidak dapat direkomendasikan. Tegangan nominal/statika tetap diberi batas interpretasi model ideal.
- Modul 08: keterangan panah menyebut gaya tumpuan pada pipa: menekan saat dipanaskan dan menarik saat didinginkan. Gaya pipa pada tumpuan berlawanan arah. Rumus termal tetap.
- Progres: ketuntasan memerlukan prediksi dijawab dan latihan 2/2 pada konteks yang sama. Tidak menggabungkan prediksi Mesin dengan latihan Kapal.
- Nilai preset M0 dan rumus dasarnya tetap.

Validasi: 75 kelompok tes lulus, termasuk 133/133 keluaran acuan M0. Tes regresi mereproduksi kasus E=100 MPa yang sebelumnya memberi δ=651,04 mm pada L=1500 mm; kini berada di luar domain dan tidak menampilkan deformasi atau rekomendasi berbasis deformasi tersebut. Batas inklusif, beban nol, keterangan termal dan ketuntasan per konteks diperiksa.

Keterbatasan: uji perangkat fisik, proyektor dan pembaca layar perlu dilakukan pengampu. Ini bukan audit desain komponen industri.
