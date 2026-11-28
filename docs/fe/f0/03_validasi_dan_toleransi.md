# F0 — Kontrak validasi FE

Semua butir di sini merupakan target F1–F8; belum ada hasil FE yang lulus pada F0. Kelulusan pemeriksaan dataset bukan kelulusan solver. Toleransi di bawah adalah keputusan pengembangan untuk latihan, bukan standar rekayasa.

## Definisi galat dan gerbang umum

Galat absolut |qFE−qref|. Galat relatif memakai pembagi |qref| hanya bila |qref|>qzero; bila nol/nyaris nol tampilkan galat absolut, bukan persentase tak hingga. Besaran dan titik/sumbu/kondisi batas harus sama. qzero: 1e−6 N untuk gaya; 1e−6 Nmm untuk momen; 1e−8 MPa untuk tegangan; 1e−8 mm untuk perpindahan. Besaran turunan memakai batas absolut yang dicatat fixture.

| Pemeriksaan | Batas penerimaan yang direncanakan |
| --- | --- |
| Simetri matriks tereskala | norm∞(K−Kᵀ)/maks(norm∞(K),1) ≤1e−12 |
| Residual DOF bebas | norm∞(Kff uf−bf)/maks(norm∞(bf),norm∞(Kff uf),1 N tereskala) ≤1e−8 |
| Keseimbangan gaya | abs(ΣF+ΣR) ≤ maks(1e−6 N,1e−6 × jumlah magnitudo gaya diterapkan) per sumbu |
| Keseimbangan momen/torsi | abs(ΣM) ≤ maks(1e−6 Nmm,1e−6 × skala beban momen dan F·L) |
| Kasus beban nol | perpindahan ≤1e−10 mm; tegangan ≤1e−8 MPa; tidak ada Infinity/NaN |
| Patch regangan konstan PS2/AX2 | galat relatif perpindahan/tegangan ≤1e−6, di luar nilai nol yang memakai abs 1e−8 mm/MPa |
| BEAM2 kasus prismatik dengan node pada beban/potongan | reaksi/N/V/M ≤1e−6 relatif; perpindahan dan tegangan pulihan ≤0,1% pada titik target |
| AX2 tarik/Poisson dan termal seragam | perpindahan ujung/radial, tegangan merata dan reaksi ≤0,5% terhadap solusi homogen analitis |
| TOR2 lingkaran/cincin | Jt dan θ ≤1%; magnitudo τ pada titik/lingkar sampling ≤2%; energi vs integral torque ≤0,5% |
| COMB default | σA/σB/τ/von Mises ≤2%; n≤2% jika σvm bukan nol; tanda dan titik kritis harus tepat |
| Solid PS2 manufactured solution halus | galat L2 perpindahan ≤1%, L2 tegangan ≤3% terhadap solusi tepat |
| Balok solid PS2 vs EB | beda lendutan global ≤5% pada fixture ramping; tegangan nominal ROI ≤5%. Beda ini menggabungkan diskretisasi dan idealisasi, bukan toleransi universal semua input |
| Perubahan mesh sedang→halus | perpindahan/energi global ≤1%; tegangan ROI ≤3%. Bila gagal, status belum konvergen; jangan menghaluskan warna untuk menyatakan lulus |

Untuk PS2 dan AX2 gunakan tensor/energi dengan γ engineering yang konsisten: energi geser τγ/2. Pada AX2 dan TOR2, integrasi reaksi, energi, massa dan torque harus konsisten dengan volume/luas. Reaksi termal dihitung dengan K asli dan beban awal, bukan hanya K u−f mekanis yang mengabaikan fth.

## Daftar fixture wajib

