"use client";

import { useRouter, usePathname } from "next/navigation";

export function CampusFilter({
  campuses,
  value,
}: {
  campuses: { id: string; name: string }[];
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        router.push(v ? `${pathname}?campus=${v}` : pathname);
      }}
      className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm outline-none focus:border-accent"
    >
      <option value="">Semua Kampus</option>
      {campuses.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
