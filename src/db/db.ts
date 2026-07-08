import Dexie, { type Table } from 'dexie'
import type { Dossier } from '../domaine/types'

// Journal d'opérations : chaque écriture locale est tracée pour être rejouée
// vers le serveur lors de la synchronisation (Phase 1.5 — voir src/sync).
export interface Operation {
  seq?: number
  dossierId: string
  type: 'upsert' | 'suppression'
  horodatage: string
  synchronisee: 0 | 1
}

class PatrimoDB extends Dexie {
  dossiers!: Table<Dossier, string>
  operations!: Table<Operation, number>

  constructor() {
    super('patrimo')
    this.version(1).stores({
      dossiers: 'id, modifieLe, statutPipeline',
      operations: '++seq, synchronisee'
    })
  }
}

export const db = new PatrimoDB()

export async function sauverDossier(dossier: Dossier): Promise<void> {
  const horodatage = new Date().toISOString()
  const aEnregistrer = { ...dossier, modifieLe: horodatage }
  await db.transaction('rw', db.dossiers, db.operations, async () => {
    await db.dossiers.put(aEnregistrer)
    await db.operations.add({
      dossierId: dossier.id,
      type: 'upsert',
      horodatage,
      synchronisee: 0
    })
  })
}

export async function supprimerDossier(id: string): Promise<void> {
  const horodatage = new Date().toISOString()
  await db.transaction('rw', db.dossiers, db.operations, async () => {
    await db.dossiers.delete(id)
    await db.operations.add({
      dossierId: id,
      type: 'suppression',
      horodatage,
      synchronisee: 0
    })
  })
}
