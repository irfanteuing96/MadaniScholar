import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stageProgressPercent } from "@/lib/stages";
import { computeIpk } from "@/lib/ipk";
import { financialStatus, financeSummary, paymentLineStatus, paymentRemaining, formatRupiah } from "@/lib/finance";
import { StatusBadge } from "@/components/StatusBadge";
import { FinanceBadge } from "@/components/FinanceBadge";
import { StageStepper } from "@/components/StageStepper";
import { StageHistoryTable } from "@/components/StageHistoryTable";
import { StatCard, Card } from "@/components/ui/Card";
import {
  advanceOwnStageAction,
  upsertOwnSemesterAction,
  createOwnPaymentAction,
  recordOwnPaymentAction,
} from "@/lib/actions/portal";

export default async function PortalDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await db.student.findUnique({
    where: { userId: session.sub },
    include: {
      campus: true,
      major: true,
      stageHistories: { orderBy: { changedAt: "asc" } },
      semesters: { orderBy: { number: "asc" } },
      payments: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!student) redirect("/login");

  const ipk = computeIpk(student.semesters);
  const activeSemester = student.semesters.at(-1);
  const progress = stageProgressPercent(student.currentStage);
  const isFinished = student.status === "LULUS";
  const canAct = !isFinished && student.status !== "DITOLAK" && student.status !== "NONAKTIF";
  const showSemesterForm =
    student.status === "AKTIF" || student.semesters.length > 0 || isFinished;
  const summary = financeSummary(student.payments);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Halo, {student.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {student.campus.name} · {student.major.name} · Angkatan {student.angkatan}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={student.status} />
          <FinanceBadge status={financialStatus(student.payments)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Progres Keseluruhan" value={`${progress}%`} color="blue" />
        <StatCard label="IPK" value={ipk ?? "-"} color="emerald" />
        <StatCard
          label="Semester Berjalan"
          value={activeSemester ? activeSemester.number : "-"}
          color="violet"
        />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Perjalanan Kuliah Kamu</h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Update sendiri posisi kamu — pihak yang memantau di luar kampus tidak tahu progresmu
          kecuali kamu yang kabari lewat sini.
        </p>
        <div className="mt-5">
          <StageStepper currentStage={student.currentStage} history={student.stageHistories} />
        </div>

        {canAct && (
          <form action={advanceOwnStageAction} className="mt-5 flex flex-wrap items-end gap-3">
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
              Selesai, Lanjut Tahap Berikutnya
            </button>
            <button
              type="submit"
              name="status"
              value="GAGAL"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              Tandai Tidak Lolos
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <StageHistoryTable history={student.stageHistories} />
        </div>
      </Card>

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

          <form
            action={upsertOwnSemesterAction}
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end"
          >
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

      <Card className="p-5">
        <h2 className="font-semibold">Status Keuangan</h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Catat sendiri tagihan kampus kamu (SPP, biaya pendaftaran, dll) dan berapa yang sudah
          dibayar, supaya pihak yang memantau tahu kalau ada tunggakan.
        </p>

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

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Tagihan</th>
                <th className="py-2 pr-4 font-medium">Nominal</th>
                <th className="py-2 pr-4 font-medium">Sisa</th>
                <th className="py-2 pr-4 font-medium">Jatuh Tempo</th>
                <th className="py-2 font-medium">Update Dibayar</th>
              </tr>
            </thead>
            <tbody>
              {student.payments.map((p) => {
                const sisa = paymentRemaining(p);
                const status = paymentLineStatus(p);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 pr-4">
                      {p.label}
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
                    <td className={`py-2 pr-4 ${sisa > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {formatRupiah(sisa)}
                    </td>
                    <td className="py-2 pr-4 text-foreground-muted">
                      {p.dueDate ? p.dueDate.toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="py-2">
                      <form action={recordOwnPaymentAction} className="flex items-center gap-2">
                        <input type="hidden" name="paymentId" value={p.id} />
                        <input
                          type="number"
                          name="amountPaid"
                          min={0}
                          defaultValue={p.amountPaid}
                          className="w-28 rounded-lg border border-border bg-surface px-2 py-1 text-xs outline-none focus:border-accent"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium hover:bg-border"
                        >
                          Simpan
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {student.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-foreground-muted">
                    Belum ada tagihan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          action={createOwnPaymentAction}
          className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5 sm:items-end"
        >
          <div className="col-span-2 sm:col-span-2">
            <label className="text-xs font-medium text-foreground-muted" htmlFor="label">
              Nama Tagihan
            </label>
            <input
              id="label"
              name="label"
              required
              placeholder="mis. SPP Semester 4"
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted" htmlFor="amount">
              Nominal Tagihan (Rp)
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min={0}
              required
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-muted" htmlFor="dueDate">
              Jatuh Tempo
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
          >
            Tambah Tagihan
          </button>
        </form>
      </Card>
    </div>
  );
}
