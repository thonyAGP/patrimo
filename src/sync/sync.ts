// Moteur de synchronisation — squelette Phase 1.
//
// Principe local-first : la tablette est la source de vérité pendant le
// rendez-vous ; toutes les écritures passent par le journal d'opérations
// (table `operations`). Quand un backend sera configuré (Supabase, région UE),
// ce module poussera les opérations non synchronisées puis les marquera
// `synchronisee = 1`.
//
// Tant que VITE_SYNC_URL n'est pas défini, l'application fonctionne en mode
// « local uniquement » : rien n'est perdu, tout est prêt à être rejoué.

import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

const SYNC_URL: string | undefined = import.meta.env.VITE_SYNC_URL

export type EtatSync = 'hors_ligne' | 'local_uniquement' | 'synchronise' | 'en_attente'

export function useEtatSync(): { etat: EtatSync; enAttente: number } {
  const [enLigne, setEnLigne] = useState(navigator.onLine)

  useEffect(() => {
    const majEnLigne = () => setEnLigne(navigator.onLine)
    window.addEventListener('online', majEnLigne)
    window.addEventListener('offline', majEnLigne)
    return () => {
      window.removeEventListener('online', majEnLigne)
      window.removeEventListener('offline', majEnLigne)
    }
  }, [])

  const enAttente =
    useLiveQuery(() => db.operations.where('synchronisee').equals(0).count(), []) ?? 0

  if (!enLigne) return { etat: 'hors_ligne', enAttente }
  if (!SYNC_URL) return { etat: 'local_uniquement', enAttente }
  return { etat: enAttente > 0 ? 'en_attente' : 'synchronise', enAttente }
}

export const LIBELLES_SYNC: Record<EtatSync, string> = {
  hors_ligne: 'Hors ligne — saisie locale',
  local_uniquement: 'Local uniquement',
  synchronise: 'Synchronisé',
  en_attente: 'Synchronisation…'
}
