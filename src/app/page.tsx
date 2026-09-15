import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const campuses = await db.campus.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">Pengawalan Kuliah</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Daftar Sekarang
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-accent-dark">Dari pendaftaran sampai wisuda</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Kawal setiap langkah mahasiswa, di satu tempat.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-foreground-muted">
            Pantau status pendaftaran, seleksi, perkuliahan, hingga sidang dan wisuda
            mahasiswa di beberapa kampus sekaligus — mudah untuk calon mahasiswa, jelas
            untuk admin.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Daftar sebagai Calon Mahasiswa
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-surface-muted"
            >
              Masuk ke akun saya
            </Link>
          </div>
        </section>

        {campuses.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
              Kampus mitra
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {campuses.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-1 text-sm text-foreground-muted">{c.city ?? c.address}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-foreground-muted">
        Platform Pengawalan Kuliah — data disimpan lokal untuk keperluan pengembangan.
      </footer>
    </div>
  );
}
