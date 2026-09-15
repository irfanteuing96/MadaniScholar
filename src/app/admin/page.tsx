import Link from "next/link";
import { db } from "@/lib/db";
import { StatCard, Card } from "@/components/ui/Card";
import { STAGES, getStage } from "@/lib/stages";
import { financialStatus } from "@/lib/finance";

export default async function AdminDashboard() {
  const [students, campuses, recentStudents] = await Promise.all([
    db.student.findMany({
      select: { status: true, payments: { select: { amount: true, amountPaid: true } } },
    }),
    db.campus.findMany({
      include: { _count: { select: { students: true } } },
      orderBy: { name: "asc" },
    }),
    db.student.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { campus: true, major: true },
    }),
  ]);

  const total = students.length;
  const count = (s: string) => students.filter((x) => x.status === s).length;
  const calon = count("CALON") + count("DITERIMA");
  const ditolak = count("DITOLAK");
  const aktif = count("AKTIF");
  const lulus = count("LULUS");
  const nonaktif = count("NONAKTIF");
  const tunggakan = students.filter((s) => financialStatus(s.payments) === "TUNGGAKAN").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Ringkasan status mahasiswa di seluruh kampus.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Mahasiswa" value={total} color="blue" />
        <StatCard
          label="Ada Tunggakan"
          value={tunggakan}
          hint="Lihat kolom Keuangan di Data Mahasiswa"
          color="rose"
        />
        <StatCard label="Kampus Aktif" value={campuses.length} color="teal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Calon Mahasiswa</h2>
            <Link
              href="/admin/board?scope=calon"
              className="text-sm font-medium text-accent-dark hover:underline"
            >
              Lihat papan →
            </Link>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">Proses pendaftaran s.d. daftar ulang</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <StatCard label="Dalam Proses" value={calon} color="amber" />
            <StatCard label="Ditolak" value={ditolak} color="violet" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Mahasiswa Aktif</h2>
            <Link
              href="/admin/board?scope=aktif"
              className="text-sm font-medium text-accent-dark hover:underline"
            >
              Lihat papan →
            </Link>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">OSPEK s.d. wisuda</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard label="Aktif Kuliah" value={aktif} color="emerald" />
            <StatCard label="Sudah Lulus" value={lulus} color="indigo" />
            <StatCard label="Non-Aktif" value={nonaktif} color="violet" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Per Kampus</h2>
          <div className="mt-4 space-y-3">
            {campuses.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <span className="font-medium">{c._count.students} mahasiswa</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/board"
            className="mt-4 inline-block text-sm font-medium text-accent-dark hover:underline"
          >
            Lihat papan status →
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Pendaftar Terbaru</h2>
          <div className="mt-4 space-y-3">
            {recentStudents.length === 0 && (
              <p className="text-sm text-foreground-muted">Belum ada mahasiswa.</p>
            )}
            {recentStudents.map((s) => (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-muted"
              >
                <span>
                  {s.fullName}
                  <span className="ml-2 text-xs text-foreground-muted">
                    {s.campus.name} · {s.major.name}
                  </span>
                </span>
                <span className="text-xs text-foreground-muted">
                  {getStage(s.currentStage)?.label ?? s.currentStage}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/admin/students"
            className="mt-4 inline-block text-sm font-medium text-accent-dark hover:underline"
          >
            Lihat semua mahasiswa →
          </Link>
        </Card>
      </div>

      <p className="text-xs text-foreground-muted">
        Pipeline terdiri dari {STAGES.length} tahap, dari berkas masuk sampai wisuda.
      </p>
    </div>
  );
}
