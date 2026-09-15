import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/AppShell";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { href: "/portal", label: "Status Saya" },
  { href: "/portal/profile", label: "Profil" },
];

export default async function PortalLayout({ children }: LayoutProps<"/portal">) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // Sesi (JWT) bisa saja masih berlaku walau data mahasiswanya sudah tidak ada
  // (mis. data direset admin). Jangan redirect ke /login di sini — proxy akan
  // langsung memantulkannya balik ke /portal karena role di JWT masih valid,
  // menyebabkan redirect loop. Tampilkan jalan keluar manual saja.
  const student = await db.student.findUnique({ where: { userId: session.sub }, select: { id: true } });
  if (!student) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-foreground-muted">
            Sesi kamu sudah tidak valid. Silakan masuk ulang.
          </p>
          <form action={logoutAction} className="mt-4 inline-block">
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Keluar dan Masuk Ulang
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AppShell roleLabel="Mahasiswa" userName={session.name} navItems={NAV}>
      {children}
    </AppShell>
  );
}
