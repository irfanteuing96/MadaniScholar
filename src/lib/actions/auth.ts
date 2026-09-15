"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, signSession, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators";

export type ActionState = { error?: string } | null;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { error: "Email atau password salah" };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "Email atau password salah" };

  const token = await signSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  redirect(user.role === "ADMIN" ? "/admin" : "/portal");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    campusId: formData.get("campusId"),
    majorId: formData.get("majorId"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    birthPlace: formData.get("birthPlace"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const data = parsed.data;

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) return { error: "Email sudah terdaftar" };

  const major = await db.major.findUnique({ where: { id: data.majorId } });
  if (!major || major.campusId !== data.campusId) {
    return { error: "Jurusan tidak sesuai dengan kampus yang dipilih" };
  }

  const year = new Date().getFullYear();
  const count = await db.student.count({ where: { angkatan: year } });
  const noPendaftaran = `${year}${String(count + 1).padStart(4, "0")}`;

  const passwordHash = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: "STUDENT",
      name: data.fullName,
      student: {
        create: {
          noPendaftaran,
          fullName: data.fullName,
          campusId: data.campusId,
          majorId: data.majorId,
          angkatan: year,
          phone: data.phone,
          address: data.address,
          birthPlace: data.birthPlace,
          birthDate: new Date(data.birthDate),
          status: "CALON",
          currentStage: "berkas_masuk",
          stageHistories: {
            create: { stageKey: "berkas_masuk", status: "BERJALAN", note: "Pendaftaran dibuat" },
          },
        },
      },
    },
  });

  const token = await signSession({
    sub: user.id,
    role: "STUDENT",
    name: user.name,
    email: user.email,
  });
  await setSessionCookie(token);

  redirect("/portal");
}
