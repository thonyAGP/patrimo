// Avatar illustré de François, le conseiller — style éditorial sobre et plat,
// remplaçable plus tard par une vraie photo dans le même emplacement.

export function AvatarFrancois({ taille = 40 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 48 48"
      role="img"
      aria-label="François, conseiller patrimonial"
    >
      <circle cx="24" cy="24" r="24" fill="#dde9e8" />
      <path d="M24 13a7.4 7.4 0 0 1 7.4 7.4c0 4.1-3.3 7.6-7.4 7.6s-7.4-3.5-7.4-7.6A7.4 7.4 0 0 1 24 13Z" fill="#e8b28e" />
      <path d="M16.4 20a7.6 7.6 0 0 1 15.2 0c0-1.1-.5-4.5-1.9-5.8-1-2-3.1-3.2-5.7-3.2s-4.7 1.2-5.7 3.2c-1.4 1.3-1.9 4.7-1.9 5.8Z" fill="#3c3129" />
      <path d="M8 48a16 16 0 0 1 32 0Z" fill="#174c56" />
      <path d="M20 39h8l-4 6z" fill="#f8f5ef" />
    </svg>
  )
}

export function CoinConseiller() {
  return (
    <div className="conseiller">
      <div className="avatar">
        <AvatarFrancois />
      </div>
      <div className="infos">
        <div className="nom">François</div>
        <div className="role">Conseiller patrimonial</div>
      </div>
    </div>
  )
}
