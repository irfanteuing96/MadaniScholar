import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import type { StudentStatus, StageStatus } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth";
import { STAGES, getStage } from "../src/lib/stages";

const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
const db = new PrismaClient({ adapter });

function resolveStatus(stageKey: string): StudentStatus {
  const stage = getStage(stageKey);
  if (!stage) return "CALON";
  if (stage.board === "pendaftaran" || stage.board === "seleksi") return "CALON";
  if (stage.key === "daftar_ulang") return "DITERIMA";
  return "AKTIF";
}

function stageHistoriesUpTo(stageKey: string): { stageKey: string; status: StageStatus }[] {
  const idx = STAGES.findIndex((s) => s.key === stageKey);
  return STAGES.slice(0, idx + 1).map((s, i) => ({
    stageKey: s.key,
    status: i === idx ? "BERJALAN" : "LULUS",
  }));
}

type StudentSeed = {
  fullName: string;
  email: string;
  campusCode: string;
  majorName: string;
  angkatan: number;
  stageKey: string;
  outcome?: "GAGAL_TES" | "DROPOUT" | "LULUS_WISUDA";
  semesters?: { number: number; ips: number; sks: number; status: "BERJALAN" | "SELESAI" }[];
};

const STUDENTS: StudentSeed[] = [
  {
    fullName: "Rafi Ardiansyah",
    email: "rafi.ardiansyah@student.demo",
    campusCode: "UNR",
    majorName: "Teknik Informatika",
    angkatan: 2026,
    stageKey: "berkas_masuk",
  },
  {
    fullName: "Siti Nur Aini",
    email: "siti.nuraini@student.demo",
    campusCode: "UNR",
    majorName: "Manajemen",
    angkatan: 2026,
    stageKey: "verifikasi_berkas",
  },
  {
    fullName: "Citra Ayu Lestari",
    email: "citra.ayu@student.demo",
    campusCode: "UNR",
    majorName: "Manajemen",
    angkatan: 2026,
    stageKey: "tes_masuk",
    outcome: "GAGAL_TES",
  },
  {
    fullName: "Bagus Prakoso",
    email: "bagus.prakoso@student.demo",
    campusCode: "UNR",
    majorName: "Akuntansi",
    angkatan: 2026,
    stageKey: "pengumuman",
  },
  {
    fullName: "Dewi Lestari",
    email: "dewi.lestari@student.demo",
    campusCode: "ITC",
    majorName: "Teknik Elektro",
    angkatan: 2025,
    stageKey: "daftar_ulang",
  },
  {
    fullName: "Andi Saputra",
    email: "andi.saputra@student.demo",
    campusCode: "ITC",
    majorName: "Ilmu Komputer",
    angkatan: 2025,
    stageKey: "ospek",
  },
  {
    fullName: "Doni Saputra",
    email: "doni.saputra@student.demo",
    campusCode: "ITC",
    majorName: "Teknik Elektro",
    angkatan: 2024,
    stageKey: "aktif_kuliah",
    outcome: "DROPOUT",
    semesters: [
      { number: 1, ips: 2.8, sks: 20, status: "SELESAI" },
      { number: 2, ips: 2.6, sks: 18, status: "SELESAI" },
    ],
  },
  {
    fullName: "Putri Ramadhani",
    email: "putri.ramadhani@student.demo",
    campusCode: "ITC",
    majorName: "Ilmu Komputer",
    angkatan: 2024,
    stageKey: "aktif_kuliah",
    semesters: [
      { number: 1, ips: 3.6, sks: 21, status: "SELESAI" },
      { number: 2, ips: 3.75, sks: 22, status: "SELESAI" },
      { number: 3, ips: 3.5, sks: 20, status: "BERJALAN" },
    ],
  },
  {
    fullName: "Fajar Nugroho",
    email: "fajar.nugroho@student.demo",
    campusCode: "UMB",
    majorName: "Hukum",
    angkatan: 2023,
    stageKey: "aktif_kuliah",
    semesters: [
      { number: 1, ips: 3.3, sks: 20, status: "SELESAI" },
      { number: 2, ips: 3.4, sks: 20, status: "SELESAI" },
      { number: 3, ips: 3.5, sks: 22, status: "SELESAI" },
      { number: 4, ips: 3.6, sks: 22, status: "SELESAI" },
      { number: 5, ips: 3.55, sks: 21, status: "SELESAI" },
      { number: 6, ips: 3.62, sks: 20, status: "BERJALAN" },
    ],
  },
  {
    fullName: "Nadia Kusuma",
    email: "nadia.kusuma@student.demo",
    campusCode: "UMB",
    majorName: "Psikologi",
    angkatan: 2022,
    stageKey: "pengajuan_ta",
    semesters: Array.from({ length: 7 }, (_, i) => ({
      number: i + 1,
      ips: 3.2 + (i % 3) * 0.15,
      sks: 20,
      status: "SELESAI" as const,
    })),
  },
  {
    fullName: "Yusuf Hidayat",
    email: "yusuf.hidayat@student.demo",
    campusCode: "UMB",
    majorName: "Kedokteran",
    angkatan: 2021,
    stageKey: "sidang",
    semesters: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      ips: 3.4 + (i % 4) * 0.1,
      sks: 22,
      status: "SELESAI" as const,
    })),
  },
  {
    fullName: "Rangga Wibowo",
    email: "rangga.wibowo@student.demo",
    campusCode: "UMB",
    majorName: "Hukum",
    angkatan: 2020,
    stageKey: "wisuda",
    outcome: "LULUS_WISUDA",
    semesters: Array.from({ length: 8 }, (_, i) => ({
      number: i + 1,
      ips: 3.5 + (i % 3) * 0.1,
      sks: 21,
      status: "SELESAI" as const,
    })),
  },
];

