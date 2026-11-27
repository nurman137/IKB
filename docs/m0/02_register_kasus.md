# M0 — Register 20 Kasus Mesin dan Kapal

Versi 0.1 · 27 November 2026 (WIB)

Semua angka adalah **data latihan sintetis**, bukan pengukuran atau persyaratan industri. M berarti Mesin, K berarti Kapal. Nilai acuan merupakan hitungan analitis M0, belum hasil uji aplikasi. Default material memakai E=200.000 MPa dan ν=0,30 bila relevan; jangan memberi nama grade material nyata pada data generik ini.

## Konvensi bersama

- Satuan inti N–mm–MPa: 1 MPa = 1 N/mm²; 1 N·m = 1.000 N·mm; E dalam GPa dikalikan 1.000. Massa menggunakan m³: 1 mm³ = 10⁻⁹ m³.
- Tarik positif, tekan negatif; σtermal negatif untuk kenaikan temperatur saat kedua ujung ditahan. θ dihitung radian dan dapat ditampilkan derajat.
- Beban P/F dalam JSON berakhiran `_N` berarti gaya; daya listrik/mekanik menggunakan label `power_W` pada implementasi agar tidak rancu.
- V positif pada potongan sisi kiri sesuai konvensi yang digambar; momen positif sagging. Diagram dan persamaan wajib memakai konvensi yang sama.
- Default beban statis, geometri ideal, material elastis linier. Sifat Sy=250 MPa, target n=2, batas θ dan lendutan hanyalah asumsi kasus yang ditampilkan eksplisit.
- Kode field JSON memuat satuannya. Data lengkap yang tidak dibulatkan tersedia di `reference_cases.json`.

## 01 — Batang penyangga alat produksi / Balok geladak penyangga peralatan

**Pemetaan:** C1 → TS1.

**Idealisasi:** Balok ideal sendi–rol; satu beban titik berjarak a dari tumpuan kiri, berat sendiri diabaikan.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → ΣFy=0; ΣMA=0; RB=Fa/L; RA=F−RB; M(a)=Fa(L−a)/L. → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Saat beban bergeser mendekati kiri, reaksi mana membesar?

### Kasus 01-M — Batang penyangga alat produksi

| Input | Nilai default |
| --- | --- |
| P_N | 10000 |
| L_mm | 1200 |
| a_mm | 400 |

| Keluaran acuan | Nilai |
| --- | --- |
| RA_N | 6666.66667 |
| RB_N | 3333.33333 |
| M_at_load_Nmm | 2666666.67 |

### Kasus 01-K — Balok geladak penyangga peralatan

| Input | Nilai default |
| --- | --- |
| P_N | 20000 |
| L_mm | 2000 |
| a_mm | 800 |

| Keluaran acuan | Nilai |
| --- | --- |
| RA_N | 12000 |
| RB_N | 8000 |
| M_at_load_Nmm | 9600000 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 02 — Batang pengikat mesin / Tie rod struktur kapal

**Pemetaan:** C1/C2 → TS2–TS3.

**Idealisasi:** Batang lingkaran seragam, beban tarik sentris, deformasi kecil, ujung bebas berkontraksi lateral.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → A=πd²/4; σ=F/A; ε=σ/E; δ=FL/(AE). → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Jika diameter dua kali lipat, bagaimana σ dan δ berubah?

### Kasus 02-M — Batang pengikat mesin

| Input | Nilai default |
| --- | --- |
| F_N | 20000 |
| d_mm | 20 |
| L_mm | 500 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 314.159265 |
| sigma_MPa | 63.6619772 |
| epsilon | 0.000318309886 |
| delta_mm | 0.159154943 |

### Kasus 02-K — Tie rod struktur kapal

| Input | Nilai default |
| --- | --- |
| F_N | 30000 |
| d_mm | 24 |
| L_mm | 1200 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 452.389342 |
| sigma_MPa | 66.3145596 |
| epsilon | 0.000331572798 |
| delta_mm | 0.397887358 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 03 — Batang penarik mekanisme mesin / Batang penggantung platform kerja kapal

**Pemetaan:** C1/C2 → TS2–TS4.

**Idealisasi:** Batang tarik seragam elastis isotropik; beban dikontrol, ν=0,30; perbandingan E=200.000 dan 70.000 MPa adalah material latihan.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → k=AE/L; εlat=−νε; Δd=εlat d; G=E/[2(1+ν)]; U=Fδ/2. → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mengapa bahan dengan E lebih tinggi lebih kaku, tetapi belum tentu lebih kuat?

