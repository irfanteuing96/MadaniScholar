export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(34,29,21,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

// Warna-warni sengaja tidak ikut palet cream/orange utama — dipakai khusus di
// kartu ringkasan angka (StatCard) supaya dashboard terasa hidup & kontras,
// bukan datar semua cream/putih.
const STAT_GRADIENTS = {
  neutral: "bg-surface border border-border",
  blue: "bg-gradient-to-br from-blue-500 to-blue-600 border-0",
  violet: "bg-gradient-to-br from-violet-500 to-violet-600 border-0",
  emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 border-0",
  amber: "bg-gradient-to-br from-amber-400 to-amber-500 border-0",
  rose: "bg-gradient-to-br from-rose-500 to-rose-600 border-0",
  teal: "bg-gradient-to-br from-teal-500 to-teal-600 border-0",
  indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 border-0",
} as const;

export type StatColor = keyof typeof STAT_GRADIENTS;

export function StatCard({
  label,
  value,
  hint,
  color = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  color?: StatColor;
}) {
  const colored = color !== "neutral";
  return (
    <div
      className={`min-w-0 rounded-2xl p-5 shadow-[0_1px_2px_rgba(34,29,21,0.04)] ${STAT_GRADIENTS[color]}`}
    >
      <p className={`text-sm ${colored ? "text-white/80" : "text-foreground-muted"}`}>{label}</p>
      <p
        className={`mt-2 break-words text-2xl font-semibold leading-tight tracking-tight ${colored ? "text-white" : ""}`}
      >
        {value}
      </p>
      {hint && (
        <p className={`mt-1 text-xs ${colored ? "text-white/70" : "text-foreground-muted"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
