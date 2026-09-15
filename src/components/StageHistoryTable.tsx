import { getStage } from "@/lib/stages";

type HistoryEntry = {
  id: string;
  stageKey: string;
  status: "BELUM" | "BERJALAN" | "LULUS" | "GAGAL";
  note: string | null;
  changedAt: Date;
};

const STATUS_CLASS: Record<HistoryEntry["status"], string> = {
  LULUS: "text-emerald-600",
  GAGAL: "text-red-600",
  BERJALAN: "text-accent-dark",
  BELUM: "text-foreground-muted",
};

export function StageHistoryTable({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-foreground-muted">Belum ada riwayat.</p>;
  }

  return (
    <div className="thin-scrollbar max-h-80 overflow-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead className="sticky top-0 bg-surface text-xs uppercase tracking-wide text-foreground-muted">
          <tr>
            <th className="py-2 pr-3 font-medium">Tahap</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Tanggal</th>
            <th className="py-2 font-medium">Catatan</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-t border-border">
              <td className="py-1.5 pr-3">{getStage(h.stageKey)?.label ?? h.stageKey}</td>
              <td className={`py-1.5 pr-3 font-medium ${STATUS_CLASS[h.status]}`}>{h.status}</td>
              <td className="py-1.5 pr-3 text-foreground-muted">
                {h.changedAt.toLocaleDateString("id-ID")}
              </td>
              <td className="py-1.5 text-foreground-muted">{h.note ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
