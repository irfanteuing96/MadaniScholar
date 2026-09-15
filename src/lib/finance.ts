type PaymentLike = { amount: number; amountPaid: number };

export type FinancialStatus = "LUNAS" | "TUNGGAKAN" | "BELUM_ADA_TAGIHAN";
export type PaymentLineStatus = "BELUM_BAYAR" | "SEBAGIAN" | "LUNAS";

export function paymentRemaining(p: PaymentLike): number {
  return Math.max(p.amount - p.amountPaid, 0);
}

export function paymentLineStatus(p: PaymentLike): PaymentLineStatus {
  if (p.amountPaid <= 0) return "BELUM_BAYAR";
  return paymentRemaining(p) <= 0 ? "LUNAS" : "SEBAGIAN";
}

// Status keuangan mahasiswa secara keseluruhan (bukan gateway pembayaran —
// ini murni ringkasan catatan admin: sudah lunas semua, masih ada yang
// nunggak, atau belum pernah ditagih sama sekali).
export function financialStatus(payments: PaymentLike[]): FinancialStatus {
  if (payments.length === 0) return "BELUM_ADA_TAGIHAN";
  return payments.every((p) => paymentRemaining(p) <= 0) ? "LUNAS" : "TUNGGAKAN";
}

export function financeSummary(payments: PaymentLike[]) {
  const totalTagihan = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDibayar = payments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalSisa = Math.max(totalTagihan - totalDibayar, 0);
  return { totalTagihan, totalDibayar, totalSisa };
}

export function formatRupiah(amount: number | null | undefined): string {
  if (amount == null) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    amount
  );
}
