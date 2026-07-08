// Petites illustrations éditoriales plates dans la palette Patrimo
// (ivoire, bleu pétrole, terracotta, vert sauge) — formes simples, traits fins.

export function IllustrationMaison() {
  return (
    <svg width="140" height="84" viewBox="0 0 140 84" role="presentation">
      <ellipse cx="70" cy="76" rx="62" ry="6" fill="#e3ece4" />
      <path d="M10 70q18-14 36-8t30-4q22-12 54 4v8H10Z" fill="#87a58d" opacity="0.5" />
      <rect x="52" y="38" width="40" height="32" rx="2" fill="#f5ded1" />
      <path d="M46 42 72 20l26 22Z" fill="#d66a3a" />
      <rect x="66" y="52" width="12" height="18" rx="1" fill="#174c56" />
      <rect x="58" y="46" width="8" height="8" rx="1" fill="#dde9e8" />
      <rect x="80" y="46" width="8" height="8" rx="1" fill="#dde9e8" />
      <circle cx="118" cy="22" r="9" fill="#f4a261" opacity="0.7" />
      <path d="M24 70V52m0 0q-8-2-8-12 8 0 8 8 0-12 10-14 2 12-10 18Z" fill="none" stroke="#5e7f65" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export function IllustrationPlante() {
  return (
    <svg width="140" height="84" viewBox="0 0 140 84" role="presentation">
      <ellipse cx="70" cy="78" rx="50" ry="5" fill="#e3ece4" />
      <path d="M58 76h24l4-22H54Z" fill="#d66a3a" />
      <rect x="52" y="50" width="36" height="6" rx="3" fill="#a94f24" />
      <path d="M70 50V32m0 0q-14-2-16-18 16 2 16 18Zm0 0q2-16 18-18-2 16-18 18Z" fill="none" stroke="#5e7f65" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 44q-8 0-10-10 10 0 10 10Z" fill="#87a58d" />
      <circle cx="106" cy="26" r="7" fill="#dde9e8" />
      <circle cx="30" cy="36" r="5" fill="#f5ded1" />
    </svg>
  )
}

export function IllustrationCible() {
  return (
    <svg width="140" height="84" viewBox="0 0 140 84" role="presentation">
      <ellipse cx="70" cy="78" rx="50" ry="5" fill="#e3ece4" />
      <circle cx="70" cy="42" r="30" fill="#f5ded1" />
      <circle cx="70" cy="42" r="20" fill="#f8f5ef" />
      <circle cx="70" cy="42" r="11" fill="#d66a3a" />
      <circle cx="70" cy="42" r="4" fill="#174c56" />
      <path d="M70 42 98 16" stroke="#174c56" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M96 10l8 2-4 8-6-4Z" fill="#87a58d" />
      <path d="M22 66q6-10 14-6" fill="none" stroke="#5e7f65" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function MiniCourbe({ couleur }: { couleur: string }) {
  return (
    <svg width="64" height="26" viewBox="0 0 64 26" role="presentation" className="courbe">
      <path
        d="M2 20c8-2 12-10 20-8s12 8 20-4 14-4 20-6"
        fill="none"
        stroke={couleur}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AnneauProgression({
  faites,
  total
}: {
  faites: number
  total: number
}) {
  const rayon = 42
  const circonference = 2 * Math.PI * rayon
  const fraction = total === 0 ? 0 : faites / total

  return (
    <svg
      width="110"
      height="110"
      viewBox="0 0 110 110"
      role="img"
      aria-label={`${faites} étapes complétées sur ${total}`}
    >
      <circle cx="55" cy="55" r={rayon} fill="none" stroke="#e5e0d8" strokeWidth="9" />
      <circle
        cx="55"
        cy="55"
        r={rayon}
        fill="none"
        stroke="#5e7f65"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${fraction * circonference} ${circonference}`}
        transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dasharray 300ms ease' }}
      />
      <text x="55" y="62" textAnchor="middle" className="fraction">
        {faites}/{total}
      </text>
    </svg>
  )
}
