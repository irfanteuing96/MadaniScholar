import Link from "next/link";
import { db } from "@/lib/db";
import { getStage } from "@/lib/stages";
import { StatusBadge } from "@/components/StatusBadge";
import { CampusFilter } from "@/components/CampusFilter";
import type { Prisma } from "@/generated/prisma/client";

export default async function StudentsPage({ searchParams }: PageProps<"/admin/students">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const campusId = typeof sp.campus === "string" ? sp.campus : "";

  const where: Prisma.StudentWhereInput = {
    ...(campusId ? { campusId } : {}),
    ...(q
      ? {
          OR: [
            { fullName: { contains: q } },
            { noPendaftaran: { contains: q } },
            { nim: { contains: q } },
          ],
        }
      : {}),
  };

  const [campuses, students] = await Promise.all([
    db.campus.findMany({ orderBy: { name: "asc" } }),
    db.student.findMany({
      where,
      include: { campus: true, major: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Data Mahasiswa</h1>
        <p className="mt-1 text-sm text-foreground-muted">{students.length} mahasiswa ditemukan</p>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, no. pendaftaran, atau NIM"
          className="min-w-64 flex-1 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
        />
        <CampusFilter campuses={campuses} value={campusId} />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Kampus / Jurusan</th>
              <th className="px-4 py-3 font-medium">Angkatan</th>
              <th className="px-4 py-3 font-medium">Tahap</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                <td className="px-4 py-3">
                  <Link href={`/admin/students/${s.id}`} className="font-medium hover:underline">
                    {s.fullName}
                  </Link>
                  <p className="text-xs text-foreground-muted">{s.nim ?? s.noPendaftaran}</p>
                </td>
                <td className="px-4 py-3 text-foreground-muted">
                  {s.campus.name} · {s.major.name}
                </td>
                <td className="px-4 py-3 text-foreground-muted">{s.angkatan}</td>
                <td className="px-4 py-3 text-foreground-muted">
                  {getStage(s.currentStage)?.label ?? s.currentStage}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground-muted">
                  Tidak ada mahasiswa yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
