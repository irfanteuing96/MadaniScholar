import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { STAGES, getStage, stageProgressPercent } from "@/lib/stages";
import { computeIpk } from "@/lib/ipk";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { advanceStageAction, upsertSemesterAction } from "@/lib/actions/students";

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
    },
  });
  if (!student) notFound();

  const ipk = computeIpk(student.semesters);
  const progress = stageProgressPercent(student.currentStage);
  const isFinished = student.status === "LULUS";
  const canAct = !isFinished && student.status !== "DITOLAK" && student.status !== "NONAKTIF";
  const showSemesterForm =
    student.status === "AKTIF" || student.semesters.length > 0 || isFinished;

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
        <StatusBadge status={student.status} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{getStage(student.currentStage)?.label}</span>
          <span className="text-foreground-muted">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </div>

        {canAct && (
          <form action={advanceStageAction} className="mt-5 flex flex-wrap items-end gap-3">
            <input type="hidden" name="studentId" value={student.id} />
            <div className="flex-1 min-w-48">
              <label className="text-xs font-medium text-foreground-muted" htmlFor="note">
                Catatan (opsional)
              </label>
              <input
                id="note"
                name="note"
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
                placeholder="Catatan untuk tahap ini"
              />
            </div>
            <button
              type="submit"
              name="status"
              value="LULUS"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Lulus / Lanjutkan
            </button>
            <button
              type="submit"
              name="status"
              value="GAGAL"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Tandai Gagal
            </button>
          </form>
        )}
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
          <ol className="mt-4 space-y-3">
            {student.stageHistories.map((h) => (
              <li key={h.id} className="flex items-start justify-between text-sm">
                <div>
                  <p className="font-medium">{getStage(h.stageKey)?.label ?? h.stageKey}</p>
                  {h.note && <p className="text-xs text-foreground-muted">{h.note}</p>}
                </div>
                <div className="text-right">
                  <p
                    className={
                      h.status === "GAGAL"
                        ? "text-xs font-medium text-red-600"
                        : h.status === "LULUS"
                          ? "text-xs font-medium text-emerald-600"
                          : "text-xs font-medium text-accent-dark"
                    }
                  >
                    {h.status}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {h.changedAt.toLocaleDateString("id-ID")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {showSemesterForm && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Nilai Semester</h2>
            {ipk != null && (
              <span className="text-sm text-foreground-muted">
                IPK saat ini: <span className="font-semibold text-foreground">{ipk}</span>
              </span>
            )}
          </div>

          <div className="mt-4 overflow-x-auto">
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

          <form
            action={upsertSemesterAction}
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end"
          >
            <input type="hidden" name="studentId" value={student.id} />
            <div>
              <label className="text-xs font-medium text-foreground-muted" htmlFor="number">
                Semester
              </label>
              <input
                id="number"
                name="number"
                type="number"
                min={1}
                max={14}
                required
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted" htmlFor="ips">
                IPS
              </label>
              <input
                id="ips"
                name="ips"
                type="number"
                step="0.01"
                min={0}
                max={4}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted" htmlFor="sks">
                SKS
              </label>
              <input
                id="sks"
                name="sks"
                type="number"
                min={0}
                max={30}
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="SELESAI"
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              >
                <option value="BERJALAN">Berjalan</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Simpan
            </button>
          </form>
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
