import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";

export type NavItem = { href: string; label: string };

export function AppShell({
  roleLabel,
  userName,
  navItems,
  children,
}: {
  roleLabel: string;
  userName: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 sm:flex">
        <Link href="/" className="px-2 text-lg font-semibold tracking-tight">
          Pengawalan Kuliah
        </Link>
        <p className="mt-1 px-2 text-xs uppercase tracking-wide text-foreground-muted">
          {roleLabel}
        </p>

        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <p className="px-2 text-sm font-medium">{userName}</p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-foreground-muted hover:bg-surface-muted"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-border bg-surface sm:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">Pengawalan Kuliah</span>
            <form action={logoutAction}>
              <button type="submit" className="text-sm text-foreground-muted">
                Keluar
              </button>
            </form>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