### Kasus 03-M — Batang penarik mekanisme mesin

| Input | Nilai default |
| --- | --- |
| F_N | 10000 |
| d_mm | 20 |
| L_mm | 500 |
| E_MPa | 200000 |
| nu | 0.3 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 314.159265 |
| sigma_MPa | 31.8309886 |
| epsilon | 0.000159154943 |
| delta_mm | 0.0795774715 |
| k_N_per_mm | 125663.706 |
| epsilon_lateral | -0.0000477464829 |
| delta_d_mm | -0.000954929659 |
| G_MPa | 76923.0769 |
| delta_if_E70000_mm | 0.227364204 |

### Kasus 03-K — Batang penggantung platform kerja kapal

| Input | Nilai default |
| --- | --- |
| F_N | 15000 |
| d_mm | 25 |
| L_mm | 1000 |
| E_MPa | 200000 |
| nu | 0.3 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 490.873852 |
| sigma_MPa | 30.5577491 |
| epsilon | 0.000152788745 |
| delta_mm | 0.152788745 |
| k_N_per_mm | 98174.7704 |
| epsilon_lateral | -0.0000458366236 |
| delta_d_mm | -0.00114591559 |
| G_MPa | 76923.0769 |
| delta_if_E70000_mm | 0.436539272 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 04 — Pin sambungan mekanisme pengangkat / Pin clevis pada padeye ideal

**Pemetaan:** C2/C5 → TS3/TS7.

**Idealisasi:** Mesin: satu bidang geser dan satu pelat yang ditinjau; Kapal: dua bidang geser simetris, pelat tengah menerima F dan tiap pelat luar F/2. Pembagian beban ideal, tanpa clearance/eksentrisitas.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → Apin=πd²/4; τavg=F/(m Apin); σb,tengah=F/(t_tengah d); σb,luar=(F/2)/(t_luar d). → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mengapa dua bidang geser menurunkan τ pin tetapi tidak otomatis membagi beban pelat tengah menjadi dua?

### Kasus 04-M — Pin sambungan mekanisme pengangkat

| Input | Nilai default |
| --- | --- |
| F_N | 12000 |
| d_mm | 12 |
| n_planes | 1 |
| t_center_mm | 8 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_pin_mm2 | 113.097336 |
| tau_avg_MPa | 106.103295 |
| bearing_center_MPa | 125 |

### Kasus 04-K — Pin clevis pada padeye ideal

| Input | Nilai default |
| --- | --- |
| F_N | 40000 |
| d_mm | 20 |
| n_planes | 2 |
| t_center_mm | 12 |
| t_each_outer_mm | 10 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_pin_mm2 | 314.159265 |
| tau_avg_MPa | 63.6619772 |
| bearing_center_MPa | 166.666667 |
| bearing_each_outer_MPa | 100 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 05 — Poros transmisi motor ke mesin / Segmen poros propeler

**Pemetaan:** C2/C3 → TS3–TS5.

**Idealisasi:** Poros bulat seragam, torsi statis murni, tanpa alur pasak, konsentrasi tegangan atau beban lentur; E=200.000 MPa, ν=0,30, G dihitung.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → J=π(do⁴−di⁴)/32; τmax=Tdo/(2J); θ=TL/(GJ); ω=2π rpm/60; T=P/ω. → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mana yang berubah ketika panjang poros digandakan: τ, θ, atau keduanya?

### Kasus 05-M — Poros transmisi motor ke mesin

| Input | Nilai default |
| --- | --- |
| T_Nmm | 200000 |
| d_mm | 30 |
| di_mm | 0 |
| L_mm | 600 |
| E_MPa | 200000 |
| nu | 0.3 |

| Keluaran acuan | Nilai |
| --- | --- |
| J_mm4 | 79521.564 |
| tauMax_MPa | 37.7256161 |
| theta_rad | 0.0196173204 |
| theta_deg | 1.12398966 |

### Kasus 05-K — Segmen poros propeler

| Input | Nilai default |
| --- | --- |
| T_Nmm | 1500000 |
| d_mm | 60 |
| di_mm | 0 |
| L_mm | 2000 |
| E_MPa | 200000 |
| nu | 0.3 |

| Keluaran acuan | Nilai |
| --- | --- |
| J_mm4 | 1272345.02 |
| tauMax_MPa | 35.3677651 |
| theta_rad | 0.0306520631 |
| theta_deg | 1.75623385 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 06 — Balok penyangga mesin / Balok geladak penyangga peralatan

