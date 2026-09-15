// Ilustrasi dekoratif orisinal (bukan foto/stok) — motif "perjalanan akademik":
// topi wisuda, jalur bertitik menanjak, dan lingkaran-lingkaran milestone.
// Dipakai di halaman marketing/auth saja, bukan di dashboard yang padat data.
export function BrandIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="210" cy="210" r="200" fill="#F3DDD0" opacity="0.5" />
      <circle cx="120" cy="320" r="70" fill="#F1EBDB" opacity="0.8" />

      {/* jalur menanjak */}
      <path
        d="M70 320 C 130 300, 150 230, 210 210 S 300 130, 340 90"
        stroke="#E6DDC8"
        strokeWidth="3"
        strokeDasharray="2 14"
        strokeLinecap="round"
      />

      {/* milestone dots di sepanjang jalur */}
      <circle cx="70" cy="320" r="9" fill="#BD5F40" />
      <circle cx="150" cy="255" r="7" fill="#D97757" />
      <circle cx="230" cy="196" r="7" fill="#D97757" />
      <circle cx="300" cy="130" r="7" fill="#D97757" />
      <circle cx="340" cy="90" r="10" fill="#221D15" />

      {/* topi wisuda, digambar sederhana & elegan */}
      <g transform="translate(255 250)">
        <ellipse cx="45" cy="8" rx="46" ry="14" fill="#221D15" />
        <path d="M0 0 L45 -18 L90 0 L45 18 Z" fill="#221D15" />
        <path d="M45 18 V 46" stroke="#221D15" strokeWidth="3" />
        <circle cx="45" cy="50" r="5" fill="#D97757" />
        <path d="M86 4 V 28" stroke="#D97757" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}
