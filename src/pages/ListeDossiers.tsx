import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { BellRing, FolderOpen, Plus, Target } from 'lucide-react'
import { db, sauverDossier } from '../db/db'
import { LIBELLES_PIPELINE, nouveauDossier, type StatutPipeline } from '../domaine/types'
import { Coquille, TitrePage } from '../composants/Coquille'

const CLASSE_BADGE: Partial<Record<StatutPipeline, string>> = {
  client: 'sauge',
  sans_suite: 'danger',
  proposition: 'terracotta'
}

export function ListeDossiers() {
  const [recherche, setRecherche] = useState('')
  const navigate = useNavigate()

  const dossiers = useLiveQuery(
    () => db.dossiers.orderBy('modifieLe').reverse().toArray(),
    []
  )

  const filtres = (dossiers ?? []).filter((d) => {
    const nomComplet = `${d.etatCivil.prenom} ${d.etatCivil.nom}`.toLowerCase()
    return nomComplet.includes(recherche.toLowerCase().trim())
  })

  async function creerDossier() {
    const dossier = nouveauDossier()
    await sauverDossier(dossier)
    navigate(`/dossier/${dossier.id}`)
  }

  const sidebar = (
    <nav className="nav-sections">
      <Link to="/" className="actif">
        <FolderOpen size={20} />
        <span className="libelle-nav">Dossiers</span>
      </Link>
    </nav>
  )

  return (
    <Coquille sidebar={sidebar} breadcrumb={<strong>Dossiers</strong>}>
      <TitrePage
        titre="Dossiers"
        sousTitre="Retrouvez vos prospects et clients, ou ouvrez un nouveau dossier de découverte."
      />

      <div className="barre-outils">
        <input
          type="search"
          placeholder="Rechercher un prospect…"
          aria-label="Rechercher un prospect"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <button className="bouton" onClick={creerDossier}>
          <Plus size={18} />
          Nouveau dossier
        </button>
      </div>

      {dossiers && filtres.length === 0 && (
        <div className="vide">
          {dossiers.length === 0
            ? 'Aucun dossier pour le moment. Créez le premier avant votre prochain rendez-vous.'
            : 'Aucun dossier ne correspond à la recherche.'}
        </div>
      )}

      {filtres.map((d) => {
        const nom =
          `${d.etatCivil.prenom} ${d.etatCivil.nom}`.trim() || 'Dossier sans nom'
        const initiales =
          `${d.etatCivil.prenom.charAt(0)}${d.etatCivil.nom.charAt(0)}`.toUpperCase() || '·'
        return (
          <Link key={d.id} to={`/dossier/${d.id}`} className="carte-dossier">
            <span className="initiales">{initiales}</span>
            <span className="corps">
              <span className="nom">{nom}</span>
              <span className="meta">
                <span className={`badge ${CLASSE_BADGE[d.statutPipeline] ?? ''}`}>
                  {LIBELLES_PIPELINE[d.statutPipeline]}
                </span>
                <span>
                  Modifié le{' '}
                  {new Date(d.modifieLe).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                {d.objectifs.length > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Target size={14} />
                    {d.objectifs.length} objectif{d.objectifs.length > 1 ? 's' : ''}
                  </span>
                )}
                {d.relance && (
                  <span
                    className={`badge ${
                      d.relance <= new Date().toISOString().slice(0, 10)
                        ? 'danger'
                        : 'terracotta'
                    }`}
                  >
                    <BellRing size={13} />
                    {d.relance <= new Date().toISOString().slice(0, 10)
                      ? 'Relance due'
                      : 'Relance'}{' '}
                    le{' '}
                    {new Date(d.relance + 'T00:00:00').toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                )}
              </span>
            </span>
          </Link>
        )
      })}
    </Coquille>
  )
}
