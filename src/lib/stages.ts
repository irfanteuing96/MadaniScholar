// Definisi tahapan pengawalan mahasiswa: dari pendaftaran sampai wisuda.
// Daftar ini bersifat tetap (fixed pipeline) untuk versi awal.

export type StageCategory = "PENDAFTARAN" | "PERKULIAHAN" | "KELULUSAN";

export type BoardGroupKey =
  | "pendaftaran"
  | "seleksi"
  | "daftar_ulang"
  | "aktif_kuliah"
  | "tugas_akhir"
  | "sidang"
  | "yudisium_wisuda";

export type Stage = {
  key: string;
  label: string;
  category: StageCategory;
  board: BoardGroupKey;
};

export const STAGES: Stage[] = [
  { key: "berkas_masuk", label: "Berkas Masuk", category: "PENDAFTARAN", board: "pendaftaran" },
  { key: "verifikasi_berkas", label: "Verifikasi Berkas", category: "PENDAFTARAN", board: "pendaftaran" },
  { key: "tes_masuk", label: "Tes Masuk", category: "PENDAFTARAN", board: "seleksi" },
  { key: "pengumuman", label: "Pengumuman Kelulusan", category: "PENDAFTARAN", board: "seleksi" },
  { key: "daftar_ulang", label: "Daftar Ulang", category: "PENDAFTARAN", board: "daftar_ulang" },
  { key: "ospek", label: "OSPEK / PKKMB", category: "PERKULIAHAN", board: "daftar_ulang" },
  { key: "aktif_kuliah", label: "Aktif Kuliah", category: "PERKULIAHAN", board: "aktif_kuliah" },
  { key: "pengajuan_ta", label: "Pengajuan Judul TA", category: "KELULUSAN", board: "tugas_akhir" },
  { key: "bimbingan_ta", label: "Bimbingan TA", category: "KELULUSAN", board: "tugas_akhir" },
  { key: "sidang", label: "Sidang Akhir", category: "KELULUSAN", board: "sidang" },
  { key: "yudisium", label: "Yudisium", category: "KELULUSAN", board: "yudisium_wisuda" },
  { key: "wisuda", label: "Wisuda", category: "KELULUSAN", board: "yudisium_wisuda" },
];

export const BOARD_GROUPS: { key: BoardGroupKey; label: string }[] = [
  { key: "pendaftaran", label: "Berkas & Verifikasi" },
  { key: "seleksi", label: "Tes & Pengumuman" },
  { key: "daftar_ulang", label: "Daftar Ulang & OSPEK" },
  { key: "aktif_kuliah", label: "Aktif Kuliah" },
  { key: "tugas_akhir", label: "Tugas Akhir" },
  { key: "sidang", label: "Sidang" },
  { key: "yudisium_wisuda", label: "Yudisium & Wisuda" },
];

export function getStage(key: string): Stage | undefined {
  return STAGES.find((s) => s.key === key);
}

export function stageIndex(key: string): number {
  return STAGES.findIndex((s) => s.key === key);
}

export function nextStageKey(key: string): string | null {
  const idx = stageIndex(key);
  if (idx === -1 || idx === STAGES.length - 1) return null;
  return STAGES[idx + 1].key;
}

export function previousStageKey(key: string): string | null {
  const idx = stageIndex(key);
  if (idx <= 0) return null;
  return STAGES[idx - 1].key;
}

export function stageProgressPercent(key: string): number {
  const idx = stageIndex(key);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / STAGES.length) * 100);
}
