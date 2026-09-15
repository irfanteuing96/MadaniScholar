import { STAGES, getStage } from "@/lib/stages";

type HistoryEntry = { stageKey: string; status: "BELUM" | "BERJALAN" | "LULUS" | "GAGAL" };

export function StageStepper({
  currentStage,
  history,
}: {
  currentStage: string;
  history: HistoryEntry[];
}) {
  const latestByStage = new Map<string, HistoryEntry>();
  for (const h of history) latestByStage.set(h.stageKey, h);

  return (
    <div>
      <div className="thin-scrollbar flex items-center overflow-x-auto pb-1">
        {STAGES.map((stage, i) => {
          const status = latestByStage.get(stage.key)?.status ?? "BELUM";
          const isCurrent = stage.key === currentStage;
          const dotClass =
            status === "LULUS"
              ? "bg-emerald-500"
              : status === "BERJALAN"
                ? "bg-accent"
                : status === "GAGAL"
                  ? "bg-red-500"
                  : "bg-surface-muted border border-border";
          const passed = status === "LULUS";

          return (
            <div key={stage.key} className="flex shrink-0 items-center">
              <span
                title={stage.label}
                className={`block h-3 w-3 rounded-full ${dotClass} ${
                  isCurrent ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
                }`}
              />
              {i < STAGES.length - 1 && (
                <span className={`h-px w-5 sm:w-7 ${passed ? "bg-emerald-300" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-medium">{getStage(currentStage)?.label}</p>
    </div>
  );
}
