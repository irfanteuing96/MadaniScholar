import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const student = await db.student.findUnique({
    where: { userId: session.sub },
    include: { campus: true, major: true, user: true },
  });
  if (!student) redirect("/login");

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {student.user.email} · {student.campus.name} · {student.major.name}
        </p>
      </div>

      <Card className="p-5">
        <ProfileForm
          fullName={student.fullName}
          phone={student.phone ?? ""}
          address={student.address ?? ""}
          birthPlace={student.birthPlace ?? ""}
          birthDate={student.birthDate ? student.birthDate.toISOString().slice(0, 10) : ""}
        />
      </Card>
    </div>
  );
}
