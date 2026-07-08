import { CreditCard, Landmark } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_ACTIF,
  montantVide,
  type Actif,
  type Passif,
  type TypeActif
} from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

export function SectionPatrimoine({ dossier, patch }: PropsSection) {
  function ajouterActif() {
    const actif: Actif = {
      id: crypto.randomUUID(),
      type: 'livrets',
      libelle: '',
      valeur: montantVide(),
      remarque: ''
    }
    patch({ actifs: [...dossier.actifs, actif] })
  }

  function majActif(id: string, p: Partial<Actif>) {
    patch({ actifs: dossier.actifs.map((a) => (a.id === id ? { ...a, ...p } : a)) })
  }

  function ajouterPassif() {
    const passif: Passif = {
      id: crypto.randomUUID(),
      libelle: '',
      capitalRestantDu: montantVide(),
      mensualite: montantVide(),
      echeance: '',
      remarque: ''
    }
    patch({ passifs: [...dossier.passifs, passif] })
  }

  function majPassif(id: string, p: Partial<Passif>) {
    patch({ passifs: dossier.passifs.map((x) => (x.id === id ? { ...x, ...p } : x)) })
  }

  return (
    <>
      <TitrePage
        titre="Patrimoine"
        sousTitre="Vue détaillée des actifs et engagements du foyer."
      />

      <Carte>
        <div className="titre-groupe">
          <Landmark size={16} />
          Actifs
        </div>
        {dossier.actifs.map((actif) => (
          <div className="element" key={actif.id}>
            <div className="grille">
              <ChampSelect
                label="Type"
                valeur={actif.type}
                options={Object.entries(LIBELLES_ACTIF) as [string, string][]}
                onChange={(v) => majActif(actif.id, { type: (v || 'autre') as TypeActif })}
              />
              <ChampTexte
                label="Libellé"
                valeur={actif.libelle}
                placeholder="Livret A - Crédit Agricole…"
                onChange={(v) => majActif(actif.id, { libelle: v })}
              />
              <ChampMontant
                label="Valeur"
                montant={actif.valeur}
                onChange={(m) => majActif(actif.id, { valeur: m })}
              />
              <ChampTexte
                label="Remarque"
                valeur={actif.remarque}
                onChange={(v) => majActif(actif.id, { remarque: v })}
              />
              <div className="champ">
                <span className="champ-label">&nbsp;</span>
                <button
                  className="lien-retirer"
                  onClick={() =>
                    patch({ actifs: dossier.actifs.filter((a) => a.id !== actif.id) })
                  }
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="bouton-doux ligne-ajout" onClick={ajouterActif}>
          + Ajouter un actif
        </button>

        <div className="titre-groupe terracotta" style={{ marginTop: 28 }}>
          <CreditCard size={16} />
          Passifs (crédits en cours)
        </div>
        {dossier.passifs.map((passif) => (
          <div className="element" key={passif.id}>
            <div className="grille">
              <ChampTexte
                label="Libellé"
                valeur={passif.libelle}
                placeholder="Crédit immobilier résidence principale…"
                onChange={(v) => majPassif(passif.id, { libelle: v })}
              />
              <ChampMontant
                label="Capital restant dû"
                montant={passif.capitalRestantDu}
                onChange={(m) => majPassif(passif.id, { capitalRestantDu: m })}
              />
              <ChampMontant
                label="Mensualité"
                montant={passif.mensualite}
                onChange={(m) => majPassif(passif.id, { mensualite: m })}
              />
              <ChampTexte
                label="Échéance"
                type="date"
                valeur={passif.echeance}
                onChange={(v) => majPassif(passif.id, { echeance: v })}
              />
              <ChampTexte
                label="Remarque"
                valeur={passif.remarque}
                onChange={(v) => majPassif(passif.id, { remarque: v })}
              />
              <div className="champ">
                <span className="champ-label">&nbsp;</span>
                <button
                  className="lien-retirer"
                  onClick={() =>
                    patch({ passifs: dossier.passifs.filter((x) => x.id !== passif.id) })
                  }
                >
                  Retirer
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="bouton-doux ligne-ajout" onClick={ajouterPassif}>
          + Ajouter un crédit
        </button>
      </Carte>
    </>
  )
}
