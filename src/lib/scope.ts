import type { StudentStatus } from "@/generated/prisma/client";

export type Scope = "calon" | "aktif" | "";

const CALON_STATUSES: StudentStatus[] = ["CALON", "DITERIMA", "DITOLAK"];
const AKTIF_STATUSES: StudentStatus[] = ["AKTIF", "LULUS", "NONAKTIF"];

export function parseScope(value: string | undefined): Scope {
  return value === "calon" || value === "aktif" ? value : "";
}

export function statusesForScope(scope: Scope): StudentStatus[] | undefined {
  if (scope === "calon") return CALON_STATUSES;
  if (scope === "aktif") return AKTIF_STATUSES;
  return undefined;
}
