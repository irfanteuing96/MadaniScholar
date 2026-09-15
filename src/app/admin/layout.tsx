import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/board", label: "Papan Status" },
  { href: "/admin/students", label: "Data Mahasiswa" },
];

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AppShell roleLabel="Admin" userName={session.name} navItems={NAV}>
      {children}
    </AppShell>
  );
}
