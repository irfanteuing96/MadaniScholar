import Link from "next/link";
import { db } from "@/lib/db";
import { BOARD_GROUPS, getStage } from "@/lib/stages";
import { CampusFilter } from "@/components/CampusFilter";
import { StatusBadge } from "@/components/StatusBadge";

export default async function BoardPage({ searchParams }: PageProps<"/admin/board">) {
  const { campus: campusId } = await searchParams;
  const selectedCampus = Array.isArray(campusId) ? campusId[0] : campusId ?? "";

  const [campuses, students] = await Promise.all([
    db.campus.findMany({ orderBy: { name: "asc" } }),
    db.student.findMany({
      where: selectedCampus ? { campusId: selectedCampus } : undefined,
      include: { campus: true, major: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const active = students.filter((s) => s.status !== "DITOLAK" && s.status !== "NONAKTIF");
  const inactive = students.filter((s) => s.status === "DITOLAK" || s.status === "NONAKTIF");

  const columns = BOARD_GROUPS.map((group) => ({
    ...group,
    students: active.filter((s) => getStage(s.currentStage)?.board === group.key),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Papan Status</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Posisi setiap mahasiswa dalam pipeline pengawalan.
          </p>
        </div>
        <CampusFilter campuses={campuses} value={selectedCampus} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.key} className="w-72 shrink-0">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold">{col.label}</h2>
              <span className="text-xs text-foreground-muted">{col.students.length}</span>
            </div>
            <div className="mt-3 space-y-3">
              {col.students.length === 0 && (
                <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-foreground-muted">
                  Kosong
                </div>
              )}
              {col.students.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/students/${s.id}`}
                  className="block rounded-xl border border-border bg-surface p-3.5 hover:border-accent"
                >
                  <p className="text-sm font-medium">{s.fullName}</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {s.campus.name} · {s.major.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      {getStage(s.currentStage)?.label}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {inactive.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground-muted">Tidak Lanjut</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {inactive.map((s) => (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="rounded-xl border border-border bg-surface p-3.5 hover:border-accent"
              >
                <p className="text-sm font-medium">{s.fullName}</p>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  {s.campus.name} · {s.major.name}
                </p>
                <div className="mt-2">
                  <StatusBadge status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
