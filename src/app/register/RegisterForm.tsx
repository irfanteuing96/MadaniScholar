"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";

type Major = { id: string; name: string };
type Campus = { id: string; name: string; majors: Major[] };

export function RegisterForm({ campuses }: { campuses: Campus[] }) {
  const [state, formAction, pending] = useActionState(registerAction, null);
  const [campusId, setCampusId] = useState(campuses[0]?.id ?? "");

  const majors = useMemo(
    () => campuses.find((c) => c.id === campusId)?.majors ?? [],
    [campuses, campusId]
  );

  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="fullName">
            Nama Lengkap
          </label>
          <input id="fullName" name="fullName" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="campusId">
            Kampus Tujuan
          </label>
          <select
            id="campusId"
            name="campusId"
            required
            className={inputClass}
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="majorId">
            Jurusan
          </label>
          <select id="majorId" name="majorId" required className={inputClass}>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="phone">
            No. Telepon
          </label>
          <input id="phone" name="phone" required className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="birthDate">
            Tanggal Lahir
          </label>
          <input id="birthDate" name="birthDate" type="date" required className={inputClass} />
        </div>

        <div>
          <label className="text-sm font-medium" htmlFor="birthPlace">
            Tempat Lahir
          </label>
          <input id="birthPlace" name="birthPlace" required className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="address">
            Alamat
          </label>
          <input id="address" name="address" required className={inputClass} />
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-foreground-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-accent-dark hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
