export function Logo({ className = "h-9" }: { className?: string }) {
  // self-start + shrink-0: tanpa ini, di dalam parent flex-col (mis. AuthSidePanel)
  // "w-auto" ikut di-stretch oleh align-items:stretch bawaan flexbox sehingga
  // gambar melebar penuh & gepeng. block mencegah baseline whitespace img inline.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo statis kecil, tidak perlu pipeline optimisasi next/image
    <img
      src="/logo.png"
      alt="Madani Scholar"
      className={`block w-auto shrink-0 self-start ${className}`}
    />
  );
}
