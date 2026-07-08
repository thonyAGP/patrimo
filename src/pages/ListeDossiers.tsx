import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, sauverDossier } from '../db/db'
import { LIBELLES_PIPELINE, nouveauDossier } from '../domaine/types'

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

  return (
    <>
      <div className="barre-outils">
        <input
          type="search"
          placeholder="Rechercher un prospect…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <button className="bouton primaire" onClick={creerDossier}>
          + Nouveau dossier
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
        return (
          <Link key={d.id} to={`/dossier/${d.id}`} className="carte-dossier">
            <div className="nom">{nom}</div>
            <div className="meta">
              <span className={`badge ${d.statutPipeline}`}>
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
                <span>
                  {d.objectifs.length} objectif{d.objectifs.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </>
  )
}
