import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  campusId: z.string().min(1, "Pilih kampus"),
  majorId: z.string().min(1, "Pilih jurusan"),
  phone: z.string().min(8, "Nomor telepon tidak valid"),
  address: z.string().min(1, "Alamat wajib diisi"),
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(8),
  address: z.string().min(1),
  birthPlace: z.string().min(1),
  birthDate: z.string().min(1),
});

export const stageAdvanceSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["LULUS", "GAGAL"]),
  note: z.string().optional(),
});

export const semesterSchema = z.object({
  studentId: z.string().min(1),
  number: z.coerce.number().int().min(1).max(14),
  ips: z.coerce.number().min(0).max(4).optional(),
  sks: z.coerce.number().int().min(0).max(30).optional(),
  status: z.enum(["BERJALAN", "SELESAI"]),
});

export const createPaymentSchema = z.object({
  studentId: z.string().min(1),
  label: z.string().min(1, "Nama tagihan wajib diisi"),
  amount: z.coerce.number().min(0, "Nominal tagihan wajib diisi"),
  dueDate: z.string().optional(),
  note: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  paymentId: z.string().min(1),
  amountPaid: z.coerce.number().min(0, "Nominal tidak boleh negatif"),
});
