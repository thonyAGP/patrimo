import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_ACTIF,
  LIBELLES_CONTRAT,
  LIBELLES_OBJECTIF,
  type Dossier,
  type Montant
} from '../domaine/types'
import { formaterEuros } from '../composants/champs'

const somme = (montants: Montant[]) =>
  montants.reduce((total, m) => total + (m.valeur ?? 0), 0)

// Toute donnée marquée « à obtenir » devient une pièce à demander au prospect.
function piecesAObtenir(dossier: Dossier): string[] {
  const pieces: string[] = []
  const verifier = (m: Montant, libelle: string) => {
    if (m.statut === 'a_obtenir') pieces.push(libelle)
  }

  verifier(dossier.situationPro.revenuNetMensuel, 'Revenu net mensuel (bulletin de salaire / avis d’imposition)')
  verifier(dossier.situationPro.revenuConjointMensuel, 'Revenu du conjoint')
  verifier(dossier.situationPro.autresRevenusMensuels, 'Justificatif des autres revenus')
  verifier(dossier.budget.chargesMensuelles, 'Détail des charges mensuelles')
  verifier(dossier.budget.epargneMensuelleActuelle, 'Relevés d’épargne mensuelle')
  dossier.actifs.forEach((a) =>
    verifier(a.valeur, `Valeur de : ${a.libelle || LIBELLES_ACTIF[a.type]}`)
  )
  dossier.passifs.forEach((p) => {
    verifier(p.capitalRestantDu, `Tableau d’amortissement : ${p.libelle || 'crédit'}`)
    verifier(p.mensualite, `Mensualité : ${p.libelle || 'crédit'}`)
  })
  dossier.contrats.forEach((c) => {
    const nom = c.libelle || LIBELLES_CONTRAT[c.type]
    verifier(c.encours, `Relevé de situation : ${nom}`)
    verifier(c.cotisationMensuelle, `Cotisation : ${nom}`)
  })
  return pieces
}

export function SectionSynthese({ dossier }: PropsSection) {
  const totalActifs = somme(dossier.actifs.map((a) => a.valeur))
  const totalPassifs = somme(dossier.passifs.map((p) => p.capitalRestantDu))
  const totalContrats = somme(dossier.contrats.map((c) => c.encours))
  const patrimoineNet = totalActifs + totalContrats - totalPassifs
  const pieces = piecesAObtenir(dossier)
  const objectifsPrioritaires = [...dossier.objectifs].sort((a, b) => a.priorite - b.priorite)

  return (
    <div className="section">
      <h2>Synthèse</h2>

      <div className="tuiles">
        <div className="tuile">
          <div className="valeur">{formaterEuros(totalActifs)}</div>
          <div className="libelle">Total actifs</div>
        </div>
        <div className="tuile">
          <div className="valeur">{formaterEuros(totalContrats)}</div>
          <div className="libelle">Encours contrats</div>
        </div>
        <div className="tuile">
          <div className="valeur">{formaterEuros(totalPassifs)}</div>
          <div className="libelle">Total passifs</div>
        </div>
        <div className="tuile">
          <div className="valeur">{formaterEuros(patrimoineNet)}</div>
          <div className="libelle">Patrimoine net estimé</div>
        </div>
      </div>

      <h3>Objectifs priorisés</h3>
      {objectifsPrioritaires.length === 0 && <p>Aucun objectif saisi pour le moment.</p>}
      <ol>
        {objectifsPrioritaires.map((o) => (
          <li key={o.id}>
            <strong>{LIBELLES_OBJECTIF[o.type]}</strong>
            {o.montantCible.valeur !== null && ` — cible ${formaterEuros(o.montantCible.valeur)}`}
            {o.horizon &&
              ` (${o.horizon === 'court' ? 'court' : o.horizon === 'moyen' ? 'moyen' : 'long'} terme)`}
            {o.description && ` — ${o.description}`}
          </li>
        ))}
      </ol>

      <h3>Pièces à obtenir du prospect</h3>
      {pieces.length === 0 ? (
        <p>Aucune — toutes les données sont confirmées ou estimées.</p>
      ) : (
        <ul className="liste-pieces">
          {pieces.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
