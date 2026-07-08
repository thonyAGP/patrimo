import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_CONTRAT,
  montantVide,
  type Contrat,
  type TypeContrat
} from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte } from '../composants/champs'

export function SectionContrats({ dossier, patch }: PropsSection) {
  function ajouter() {
    const contrat: Contrat = {
      id: crypto.randomUUID(),
      type: 'assurance_vie',
      compagnie: '',
      libelle: '',
      dateEffet: '',
      encours: montantVide(),
      cotisationMensuelle: montantVide(),
      clauseBeneficiaire: '',
      remarque: ''
    }
    patch({ contrats: [...dossier.contrats, contrat] })
  }

  function maj(id: string, p: Partial<Contrat>) {
    patch({ contrats: dossier.contrats.map((c) => (c.id === id ? { ...c, ...p } : c)) })
  }

  return (
    <div className="section">
      <h2>Contrats existants</h2>
      {dossier.contrats.map((contrat) => (
        <div className="element" key={contrat.id}>
          <div className="grille">
            <ChampSelect
              label="Type"
              valeur={contrat.type}
              options={Object.entries(LIBELLES_CONTRAT) as [string, string][]}
              onChange={(v) => maj(contrat.id, { type: (v || 'autre') as TypeContrat })}
            />
            <ChampTexte
              label="Compagnie"
              valeur={contrat.compagnie}
              onChange={(v) => maj(contrat.id, { compagnie: v })}
            />
            <ChampTexte
              label="Libellé du contrat"
              valeur={contrat.libelle}
              onChange={(v) => maj(contrat.id, { libelle: v })}
            />
            <ChampTexte
              label="Date d'effet"
              type="date"
              valeur={contrat.dateEffet}
              onChange={(v) => maj(contrat.id, { dateEffet: v })}
            />
            <ChampMontant
              label="Encours / capital"
              montant={contrat.encours}
              onChange={(m) => maj(contrat.id, { encours: m })}
            />
            <ChampMontant
              label="Cotisation mensuelle"
              montant={contrat.cotisationMensuelle}
              onChange={(m) => maj(contrat.id, { cotisationMensuelle: m })}
            />
            <ChampTexte
              label="Clause bénéficiaire"
              valeur={contrat.clauseBeneficiaire}
              onChange={(v) => maj(contrat.id, { clauseBeneficiaire: v })}
            />
            <ChampTexte
              label="Remarque"
              valeur={contrat.remarque}
              onChange={(v) => maj(contrat.id, { remarque: v })}
            />
          </div>
          <button
            className="bouton danger ligne-ajout"
            onClick={() => patch({ contrats: dossier.contrats.filter((c) => c.id !== contrat.id) })}
          >
            Retirer
          </button>
        </div>
      ))}
      <button className="bouton discret ligne-ajout" onClick={ajouter}>
        + Ajouter un contrat
      </button>
    </div>
  )
}