**Pemetaan:** C2/C4 → TS3/TS6.

**Idealisasi:** Balok persegi panjang sendi–rol, beban titik di tengah, E konstan; h adalah dimensi vertikal searah lentur. Beban total tidak otomatis mencakup berat sendiri.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → RA=RB=F/2; Mmax=FL/4; I=bh³/12; σmax=Mmax h/(2I); δmax=FL³/(48EI). → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Apa pengaruh memperbesar h terhadap σ dan δ?

### Kasus 06-M — Balok penyangga mesin

| Input | Nilai default |
| --- | --- |
| P_N | 8000 |
| L_mm | 1500 |
| b_mm | 60 |
| h_mm | 120 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 7200 |
| I_mm4 | 8640000 |
| R_N | 4000 |
| Mmax_Nmm | 3000000 |
| sigmaMax_MPa | 20.8333333 |
| deltaMax_mm | 0.325520833 |

### Kasus 06-K — Balok geladak penyangga peralatan

| Input | Nilai default |
| --- | --- |
| P_N | 20000 |
| L_mm | 3000 |
| b_mm | 100 |
| h_mm | 200 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 20000 |
| I_mm4 | 66666666.7 |
| R_N | 10000 |
| Mmax_Nmm | 15000000 |
| sigmaMax_MPa | 22.5 |
| deltaMax_mm | 0.84375 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 07 — Orientasi profil rangka mesin / Orientasi balok penegar geladak

**Pemetaan:** C4 → TS6.

**Idealisasi:** Perbandingan orientasi persegi panjang homogen pada beban, bentang, E dan luas yang sama; orientasi B menukar b dan h. Bukan evaluasi lengkap pelat berpenguat.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → A=bh; I=bh³/12; c=h/2; Z=I/c; σmax=Mmax/Z; δmax=FL³/(48EI). → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mengapa luas sama tidak berarti kekakuan lentur sama?

### Kasus 07-M — Orientasi profil rangka mesin

| Input | Nilai default |
| --- | --- |
| P_N | 2000 |
| L_mm | 1000 |
| b_mm | 40 |
| h_mm | 100 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| orientation_A.A_mm2 | 4000 |
| orientation_A.I_mm4 | 3333333.33 |
| orientation_A.R_N | 1000 |
| orientation_A.Mmax_Nmm | 500000 |
| orientation_A.sigmaMax_MPa | 7.5 |
| orientation_A.deltaMax_mm | 0.0625 |
| orientation_B.A_mm2 | 4000 |
| orientation_B.I_mm4 | 533333.333 |
| orientation_B.R_N | 1000 |
| orientation_B.Mmax_Nmm | 500000 |
| orientation_B.sigmaMax_MPa | 18.75 |
| orientation_B.deltaMax_mm | 0.390625 |

### Kasus 07-K — Orientasi balok penegar geladak

| Input | Nilai default |
| --- | --- |
| P_N | 5000 |
| L_mm | 2000 |
| b_mm | 60 |
| h_mm | 160 |
| E_MPa | 200000 |

| Keluaran acuan | Nilai |
| --- | --- |
| orientation_A.A_mm2 | 9600 |
| orientation_A.I_mm4 | 20480000 |
| orientation_A.R_N | 2500 |
| orientation_A.Mmax_Nmm | 2500000 |
| orientation_A.sigmaMax_MPa | 9.765625 |
| orientation_A.deltaMax_mm | 0.203450521 |
| orientation_B.A_mm2 | 9600 |
| orientation_B.I_mm4 | 2880000 |
| orientation_B.R_N | 2500 |
| orientation_B.Mmax_Nmm | 2500000 |
| orientation_B.sigmaMax_MPa | 26.0416667 |
| orientation_B.deltaMax_mm | 1.44675926 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 08 — Pipa lurus instalasi mesin / Pipa lurus kamar mesin kapal

**Pemetaan:** C2 → TS3–TS4.

**Idealisasi:** Pipa seragam tanpa tekanan internal, ΔT merata. Mode bebas: satu ujung dapat bergerak aksial. Mode terkekang: dua ujung ditahan kaku, tanpa kelonggaran. E dan α konstan.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → A=π(do²−di²)/4; δbebas=αΔT L; σterkekang=−EαΔT; |R|=|σ|A; δterkekang=0. → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mengapa pipa yang bebas memuai tidak menghasilkan tegangan termal aksial pada model ini?

