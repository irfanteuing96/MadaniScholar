"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStage, nextStageKey } from "@/lib/stages";
import { stageAdvanceSchema, semesterSchema } from "@/lib/validators";
import type { StudentStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

function resolveStatusForStage(stageKey: string): StudentStatus {
  const stage = getStage(stageKey);
  if (!stage) return "AKTIF";
  if (stage.board === "pendaftaran" || stage.board === "seleksi") return "CALON";
  if (stage.board === "daftar_ulang" && stageKey === "daftar_ulang") return "DITERIMA";
  return "AKTIF";
}

export async function advanceStageAction(formData: FormData) {
  await requireAdmin();

  const parsed = stageAdvanceSchema.safeParse({
    studentId: formData.get("studentId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) throw new Error("Data tidak valid");
  const { studentId, status, note } = parsed.data;

  const student = await db.student.findUniqueOrThrow({ where: { id: studentId } });

  await db.stageHistory.create({
    data: { studentId, stageKey: student.currentStage, status, note },
  });

  if (status === "GAGAL") {
    const stage = getStage(student.currentStage);
    const newStatus: StudentStatus =
      stage?.board === "pendaftaran" || stage?.board === "seleksi" ? "DITOLAK" : "NONAKTIF";
    await db.student.update({ where: { id: studentId }, data: { status: newStatus } });
  } else {
    const next = nextStageKey(student.currentStage);
    if (next) {
      await db.student.update({
        where: { id: studentId },
        data: { currentStage: next, status: resolveStatusForStage(next) },
      });
      await db.stageHistory.create({
        data: { studentId, stageKey: next, status: "BERJALAN" },
      });
    } else {
      await db.student.update({ where: { id: studentId }, data: { status: "LULUS" } });
    }
  }

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/board");
  revalidatePath("/admin");
}

export async function upsertSemesterAction(formData: FormData) {
  await requireAdmin();

  const parsed = semesterSchema.safeParse({
    studentId: formData.get("studentId"),
    number: formData.get("number"),
    ips: formData.get("ips") || undefined,
    sks: formData.get("sks") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  const { studentId, number, ips, sks, status } = parsed.data;

  await db.semester.upsert({
    where: { studentId_number: { studentId, number } },
    create: { studentId, number, ips, sks, status },
    update: { ips, sks, status },
  });

  revalidatePath(`/admin/students/${studentId}`);
}
