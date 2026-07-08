import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LIBELLES_SYNC, useEtatSync } from '../sync/sync'
import { CoinConseiller } from './Conseiller'

// Coquille commune : sidebar claire à gauche, header compact en haut.
// En tablette portrait la sidebar se replie en rail d'icônes ; sur mobile
// elle disparaît au profit des onglets horizontaux (`ongletsMobiles`).

export function Coquille(props: {
  sidebar?: ReactNode
  breadcrumb: ReactNode
  etatSauvegarde?: ReactNode
  ongletsMobiles?: ReactNode
  children: ReactNode
}) {
  const { etat } = useEtatSync()

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to="/" className="logo" aria-label="Patrimo — retour aux dossiers">
          <span className="logo-complet">
            patri<span>mo</span>
          </span>
          <span className="logo-mini" aria-hidden="true">
            p<span>.</span>
          </span>
        </Link>
        {props.sidebar}
      </aside>
      <div className="zone-principale">
        <header className="header">
          <div className="breadcrumb">{props.breadcrumb}</div>
          <div className="espace" />
          {props.etatSauvegarde}
          <span
            className={`indicateur-etat ${etat === 'synchronise' ? '' : 'attention'}`}
            title="État de la synchronisation"
          >
            <span className="point" />
            {LIBELLES_SYNC[etat]}
          </span>
          <CoinConseiller />
        </header>
        {props.ongletsMobiles}
        <main className="contenu">{props.children}</main>
      </div>
    </div>
  )
}

export function TitrePage(props: { titre: string; sousTitre?: string }) {
  return (
    <div className="titre-page">
      <h2>{props.titre}</h2>
      {props.sousTitre && <p className="sous-titre">{props.sousTitre}</p>}
    </div>
  )
}

export function Carte(props: {
  titre?: string
  icone?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="carte">
      {props.titre && (
        <h3 className="carte-titre">
          {props.icone && <span className="pictogramme">{props.icone}</span>}
          {props.titre}
        </h3>
      )}
      {props.children}
    </section>
  )
}
