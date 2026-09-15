"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { AuthSidePanel } from "@/components/AuthSidePanel";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="flex flex-1">
      <AuthSidePanel quote="“Mahasiswa update sendiri progresnya, admin tinggal pantau.”" />

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
            ← Kembali
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Masuk</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Masuk sebagai admin atau mahasiswa untuk melihat status kamu.
          </p>

          <form action={formAction} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="nama@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-sm text-foreground-muted">
            Belum punya akun?{" "}
            <Link href="/register" className="font-medium text-accent-dark hover:underline">
              Daftar sebagai calon mahasiswa
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
