import { Euro, MessageSquareText, PiggyBank, Wallet } from 'lucide-react'
import { MiniCourbe } from '../composants/Illustrations'
import type { PropsSection } from '../pages/PageDossier'
import type { Budget } from '../domaine/types'
import { ChampMontant, ChampZone, formaterEuros } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

export function SectionBudget({ dossier, patch }: PropsSection) {
  const b = dossier.budget
  const sp = dossier.situationPro
  const maj = (p: Partial<Budget>) => patch({ budget: { ...b, ...p } })

  const revenus =
    (sp.revenuNetMensuel.valeur ?? 0) +
    (sp.revenuConjointMensuel.valeur ?? 0) +
    (sp.autresRevenusMensuels.valeur ?? 0)

  return (
    <>
      <TitrePage titre="Budget" sousTitre="Analyse des revenus et dépenses du foyer." />

      <div className="tuiles">
        <div className="tuile">
          <span className="picto-tuile">
            <Euro size={18} />
          </span>
          <div className="valeur">{formaterEuros(revenus || null)}</div>
          <div className="libelle">Revenus mensuels (section Situation pro)</div>
          <MiniCourbe couleur="#174c56" />
        </div>
        <div className="tuile terracotta">
          <span className="picto-tuile">
            <Wallet size={18} />
          </span>
          <div className="valeur">{formaterEuros(b.chargesMensuelles.valeur)}</div>
          <div className="libelle">Charges mensuelles</div>
          <MiniCourbe couleur="#d66a3a" />
        </div>
        <div className="tuile sauge">
          <span className="picto-tuile">
            <PiggyBank size={18} />
          </span>
          <div className="valeur">{formaterEuros(b.capaciteEpargneMensuelle.valeur)}</div>
          <div className="libelle">Capacité d'épargne envisagée</div>
          <MiniCourbe couleur="#87a58d" />
        </div>
      </div>

      <Carte titre="Flux mensuels" icone={<Wallet size={18} />}>
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
      </Carte>

      <Carte titre="Commentaire" icone={<MessageSquareText size={18} />}>
        <div className="grille">
          <ChampZone
            label="Précisions utiles"
            valeur={b.commentaire}
            onChange={(v) => maj({ commentaire: v })}
          />
        </div>
      </Carte>
    </>
  )
}
