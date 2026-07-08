import {
  LIBELLES_ACTIF,
  LIBELLES_CONTRAT,
  type Dossier,
  type Montant
} from './types'

// Toute donnée marquée « à obtenir » devient une pièce à demander au prospect.
export function piecesAObtenir(dossier: Dossier): string[] {
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
