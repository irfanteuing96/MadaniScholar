"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validators";

export type ActionState = { error?: string; success?: boolean } | null;

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    birthPlace: formData.get("birthPlace"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  await db.student.update({
    where: { userId: session.sub },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      address: parsed.data.address,
      birthPlace: parsed.data.birthPlace,
      birthDate: new Date(parsed.data.birthDate),
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/profile");
  return { success: true };
}
