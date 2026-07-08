import type { PropsSection } from '../pages/PageDossier'
import type { Budget } from '../domaine/types'
import { ChampMontant, ChampZone, formaterEuros } from '../composants/champs'

export function SectionBudget({ dossier, patch }: PropsSection) {
  const b = dossier.budget
  const sp = dossier.situationPro
  const maj = (p: Partial<Budget>) => patch({ budget: { ...b, ...p } })

  const revenus =
    (sp.revenuNetMensuel.valeur ?? 0) +
    (sp.revenuConjointMensuel.valeur ?? 0) +
    (sp.autresRevenusMensuels.valeur ?? 0)
  const resteAVivre = revenus - (b.chargesMensuelles.valeur ?? 0)

  return (
    <div className="section">
      <h2>Budget & flux</h2>
      <div className="tuiles">
        <div className="tuile">
          <div className="valeur">{formaterEuros(revenus || null)}</div>
          <div className="libelle">Revenus mensuels du foyer (section Situation pro)</div>
        </div>
        <div className="tuile">
          <div className="valeur">{formaterEuros(revenus ? resteAVivre : null)}</div>
          <div className="libelle">Reste après charges</div>
        </div>
      </div>
      <div className="grille">
        <ChampMontant
          label="Charges mensuelles (dont crédits)"
          montant={b.chargesMensuelles}
          onChange={(m) => maj({ chargesMensuelles: m })}
        />
        <ChampMontant
          label="Épargne mensuelle actuelle"
          montant={b.epargneMensuelleActuelle}
          onChange={(m) => maj({ epargneMensuelleActuelle: m })}
        />
        <ChampMontant
          label="Capacité d'épargne envisagée"
          montant={b.capaciteEpargneMensuelle}
          onChange={(m) => maj({ capaciteEpargneMensuelle: m })}
        />
      </div>
      <div className="grille" style={{ marginTop: 16 }}>
        <ChampZone
          label="Commentaire"
          valeur={b.commentaire}
          onChange={(v) => maj({ commentaire: v })}
        />
      </div>
    </div>
  )
}
