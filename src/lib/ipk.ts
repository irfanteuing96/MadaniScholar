type SemesterLike = { ips: number | null; sks: number | null; status: string };

// IPK dihitung sebagai rata-rata IPS tertimbang SKS per semester yang sudah selesai.
export function computeIpk(semesters: SemesterLike[]): number | null {
  const finished = semesters.filter(
    (s) => s.status === "SELESAI" && s.ips != null && s.sks != null && s.sks > 0
  );
  if (finished.length === 0) return null;
  const totalSks = finished.reduce((sum, s) => sum + (s.sks ?? 0), 0);
  const totalBobot = finished.reduce((sum, s) => sum + (s.ips ?? 0) * (s.sks ?? 0), 0);
  if (totalSks === 0) return null;
  return Math.round((totalBobot / totalSks) * 100) / 100;
}
