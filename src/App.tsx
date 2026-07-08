import { Link, Outlet } from 'react-router-dom'
import { LIBELLES_SYNC, useEtatSync } from './sync/sync'

export function App() {
  const { etat, enAttente } = useEtatSync()

  return (
    <>
      <header className="entete">
        <Link to="/">
          <h1>Patrimo</h1>
        </Link>
        <div className="espace" />
        <span className={`pastille-sync ${etat}`}>
          {LIBELLES_SYNC[etat]}
          {etat === 'en_attente' ? ` (${enAttente})` : ''}
        </span>
      </header>
      <main className="contenu">
        <Outlet />
      </main>
    </>
  )
}
