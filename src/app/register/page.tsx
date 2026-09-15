import Link from "next/link";
import { db } from "@/lib/db";
import { RegisterForm } from "./RegisterForm";
import { AuthSidePanel } from "@/components/AuthSidePanel";

export default async function RegisterPage() {
  const campuses = await db.campus.findMany({
    orderBy: { name: "asc" },
    include: { majors: { orderBy: { name: "asc" } } },
  });

  return (
    <div className="flex flex-1">
      <AuthSidePanel quote="“Isi datamu sekali, pantau progresmu sampai wisuda.”" />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
            ← Kembali
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Daftar Calon Mahasiswa</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Isi data diri kamu untuk memulai proses pendaftaran.
          </p>

          {campuses.length === 0 ? (
            <p className="mt-8 rounded-xl bg-surface-muted px-4 py-3 text-sm text-foreground-muted">
              Belum ada kampus yang tersedia. Hubungi admin.
            </p>
          ) : (
            <RegisterForm campuses={campuses} />
          )}
        </div>
      </div>
    </div>
  );
}
