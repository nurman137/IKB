// Explicit teaching cutoffs, not design-code acceptance limits.
export const beamStrainLimit = 0.01;
export const beamDeflectionRatioLimit = 0.02;
export function beamDomain(sigma, E, delta, L) {
  const strain = Math.abs(sigma) / E;
  const deflectionRatio = Math.abs(delta) / L;
  return { strain, deflectionRatio, smallStrain: strain <= beamStrainLimit * (1 + 1e-12), smallDeflection: deflectionRatio <= beamDeflectionRatioLimit * (1 + 1e-12) };
}
export const beamDomainNote = 'Batas latihan tambahan: |σ|/E ≤ 1% dan |δ|/L ≤ 2%. Ini batas model regangan/lendutan kecil untuk pembelajaran, bukan kriteria kode desain. Di luar batas, deformasi elastis dan rekomendasi yang bergantung padanya tidak diklaim.';