1. **CORE-01**: satu batang EA/L, perpindahan nonnol yang ditetapkan; reaksi dan energi dari solusi tangan. **CORE-02**: transformasi frame 0/90/37° menjaga energi dan resultant. **CORE-03**: satu elemen dengan rigid modes yang diketahui; tanpa tumpuan harus gagal terdiagnosis, bukan mengembalikan solusi nol. **CORE-04**: beban nol, satuan ekuivalen, elemen terbalik, hampir degenerat, mesh terputus, material invalid, cancel dan hasil lama/stale.
2. **PS-PATCH**: u=a+bx+cy, v=d+ex+fy. Contoh E=200000 MPa, ν=0,3, t=10 mm; u=0,001x+0,0002y, v=−0,0003y, ε=[0,001,−0,0003,0,0002]. σxx=200 MPa, σyy=0, τxy=15,38461538 MPa. Terapkan displacement perimeter tepat dan uji mesh interior tidak teratur.
3. **PS-MMS**: unit square dalam mm, u=A x², v=0, A=1e−4/mm. σxx=2A E x/(1−ν²), σyy=νσxx, τ=0. Body force bx=−2AE/(1−ν²), by=0 N/mm³. Beri displacement eksak seluruh perimeter. Referensi tertutup independen dari elemen yang diuji; evaluasi interior/energi dengan kuadratur terpisah.
4. **AX-PATCH**: ur=a r, uz=b z dengan regangan rr=θθ=a, zz=b, rz=0; tegangan dari D3D isotropik. Uji domain solid yang menyentuh r=0 serta cincin ri>0. **AX-LOAD**: seluruh 02/03 dan uji ν=0 serta E=70000. Muka ujung boleh bergerak radial; pastikan tidak muncul σrr/σθθ palsu.
5. **AX-THERM**: 08-M/K mode bebas/terkekang, ΔT=0, positif, negatif, α×2, L×2, dinding berubah. Radial expansion bebas pada kedua mode; reaksi satu muka R=|σzz|A. Uji di atas Sy dan cutoff regangan termal.
6. **BEAM**: semua 01/06/07/10-K, kedua orientasi, 01 a=0/L, x di beban, beban titik/UDL. FE memperhitungkan nodal moments dari UDL. Uji 06-M h×2 (stocky, di luar domain), E=100 MPa (large strain/deflection), dan F=0. BEAM2 dapat menghasilkan solusi tepat di node pada mesh sangat kasar: jangan mengarang kurva perbaikan mesh bila hasil memang sudah sama.
7. **TOR**: 05-M/K, 10-M A/B, lingkaran unit dan cincin ri/ro=0,6, annulus tipis yang masih dalam cap geometris. Refinement memperbaiki batas geometri dan medan. Gauge tidak mengubah τ/J; pejal tanpa rongga memiliki ψ konstan. Uji T=0, T×2, d dan di×2, L×2, input daya–rpm, rpm=0 invalid, serta hole connectivity.
8. **COMB**: 09-M/K; F=0, M=0, T=0, semua nol, F negatif, titik kritis beralih A/B, F dibalik, θ/strain di luar domain. τ vektor A dan B tidak boleh sekadar disalin bertanda sama. L tambahan berubah tidak boleh mengubah tegangan penampang dari F/M/T tetap, tetapi memengaruhi deformasi submodel.
9. **HOLE-KIRSCH**: benchmark solver PS2 terpisah dari sambungan pin: annulus a≤r≤10a dengan traction batas luar dari solusi Kirsch tepat untuk σ∞ sepanjang x dan tepi lubang bebas. Gunakan kendala hanya untuk rigid modes. σθθ(a,π/2)=3σ∞; σrr=τrθ=0 di r=a. Target σθθ puncak ≤3%, L2 tegangan ROI ≤3%, displacement convergence ≤1%. Karena batas luar memakai solusi tepat, ini bukan pembenaran bahwa pelat finite dengan traction seragam harus selalu Kt=3.
10. **PIN-PLATE**: 04-M tengah; 04-K tengah dan masing-masing luar. Resultan traction harus Fplate, clamp reaction −Fplate dan momen sesuai. Bandingkan displacement/strain energy dan tegangan pada path tetap dengan solusi independen terverifikasi (mesher/solver pembanding dan versi/berkas dibekukan F6). Target beda displacement/energi ≤2%, tegangan path ROI ≤5%, perubahan sedang→halus ≤1%/3%. Tanpa benchmark pembanding F6, hasil lokal tetap berstatus eksperimen; tidak boleh diklaim valid hanya karena reaksi seimbang. τpin dan σbearing nominal M0 tidak menjadi target puncak FE pelat.

