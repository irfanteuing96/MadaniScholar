import Link from "next/link";

const OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "calon", label: "Calon Mahasiswa" },
  { value: "aktif", label: "Mahasiswa Aktif" },
];

export function ScopeTabs({
  basePath,
  params,
  value,
}: {
  basePath: string;
  params: Record<string, string>;
  value: string;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      {OPTIONS.map((opt) => {
        const search = new URLSearchParams(params);
        if (opt.value) search.set("scope", opt.value);
        else search.delete("scope");
        const qs = search.toString();
        const active = value === opt.value;

        return (
          <Link
            key={opt.value || "all"}
            href={qs ? `${basePath}?${qs}` : basePath}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-accent text-white" : "text-foreground-muted hover:bg-surface-muted"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}
