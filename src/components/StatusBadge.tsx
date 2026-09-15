import { Badge } from "@/components/ui/Badge";
import type { StudentStatus } from "@/generated/prisma/client";

const STATUS_MAP: Record<StudentStatus, { label: string; variant: "neutral" | "accent" | "success" | "danger" | "warning" }> = {
  CALON: { label: "Calon Mahasiswa", variant: "neutral" },
  DITERIMA: { label: "Diterima", variant: "accent" },
  DITOLAK: { label: "Ditolak", variant: "danger" },
  AKTIF: { label: "Aktif Kuliah", variant: "success" },
  LULUS: { label: "Lulus", variant: "success" },
  NONAKTIF: { label: "Non-Aktif", variant: "warning" },
};

export function StatusBadge({ status }: { status: StudentStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
