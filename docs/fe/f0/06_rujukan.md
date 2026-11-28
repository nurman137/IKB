# F0 — Rujukan dan keterlacakan

Diperiksa 27 November 2026. Rujukan mendukung teori; pilihan lingkup, toleransi, cap mesh dan batas pedagogis adalah keputusan proyek, bukan kutipan standar. Rumus, teks dan diagram implementasi akan ditulis sendiri; tidak menyalin solver/ilustrasi vendor. Pemakaian library kelak memerlukan pemeriksaan lisensi pada F1.

| Sumber | Pemakaian |
| --- | --- |
| [University of Alberta — Triangular Elements](https://engcourses-uofa.ca/books/introduction-to-solid-mechanics/finite-element-analysis/two-dimensional-solid-elements/triangular-elements/) | Interpolasi T3/T6, strain-displacement, Ke dan integrasi; mendasari beda akurasi elemen |
| [University of Alberta — Examples and Problems](https://engcourses-uofa.ca/books/introduction-to-solid-mechanics/finite-element-analysis/examples-and-problems/) | Contoh sensitivitas lentur terhadap formulasi elemen dan mesh; alasan tidak mengklaim CST kasar akurat |
| [University of Alberta — Euler Bernoulli Beam](https://engcourses-uofa.ca/books/introduction-to-solid-mechanics/plane-beam-approximations/euler-bernoulli-beam/) | Kinematika balok dan hubungan momen-kelengkungan |
| [COMSOL — Solid Mechanics](https://doc.comsol.com/6.4/doc/com.comsol.help.sme/sme_ug_modeling.05.016.html) | Batas plane stress, bidang beban dan arti axisymmetric, beban total lingkaran |
| [COMSOL — Axial Symmetry](https://doc.comsol.com/6.3/doc/com.comsol.help.sme/sme_ug_theory.06.013.html) | Perpindahan radial/aksial dan perlunya komponen keliling untuk torsi; AX2 tidak otomatis memuat torsi |
| [COMSOL — Axisymmetric Twist and Bending](https://doc.comsol.com/6.4/doc/com.comsol.help.models.sme.axisymmetric_twist_and_bending/axisymmetric_twist_and_bending.html) | Menunjukkan formulasi lanjut dibutuhkan untuk medan poros; tidak menjadi dependensi runtime atau klaim solver web setara vendor |
| [Jönköping University — Stress Concentration](https://mechanics.ju.se/SolidMechanics/StressConcentration.html) | Persoalan Kirsch dan batas ideal pelat berlubang; tolok ukur terpisah dari kontak pin |
| [MIT — Roylance, Shear and Torsion](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/0e0845a9e3abe430080eaffb0c5015ba_MIT3_11F99_torsion.pdf) | Pembanding poros lingkaran/cincin, G/J/τ/θ; bentuk lemah TOR2 di dokumen model diturunkan dari energi geser |
| [MIT — Roylance, Beam Displacements](https://ocw.mit.edu/courses/3-11-mechanics-of-materials-fall-1999/13534abb67b86d2fb8ee11a1f4f2b8c4_MIT3_11F99_bdisp.pdf) | Pembanding balok; hasil solid berbeda idealisasi tidak dipaksa persis teori balok |

Baseline lokal: `docs/m0/reference_cases.json` dan register 20 kasus, dengan SHA-256 yang disimpan pada case_matrix.json. Nilai analitis independen dihasilkan prepare_f0.py dalam SI, tidak memanggil model JavaScript situs. Paket ini tidak menyatakan standar, grade material, data kapal nyata, atau hasil perhitungan FE.
