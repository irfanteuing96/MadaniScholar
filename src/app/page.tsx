import Link from "next/link";
import { db } from "@/lib/db";
import { InteractiveHero } from "@/components/InteractiveHero";
import { Logo } from "@/components/Logo";

export default async function Home() {
  const campuses = await db.campus.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo className="h-11" />
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
        <section className="relative overflow-hidden">
          <div
            className="decor-blob -left-24 -top-24 h-80 w-80"
            style={{ background: "#F3DDD0" }}
          />
          <div
            className="decor-blob -right-32 top-10 h-96 w-96"
            style={{ background: "#F1EBDB" }}
          />

          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-medium text-accent-dark">Dari pendaftaran sampai wisuda</p>
              <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Kawal setiap langkah mahasiswa, di satu tempat.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-foreground-muted">
                Progres akademik, nilai, sampai status keuangan — terpantau real-time dalam satu
                dashboard, tanpa perlu akses ke sistem kampus mana pun.
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
            </div>

            <InteractiveHero />
          </div>
        </section>

        {campuses.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="text-sm font-medium uppercase tracking-wide text-foreground-muted">
              Kampus mitra
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {campuses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="mt-1 text-sm text-foreground-muted">{c.city ?? c.address}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-foreground-muted">
        Madani Scholar — platform pengawalan mahasiswa, data disimpan lokal untuk keperluan pengembangan.
      </footer>
    </div>
  );
}