### Kasus 08-M — Pipa lurus instalasi mesin

| Input | Nilai default |
| --- | --- |
| d_mm | 40 |
| di_mm | 32 |
| L_mm | 2000 |
| deltaT_C | 40 |
| E_MPa | 200000 |
| alpha_per_C | 0.000012 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 452.389342 |
| delta_free_mm | 0.96 |
| sigma_fully_fixed_MPa | -96 |
| reactionMagnitude_N | 43429.3768 |
| delta_fully_fixed_mm | 0 |

### Kasus 08-K — Pipa lurus kamar mesin kapal

| Input | Nilai default |
| --- | --- |
| d_mm | 76 |
| di_mm | 64 |
| L_mm | 3000 |
| deltaT_C | 50 |
| E_MPa | 200000 |
| alpha_per_C | 0.000012 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 1319.46891 |
| delta_free_mm | 1.8 |
| sigma_fully_fixed_MPa | -120 |
| reactionMagnitude_N | 158336.27 |
| delta_fully_fixed_mm | 0 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 09 — Poros mesin menerima lentur dan torsi / Poros propeler menerima gaya dorong dan torsi

**Pemetaan:** C2/C3 → TS3–TS5.

**Idealisasi:** Poros pejal bulat, tegangan bidang pada permukaan, elastis, material ulet latihan Sy=250 MPa. Kapal memakai gaya dorong tekan negatif; tekuk tidak dihitung.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → σA=F/A+Mc/I; σB=F/A−Mc/I; τ=Tc/J; σvm=sqrt(σ²+3τ²) di masing-masing titik; n=Sy/max(σvm). → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Mengapa σ dan τ harus berasal dari titik fisik yang sama sebelum digabungkan?

### Kasus 09-M — Poros mesin menerima lentur dan torsi

| Input | Nilai default |
| --- | --- |
| F_N | 0 |
| M_Nmm | 300000 |
| T_Nmm | 200000 |
| d_mm | 40 |
| Sy_MPa | 250 |
| n_required | 2 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 1256.63706 |
| I_mm4 | 125663.706 |
| J_mm4 | 251327.412 |
| sigma_edge_A_MPa | 47.7464829 |
| sigma_edge_B_MPa | -47.7464829 |
| tau_surface_MPa | 15.9154943 |
| sigma_vm_max_MPa | 55.1328895 |
| n_yield | 4.53449841 |

### Kasus 09-K — Poros propeler menerima gaya dorong dan torsi

| Input | Nilai default |
| --- | --- |
| F_N | -50000 |
| M_Nmm | 0 |
| T_Nmm | 2000000 |
| d_mm | 70 |
| Sy_MPa | 250 |
| n_required | 2 |

| Keluaran acuan | Nilai |
| --- | --- |
| A_mm2 | 3848.451 |
| I_mm4 | 1178588.12 |
| J_mm4 | 2357176.24 |
| sigma_edge_A_MPa | -12.9922403 |
| sigma_edge_B_MPa | -12.9922403 |
| tau_surface_MPa | 29.6965491 |
| sigma_vm_max_MPa | 53.0514222 |
| n_yield | 4.71240901 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## 10 — Alternatif poros transmisi pejal–berongga / Alternatif orientasi balok geladak

**Pemetaan:** C3/C4/C5 → TS5–TS7.

**Idealisasi:** Mesin: diameter luar sama; massa berbeda; ρ=7.850 kg/m³ sebagai asumsi. Kapal: luas sama, orientasi berbeda; lendutan dan kekuatan diperiksa terpisah. Seluruh batas adalah kriteria latihan, bukan standar.

**Urutan hitungan:** gambar dan konvensi → data diketahui → konversi satuan → Mesin: m=ρAL, n=Sy/(sqrt(3)τmax), θ≤2° dan n≥2. Kapal: n=Sy/|σmax|≥2 dan δ≤L/1000; target lendutan dipilih untuk membedakan alternatif. → interpretasi dan batas model.

**Pertanyaan eksplorasi:** Alternatif mana memenuhi semua kriteria latihan, dan apa trade-off massa, kekuatan serta kekakuannya?

### Kasus 10-M — Alternatif poros transmisi pejal–berongga

| Input | Nilai default |
| --- | --- |
| T_Nmm | 150000 |
| d_mm | 35 |
| di_A_mm | 0 |
| di_B_mm | 20 |
| L_mm | 800 |
| E_MPa | 200000 |
| nu | 0.3 |
| rho_kg_m3 | 7850 |
| Sy_MPa | 250 |
| n_required | 2 |
| theta_limit_deg | 2 |

