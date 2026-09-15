import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { STAGES } from "@/lib/stages";
import { computeIpk } from "@/lib/ipk";
import { financialStatus, financeSummary, paymentLineStatus, paymentRemaining, formatRupiah } from "@/lib/finance";
import { StatusBadge } from "@/components/StatusBadge";
import { FinanceBadge } from "@/components/FinanceBadge";
import { StageStepper } from "@/components/StageStepper";
import { StageHistoryTable } from "@/components/StageHistoryTable";
import { Card, StatCard } from "@/components/ui/Card";

// Halaman ini murni untuk MEMANTAU (read-only). Admin di platform ini adalah
// pihak eksternal yang tidak punya akses ke sistem kampus — semua data di sini
// (tahap, nilai, keuangan) diisi sendiri oleh mahasiswa yang bersangkutan lewat
// portalnya. Jangan tambahkan form ubah data di halaman ini.
export default async function StudentDetailPage({ params }: PageProps<"/admin/students/[id]">) {
  const { id } = await params;

  const student = await db.student.findUnique({
    where: { id },
    include: {
      campus: true,
      major: true,
      user: true,
      stageHistories: { orderBy: { changedAt: "asc" } },
      semesters: { orderBy: { number: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!student) notFound();

  const ipk = computeIpk(student.semesters);
  const showSemesterCard = student.status === "AKTIF" || student.semesters.length > 0 || student.status === "LULUS";
  const summary = financeSummary(student.payments);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{student.fullName}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {student.nim ?? student.noPendaftaran} · {student.campus.name} · {student.major.name} ·
            Angkatan {student.angkatan}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={student.status} />
          <FinanceBadge status={financialStatus(student.payments)} />
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Perjalanan Kuliah</h2>
          <p className="text-xs text-foreground-muted">Diisi mandiri oleh mahasiswa</p>
        </div>
        <div className="mt-4">
          <StageStepper currentStage={student.currentStage} history={student.stageHistories} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Biodata</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Email" value={student.user.email} />
            <Row label="Telepon" value={student.phone ?? "-"} />
            <Row label="Alamat" value={student.address ?? "-"} />
            <Row
              label="Tempat, Tanggal Lahir"
              value={
                student.birthPlace || student.birthDate
                  ? `${student.birthPlace ?? "-"}, ${
                      student.birthDate ? student.birthDate.toLocaleDateString("id-ID") : "-"
                    }`
                  : "-"
              }
            />
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Riwayat Tahap</h2>
          <div className="mt-4">
            <StageHistoryTable history={student.stageHistories} />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Status Keuangan</h2>
          <p className="text-xs text-foreground-muted">Dicatat mandiri oleh mahasiswa</p>
        </div>

        {student.payments.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Total Tagihan" value={formatRupiah(summary.totalTagihan)} color="indigo" />
            <StatCard label="Sudah Dibayar" value={formatRupiah(summary.totalDibayar)} color="emerald" />
            <StatCard
              label="Sisa Tunggakan"
              value={formatRupiah(summary.totalSisa)}
              color={summary.totalSisa > 0 ? "rose" : "teal"}
            />
          </div>
        )}

        <div className="thin-scrollbar mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Tagihan</th>
                <th className="py-2 pr-4 font-medium">Nominal</th>
                <th className="py-2 pr-4 font-medium">Dibayar</th>
                <th className="py-2 pr-4 font-medium">Sisa</th>
                <th className="py-2 font-medium">Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              {student.payments.map((p) => {
                const status = paymentLineStatus(p);
                const sisa = paymentRemaining(p);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 pr-4">
                      {p.label}
                      {p.note && <p className="text-xs text-foreground-muted">{p.note}</p>}
                      <p
                        className={
                          status === "LUNAS"
                            ? "text-xs font-medium text-emerald-600"
                            : status === "SEBAGIAN"
                              ? "text-xs font-medium text-amber-600"
                              : "text-xs font-medium text-red-600"
                        }
                      >
                        {status.replace("_", " ")}
                      </p>
                    </td>
                    <td className="py-2 pr-4">{formatRupiah(p.amount)}</td>
                    <td className="py-2 pr-4">{formatRupiah(p.amountPaid)}</td>
                    <td className={`py-2 pr-4 ${sisa > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatRupiah(sisa)}
                    </td>
                    <td className="py-2 text-foreground-muted">
                      {p.dueDate ? p.dueDate.toLocaleDateString("id-ID") : "-"}
                    </td>
                  </tr>
                );
              })}
              {student.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-foreground-muted">
                    Belum ada tagihan tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showSemesterCard && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Nilai Semester</h2>
            {ipk != null && (
              <span className="text-sm text-foreground-muted">
                IPK saat ini: <span className="font-semibold text-foreground">{ipk}</span>
              </span>
            )}
          </div>

          <div className="thin-scrollbar mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-foreground-muted">
                <tr>
                  <th className="py-2 pr-4 font-medium">Semester</th>
                  <th className="py-2 pr-4 font-medium">IPS</th>
                  <th className="py-2 pr-4 font-medium">SKS</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {student.semesters.map((sem) => (
                  <tr key={sem.id} className="border-t border-border">
                    <td className="py-2 pr-4">{sem.number}</td>
                    <td className="py-2 pr-4">{sem.ips ?? "-"}</td>
                    <td className="py-2 pr-4">{sem.sks ?? "-"}</td>
                    <td className="py-2 pr-4">{sem.status}</td>
                  </tr>
                ))}
                {student.semesters.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-foreground-muted">
                      Belum ada data semester.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-foreground-muted">
        Total tahapan pipeline: {STAGES.length}. Nomor pendaftaran: {student.noPendaftaran}.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-foreground-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