Kirsch: σrr=σ∞/2(1−a²/r²)+σ∞/2(1−4a²/r²+3a⁴/r⁴)cos2φ; σφφ=σ∞/2(1+a²/r²)−σ∞/2(1+3a⁴/r⁴)cos2φ; τrφ=−σ∞/2(1+2a²/r²−3a⁴/r⁴)sin2φ. Tegangan tarik positif. Traction batas luar t=σrr er+τrφ eφ. Gunakan integrasi gaya konsisten, jangan memaksakan tekanan konstan pengganti medan ini.

## Mesh, sampling dan sensitivitas

- BEAM2: 4/8/16 segmen dasar, ditambah titik wajib. Grafik evaluasi menggunakan shape function yang benar di antara node, tidak hanya garis lurus antar-uy.
- AX2: 2/4/8 elemen arah radial; target aspect ratio median ≤5 dengan penghalusan z yang sesuai. Batang panjang-tipis mungkin melampaui cap DOF; gunakan BEAM2 aksial sebagai fallback berlabel, bukan menyebutnya AX2. Penggantian itu harus terlihat pada UI.
- PS2 rectangular: 4/8/16 lapis tinggi dan pembagian x dengan panjang sisi sebanding; T6. Bila cap terlampaui, jangan menyatakan mesh halus sudah konvergen.
- TOR2: 32/64/128 segmen keliling luar/dalam dan penghalusan radial; PS2 hole juga menghaluskan keliling dan ligamen. Geometri melengkung minimal kuadratik/isoparametrik atau polygon error area/J<0,2% sebelum medan dinilai.
- Titik sampling dan ROI disimpan sebelum solve: koordinat fisik, path, metode interpolasi, jenis stress raw atau recovered. Raw stress di titik integrasi tersedia; smoothing ke node opsional, diberi label, tidak melintasi material/rongga.
- Jauhkan metrik nominal minimal satu tinggi balok dari strip beban/tumpuan. Untuk pelat pin, ROI tegangan pembanding tidak memasukkan penjepitan, ujung arc pembebanan, atau titik singular; jarak eksklusi dan path dicatat pada fixture F6, bukan dipilih setelah melihat hasil.
- Konvergensi tidak wajib monoton untuk setiap tegangan lokal. Puncak dekat singularitas tidak dipakai sebagai gerbang konvergensi. Jika ROI tidak tersedia, tampilkan 'tidak dapat dibandingkan', bukan mengubah ROI diam-diam.
- Studi strip s/2,s,2s: bila pengaruh >1% displacement atau >3% nominal stress, tandai sensitif terhadap model beban/tumpuan; jangan menyalahkan mesh saja.

## Status yang wajib dibedakan

`planned`, `invalid_input`, `invalid_mesh`, `underconstrained`, `solver_failed`, `cancelled`, `outside_model`, `solved_unverified`, `solved_not_converged`, `verified`. F0 hanya `planned`. 'Verified' memerlukan gerbang keluarga model dan fixture kasus lulus, bukan hanya solver berhenti. Data input berubah membatalkan hasil lama; respons worker dengan runId lama tidak boleh menggantikan hasil aktif.

Data referensi `case_matrix.json` memuat input/pembanding M0 dan tambahan latihan; `analytic_fixtures.json` dihasilkan Python SI independen dari fungsi situs. Keduanya bukan hasil FE. Tidak menyalin 133 angka analitis ke output solver untuk membuat tes lulus.