| Keluaran acuan | Nilai |
| --- | --- |
| alternative_A.J_mm4 | 147323.515 |
| alternative_A.tauMax_MPa | 17.8179295 |
| alternative_A.theta_rad | 0.010588941 |
| alternative_A.theta_deg | 0.606701626 |
| alternative_A.mass_kg | 6.04206807 |
| alternative_A.n_yield | 8.10069247 |
| alternative_B.J_mm4 | 131615.552 |
| alternative_B.tauMax_MPa | 19.9444516 |
| alternative_B.theta_rad | 0.0118527027 |
| alternative_B.theta_deg | 0.679109839 |
| alternative_B.mass_kg | 4.06914788 |
| alternative_B.n_yield | 7.23697849 |

### Kasus 10-K — Alternatif orientasi balok geladak

| Input | Nilai default |
| --- | --- |
| P_N | 15000 |
| L_mm | 2500 |
| b_A_mm | 80 |
| h_A_mm | 180 |
| b_B_mm | 180 |
| h_B_mm | 80 |
| E_MPa | 200000 |
| Sy_MPa | 250 |
| n_required | 2 |
| deflection_limit_mm | 2.5 |
| deflection_limit_basis | L/1000, kriteria latihan yang dipilih untuk kasus ini |

| Keluaran acuan | Nilai |
| --- | --- |
| alternative_A.A_mm2 | 14400 |
| alternative_A.I_mm4 | 38880000 |
| alternative_A.R_N | 7500 |
| alternative_A.Mmax_Nmm | 9375000 |
| alternative_A.sigmaMax_MPa | 21.7013889 |
| alternative_A.deltaMax_mm | 0.627933706 |
| alternative_B.A_mm2 | 14400 |
| alternative_B.I_mm4 | 7680000 |
| alternative_B.R_N | 7500 |
| alternative_B.Mmax_Nmm | 9375000 |
| alternative_B.sigmaMax_MPa | 48.828125 |
| alternative_B.deltaMax_mm | 3.17891439 |

**Bukti belajar:** mahasiswa menuliskan pilihan model, satuan, minimal satu langkah substitusi, hasil beserta satuan, serta alasan fisik dan batas kesimpulan.

## Pengayaan terencana, bukan tambahan kasus minimum

- 01: peragaan jenis beban selain balok dan satuan momen.
- 03: energi regangan elastis serta pembandingan E tanpa mengaitkannya otomatis dengan Sy.
- 04: visual penampang netto dan konsentrasi tegangan di lubang; tidak menghasilkan SWL padeye.
- 05: input daya–rpm sebagai alternatif terhadap torsi langsung; saat rpm=0, konversi ini tidak terdefinisi.
- 06: beban merata penuh dengan RA=RB=wL/2, Mmax=wL²/8, δmax=5wL⁴/(384EI). Pilihan beban titik dan merata mempunyai rumus, diagram dan data validasi terpisah.
- 07: properti geometris profil I, T, L dan pipa; centroid/teorema sumbu sejajar, Z atas/bawah dan orientasi harus eksplisit. Lentur tak simetris profil L tidak dimodelkan dengan satu I sederhana.
- 08: pendinginan dan tanda reaksi; kondisi tumpuan parsial bukan interpolasi linier tanpa model pegas.
- 09: tegangan utama permukaan σ1,2=σ/2 ± sqrt((σ/2)²+τ²) sebagai pengayaan. Fatigue dan tekuk belum dihitung.
- 10: latihan pembandingan analitis–SolidWorks untuk komponen yang setara. Tegangan nominal dibandingkan jauh dari tumpuan/beban titik; mesh, kondisi batas dan sifat material didokumentasikan.

## Interpretasi penting pada kasus 10

- **10-M:** poros berongga lebih ringan pada diameter luar yang sama, tetapi J lebih kecil, sehingga τ dan θ lebih besar. Kedua default memenuhi n≥2 dan θ≤2°. Pilihan berongga dapat dijelaskan melalui pengurangan massa, dengan batas model disebutkan.
- **10-K:** batas lendutan latihan adalah 2,5 mm (L/1000). A memenuhi kekuatan dan lendutan; B masih memenuhi n≥2 tetapi tidak memenuhi lendutan (sekitar 3,179 mm). Situs harus menampilkan kedua pemeriksaan secara terpisah. Batas L/1000 ini bukan kutipan aturan kelas kapal.

