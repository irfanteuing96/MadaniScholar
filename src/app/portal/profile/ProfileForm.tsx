"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";

type Props = {
  fullName: string;
  phone: string;
  address: string;
  birthPlace: string;
  birthDate: string; // yyyy-mm-dd
};

export function ProfileForm(props: Props) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);
  const inputClass =
    "mt-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-accent";

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="fullName">
          Nama Lengkap
        </label>
        <input id="fullName" name="fullName" defaultValue={props.fullName} required className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="phone">
            No. Telepon
          </label>
          <input id="phone" name="phone" defaultValue={props.phone} required className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="birthDate">
            Tanggal Lahir
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={props.birthDate}
            required
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="birthPlace">
          Tempat Lahir
        </label>
        <input
          id="birthPlace"
          name="birthPlace"
          defaultValue={props.birthPlace}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="address">
          Alamat
        </label>
        <input id="address" name="address" defaultValue={props.address} required className={inputClass} />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Profil berhasil diperbarui.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
