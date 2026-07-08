import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_OBJECTIF,
  montantVide,
  type Objectif,
  type TypeObjectif
} from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte } from '../composants/champs'

export function SectionObjectifs({ dossier, patch }: PropsSection) {
  function ajouter() {
    const objectif: Objectif = {
      id: crypto.randomUUID(),
      type: 'retraite',
      description: '',
      horizon: '',
      montantCible: montantVide(),
      priorite: 2
    }
    patch({ objectifs: [...dossier.objectifs, objectif] })
  }

  function maj(id: string, p: Partial<Objectif>) {
    patch({ objectifs: dossier.objectifs.map((o) => (o.id === id ? { ...o, ...p } : o)) })
  }

  const tries = [...dossier.objectifs].sort((a, b) => a.priorite - b.priorite)

  return (
    <div className="section">
      <h2>Objectifs du prospect</h2>
      {tries.map((objectif) => (
        <div className="element" key={objectif.id}>
          <div className="grille">
            <ChampSelect
              label="Objectif"
              valeur={objectif.type}
              options={Object.entries(LIBELLES_OBJECTIF) as [string, string][]}
              onChange={(v) => maj(objectif.id, { type: (v || 'autre') as TypeObjectif })}
            />
            <ChampSelect
              label="Priorité"
              valeur={String(objectif.priorite)}
              options={[
                ['1', '1 — Prioritaire'],
                ['2', '2 — Important'],
                ['3', '3 — Secondaire']
              ]}
              onChange={(v) =>
                maj(objectif.id, { priorite: (Number(v) || 2) as Objectif['priorite'] })
              }
            />
            <ChampSelect
              label="Horizon"
              valeur={objectif.horizon}
              options={[
                ['court', 'Court terme (< 3 ans)'],
                ['moyen', 'Moyen terme (3-8 ans)'],
                ['long', 'Long terme (> 8 ans)']
              ]}
              onChange={(v) => maj(objectif.id, { horizon: v as Objectif['horizon'] })}
            />
            <ChampMontant
              label="Montant cible"
              montant={objectif.montantCible}
              onChange={(m) => maj(objectif.id, { montantCible: m })}
            />
            <ChampTexte
              label="Description / précisions"
              valeur={objectif.description}
              onChange={(v) => maj(objectif.id, { description: v })}
            />
          </div>
          <button
            className="bouton danger ligne-ajout"
            onClick={() =>
              patch({ objectifs: dossier.objectifs.filter((o) => o.id !== objectif.id) })
            }
          >
            Retirer
          </button>
        </div>
      ))}
      <button className="bouton discret ligne-ajout" onClick={ajouter}>
        + Ajouter un objectif
      </button>
    </div>
  )
}
