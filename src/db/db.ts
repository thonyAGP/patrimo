import Dexie, { type Table } from 'dexie'
import type { DocumentPhoto, Dossier } from '../domaine/types'

// Journal d'opérations : chaque écriture locale est tracée pour être rejouée
// vers le serveur lors de la synchronisation (Phase 1.5 — voir src/sync).
export interface Operation {
  seq?: number
  dossierId: string
  type: 'upsert' | 'suppression' | 'doc_upsert' | 'doc_suppression'
  cibleId?: string // id du document concerné pour les opérations doc_*
  horodatage: string
  synchronisee: 0 | 1
}

class PatrimoDB extends Dexie {
  dossiers!: Table<Dossier, string>
  operations!: Table<Operation, number>
  documents!: Table<DocumentPhoto, string>

  constructor() {
    super('patrimo')
    this.version(1).stores({
      dossiers: 'id, modifieLe, statutPipeline',
      operations: '++seq, synchronisee'
    })
    // Phase 2 : photos de documents, stockées à part des dossiers.
    this.version(2).stores({
      documents: 'id, dossierId'
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
  await db.transaction('rw', db.dossiers, db.operations, db.documents, async () => {
    await db.dossiers.delete(id)
    await db.documents.where('dossierId').equals(id).delete()
    await db.operations.add({
      dossierId: id,
      type: 'suppression',
      horodatage,
      synchronisee: 0
    })
  })
}

export async function sauverDocument(document: DocumentPhoto): Promise<void> {
  const horodatage = new Date().toISOString()
  await db.transaction('rw', db.documents, db.operations, async () => {
    await db.documents.put(document)
    await db.operations.add({
      dossierId: document.dossierId,
      type: 'doc_upsert',
      cibleId: document.id,
      horodatage,
      synchronisee: 0
    })
  })
}

export async function supprimerDocument(document: DocumentPhoto): Promise<void> {
  const horodatage = new Date().toISOString()
  await db.transaction('rw', db.documents, db.operations, async () => {
    await db.documents.delete(document.id)
    await db.operations.add({
      dossierId: document.dossierId,
      type: 'doc_suppression',
      cibleId: document.id,
      horodatage,
      synchronisee: 0
    })
  })
}
