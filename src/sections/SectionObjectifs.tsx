import {
  Armchair,
  Coins,
  Home,
  Percent,
  Shield,
  Sprout,
  Star,
  TrendingUp
} from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_OBJECTIF,
  montantVide,
  type Objectif,
  type TypeObjectif
} from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

const ICONES_OBJECTIF: Record<TypeObjectif, typeof Star> = {
  retraite: Armchair,
  capitalisation: TrendingUp,
  transmission: Sprout,
  protection_famille: Shield,
  fiscalite: Percent,
  revenus_complementaires: Coins,
  projet: Home,
  autre: Star
}

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
    <>
      <TitrePage
        titre="Objectifs du prospect"
        sousTitre="Projets, priorités et horizon patrimonial."
      />

      <Carte>
        {tries.length === 0 && (
          <p style={{ color: 'var(--texte-2)', margin: '0 0 12px' }}>
            Aucun objectif défini pour le moment.
          </p>
        )}
        {tries.map((objectif) => {
          const Icone = ICONES_OBJECTIF[objectif.type]
          return (
            <div className="element" key={objectif.id}>
              <div className="rangee-objectif">
                <span className="icone-objectif">
                  <Icone size={20} color="#a94f24" />
                </span>
                <div className="champs">
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
                        ['1', 'Haute'],
                        ['2', 'Moyenne'],
                        ['3', 'Faible']
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
                    <div className="champ">
                      <span className="champ-label">&nbsp;</span>
                      <button
                        className="lien-retirer"
                        onClick={() =>
                          patch({
                            objectifs: dossier.objectifs.filter((o) => o.id !== objectif.id)
                          })
                        }
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <button className="bouton-doux ligne-ajout" onClick={ajouter}>
          + Ajouter un objectif
        </button>
      </Carte>
    </>
  )
}
