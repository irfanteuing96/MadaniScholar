import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { STAGES, stageProgressPercent } from "@/lib/stages";
import { computeIpk } from "@/lib/ipk";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard, Card } from "@/components/ui/Card";

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
    },
  });
  if (!student) redirect("/login");

  const latestByStage = new Map<string, (typeof student.stageHistories)[number]>();
  for (const h of student.stageHistories) latestByStage.set(h.stageKey, h);

  const ipk = computeIpk(student.semesters);
  const activeSemester = student.semesters.at(-1);
  const progress = stageProgressPercent(student.currentStage);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Halo, {student.fullName.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {student.campus.name} · {student.major.name} · Angkatan {student.angkatan}
          </p>
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Progres Keseluruhan" value={`${progress}%`} />
        <StatCard label="IPK" value={ipk ?? "-"} />
        <StatCard
          label="Semester Berjalan"
          value={activeSemester ? activeSemester.number : "-"}
        />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Perjalanan Kuliah Kamu</h2>
        <ol className="mt-5 space-y-0">
          {STAGES.map((stage, idx) => {
            const entry = latestByStage.get(stage.key);
            const status = entry?.status ?? "BELUM";
            const isLast = idx === STAGES.length - 1;
            const dotClass =
              status === "LULUS"
                ? "bg-emerald-500"
                : status === "BERJALAN"
                  ? "bg-accent"
                  : status === "GAGAL"
                    ? "bg-red-500"
                    : "bg-surface-muted border border-border";

            return (
              <li key={stage.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${dotClass}`} />
                  {!isLast && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-5">
                  <p
                    className={
                      status === "BELUM"
                        ? "text-sm text-foreground-muted"
                        : "text-sm font-medium"
                    }
                  >
                    {stage.label}
                  </p>
                  {entry?.note && (
                    <p className="text-xs text-foreground-muted">{entry.note}</p>
                  )}
                  {entry && status !== "BELUM" && (
                    <p className="text-xs text-foreground-muted">
                      {entry.changedAt.toLocaleDateString("id-ID")}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {student.semesters.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold">Riwayat Nilai</h2>
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
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
