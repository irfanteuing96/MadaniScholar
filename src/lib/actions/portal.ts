"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getStage, nextStageKey } from "@/lib/stages";
import {
  stageAdvanceSchema,
  semesterSchema,
  createPaymentSchema,
  recordPaymentSchema,
} from "@/lib/validators";
import type { StudentStatus } from "@/generated/prisma/client";

// Semua aksi di sini dijalankan ATAS NAMA mahasiswa yang sedang login sendiri.
// Admin di platform ini adalah pihak eksternal yang tidak tahu kondisi riil di
// kampus — hanya mahasiswa yang tahu dan berhak mengisi progres, nilai, dan
// status keuangannya sendiri. Karena itu id mahasiswa TIDAK diambil dari form
// (form field bisa dipalsukan), melainkan selalu diturunkan dari sesi login.
async function requireOwnStudentId() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
  const student = await db.student.findUnique({
    where: { userId: session.sub },
    select: { id: true },
  });
  if (!student) redirect("/login");
  return student.id;
}

function resolveStatusForStage(stageKey: string): StudentStatus {
  const stage = getStage(stageKey);
  if (!stage) return "AKTIF";
  if (stage.board === "pendaftaran" || stage.board === "seleksi") return "CALON";
  if (stage.board === "daftar_ulang" && stageKey === "daftar_ulang") return "DITERIMA";
  return "AKTIF";
}

export async function advanceOwnStageAction(formData: FormData) {
  const studentId = await requireOwnStudentId();

  const parsed = stageAdvanceSchema.safeParse({
    studentId,
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) throw new Error("Data tidak valid");
  const { status, note } = parsed.data;

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

  revalidatePath("/portal");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/board");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
}

export async function upsertOwnSemesterAction(formData: FormData) {
  const studentId = await requireOwnStudentId();

  const parsed = semesterSchema.safeParse({
    studentId,
    number: formData.get("number"),
    ips: formData.get("ips") || undefined,
    sks: formData.get("sks") || undefined,
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  const { number, ips, sks, status } = parsed.data;

  await db.semester.upsert({
    where: { studentId_number: { studentId, number } },
    create: { studentId, number, ips, sks, status },
    update: { ips, sks, status },
  });

  revalidatePath("/portal");
  revalidatePath(`/admin/students/${studentId}`);
}

export async function createOwnPaymentAction(formData: FormData) {
  const studentId = await requireOwnStudentId();

  const parsed = createPaymentSchema.safeParse({
    studentId,
    label: formData.get("label"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  const { label, amount, dueDate, note } = parsed.data;

  await db.payment.create({
    data: { studentId, label, amount, note, dueDate: dueDate ? new Date(dueDate) : undefined },
  });

  revalidatePath("/portal");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/board");
  revalidatePath("/admin");
}

export async function recordOwnPaymentAction(formData: FormData) {
  const studentId = await requireOwnStudentId();

  const parsed = recordPaymentSchema.safeParse({
    paymentId: formData.get("paymentId"),
    amountPaid: formData.get("amountPaid"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Data tidak valid");
  const { paymentId, amountPaid } = parsed.data;

  // Pastikan tagihan yang diedit memang milik mahasiswa yang sedang login.
  const payment = await db.payment.findUniqueOrThrow({ where: { id: paymentId } });
  if (payment.studentId !== studentId) throw new Error("Tidak diizinkan");

  await db.payment.update({ where: { id: paymentId }, data: { amountPaid } });

  revalidatePath("/portal");
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");
  revalidatePath("/admin/board");
  revalidatePath("/admin");
}
