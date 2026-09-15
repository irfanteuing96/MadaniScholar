import { Badge } from "@/components/ui/Badge";
import type { FinancialStatus } from "@/lib/finance";

const MAP: Record<FinancialStatus, { label: string; variant: "success" | "danger" | "neutral" }> = {
  LUNAS: { label: "Lunas", variant: "success" },
  TUNGGAKAN: { label: "Ada Tunggakan", variant: "danger" },
  BELUM_ADA_TAGIHAN: { label: "Belum Ada Tagihan", variant: "neutral" },
};

export function FinanceBadge({ status }: { status: FinancialStatus }) {
  const { label, variant } = MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