async function main() {
  console.log("Membersihkan data lama...");
  await db.semester.deleteMany();
  await db.stageHistory.deleteMany();
  await db.student.deleteMany();
  await db.major.deleteMany();
  await db.campus.deleteMany();
  await db.user.deleteMany();

  console.log("Membuat kampus & jurusan...");
  const unr = await db.campus.create({
    data: {
      name: "Universitas Nusantara Raya",
      code: "UNR",
      city: "Jakarta",
      address: "Jl. Merdeka No. 1, Jakarta",
      majors: {
        create: [{ name: "Teknik Informatika" }, { name: "Manajemen" }, { name: "Akuntansi" }],
      },
    },
    include: { majors: true },
  });

  const itc = await db.campus.create({
    data: {
      name: "Institut Teknologi Cendekia",
      code: "ITC",
      city: "Bandung",
      address: "Jl. Cendekia No. 8, Bandung",
      majors: { create: [{ name: "Teknik Elektro" }, { name: "Ilmu Komputer" }] },
    },
    include: { majors: true },
  });

  const umb = await db.campus.create({
    data: {
      name: "Universitas Merdeka Bangsa",
      code: "UMB",
      city: "Surabaya",
      address: "Jl. Pahlawan No. 17, Surabaya",
      majors: { create: [{ name: "Hukum" }, { name: "Psikologi" }, { name: "Kedokteran" }] },
    },
    include: { majors: true },
  });

  const campuses = { UNR: unr, ITC: itc, UMB: umb };

  console.log("Membuat akun admin...");
  await db.user.create({
    data: {
      email: "admin@pengawalankuliah.id",
      passwordHash: await hashPassword("admin1234"),
      role: "ADMIN",
      name: "Admin Pengawalan",
    },
  });

  console.log("Membuat data mahasiswa contoh...");
  let seq = 1;
  for (const s of STUDENTS) {
    const campus = campuses[s.campusCode as keyof typeof campuses];
    const major = campus.majors.find((m) => m.name === s.majorName);
    if (!major) throw new Error(`Jurusan ${s.majorName} tidak ditemukan di ${s.campusCode}`);

    const passwordHash = await hashPassword("mahasiswa123");
    const noPendaftaran = `${s.angkatan}${String(seq++).padStart(4, "0")}`;
    const histories = stageHistoriesUpTo(s.stageKey);
    let status: StudentStatus = resolveStatus(s.stageKey);

    if (s.outcome === "GAGAL_TES") {
      histories[histories.length - 1] = { stageKey: s.stageKey, status: "GAGAL" };
      status = "DITOLAK";
    } else if (s.outcome === "DROPOUT") {
      histories[histories.length - 1] = { stageKey: s.stageKey, status: "GAGAL" };
      status = "NONAKTIF";
    } else if (s.outcome === "LULUS_WISUDA") {
      histories[histories.length - 1] = { stageKey: s.stageKey, status: "LULUS" };
      status = "LULUS";
    }

    await db.user.create({
      data: {
        email: s.email,
        passwordHash,
        role: "STUDENT",
        name: s.fullName,
        student: {
          create: {
            noPendaftaran,
            nim: status === "AKTIF" || status === "LULUS" ? `${s.angkatan}${major.id.slice(0, 4)}${seq}` : null,
            fullName: s.fullName,
            campusId: campus.id,
            majorId: major.id,
            angkatan: s.angkatan,
            phone: `08${String(100000000 + seq).slice(0, 10)}`,
            address: `Jl. Contoh No. ${seq}, ${campus.city}`,
            birthPlace: campus.city ?? "Indonesia",
            birthDate: new Date(Date.UTC(s.angkatan - 19, 0, 15)),
            status,
            currentStage: s.stageKey,
            stageHistories: { create: histories },
            semesters: s.semesters ? { create: s.semesters } : undefined,
          },
        },
      },
    });
  }

  console.log("Selesai. Total mahasiswa:", await db.student.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
