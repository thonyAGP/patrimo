import type { Dossier } from './types'

// Complétude du dossier : une section de saisie est « complétée » quand ses
// informations clés sont renseignées. Calcul purement dérivé des données
// existantes — aucun champ supplémentaire n'est stocké.

export interface EtapeCompletude {
  cle: string
  libelle: string
  complete: boolean
}

export function completude(d: Dossier): { etapes: EtapeCompletude[]; pourcentage: number } {
  const ec = d.etatCivil
  const sp = d.situationPro

  const etapes: EtapeCompletude[] = [
    {
      cle: 'etat-civil',
      libelle: 'État civil & foyer',
      complete: Boolean(ec.nom && ec.prenom && ec.dateNaissance && ec.situationFamiliale)
    },
    {
      cle: 'pro',
      libelle: 'Situation pro',
      complete: Boolean(sp.profession && sp.statut && sp.revenuNetMensuel.valeur !== null)
    },
    { cle: 'patrimoine', libelle: 'Patrimoine', complete: d.actifs.length > 0 },
    { cle: 'contrats', libelle: 'Contrats', complete: d.contrats.length > 0 },
    {
      cle: 'budget',
      libelle: 'Budget',
      complete:
        d.budget.chargesMensuelles.valeur !== null ||
        d.budget.capaciteEpargneMensuelle.valeur !== null
    },
    { cle: 'objectifs', libelle: 'Objectifs', complete: d.objectifs.length > 0 },
    {
      cle: 'notes',
      libelle: 'Notes RDV',
      complete: d.notes.some((n) => n.texte.trim().length > 0)
    }
  ]

  const faites = etapes.filter((e) => e.complete).length
  return { etapes, pourcentage: Math.round((faites / etapes.length) * 100) }
}
