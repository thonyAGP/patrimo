import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, Image as ImageIcon, Paperclip } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_CATEGORIE_DOCUMENT,
  type CategorieDocument,
  type DocumentPhoto
} from '../domaine/types'
import { db, sauverDocument, supprimerDocument } from '../db/db'
import { compresserImage } from '../domaine/images'
import { ChampSelect, ChampTexte } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

function VignetteDocument({
  document,
  onOuvrir,
  onMaj,
  onSupprimer
}: {
  document: DocumentPhoto
  onOuvrir: (url: string) => void
  onMaj: (p: Partial<DocumentPhoto>) => void
  onSupprimer: () => void
}) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const u = URL.createObjectURL(document.donnees)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [document.donnees])

  return (
    <div className="doc-vignette">
      <button
        className="doc-apercu"
        onClick={() => url && onOuvrir(url)}
        aria-label={`Agrandir ${document.libelle || 'le document'}`}
      >
        {url && <img src={url} alt={document.libelle || 'Document'} />}
      </button>
      <div style={{ display: 'grid', gap: 8, padding: '10px 2px 2px' }}>
        <ChampTexte
          label="Libellé"
          valeur={document.libelle}
          placeholder="Avis d'imposition 2025…"
          onChange={(v) => onMaj({ libelle: v })}
        />
        <ChampSelect
          label="Catégorie"
          valeur={document.categorie}
          options={Object.entries(LIBELLES_CATEGORIE_DOCUMENT) as [string, string][]}
          onChange={(v) => onMaj({ categorie: (v || 'autre') as CategorieDocument })}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12.5,
            color: 'var(--texte-2)'
          }}
        >
          Ajouté le {new Date(document.creeLe).toLocaleDateString('fr-FR')}
          <button className="lien-retirer" onClick={onSupprimer}>
            Retirer
          </button>
        </div>
      </div>
    </div>
  )
}

export function SectionDocuments({ dossier }: PropsSection) {
  const refCamera = useRef<HTMLInputElement>(null)
  const refGalerie = useRef<HTMLInputElement>(null)
  const [agrandi, setAgrandi] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)

  const documents = useLiveQuery(
    () => db.documents.where('dossierId').equals(dossier.id).toArray(),
    [dossier.id]
  )

  async function ajouterFichiers(fichiers: FileList | null) {
    if (!fichiers || fichiers.length === 0) return
    setEnCours(true)
    try {
      for (const fichier of Array.from(fichiers)) {
        const donnees = await compresserImage(fichier)
        await sauverDocument({
          id: crypto.randomUUID(),
          dossierId: dossier.id,
          libelle: '',
          categorie: 'autre',
          mime: 'image/jpeg',
          donnees,
          creeLe: new Date().toISOString()
        })
      }
    } finally {
      setEnCours(false)
      if (refCamera.current) refCamera.current.value = ''
      if (refGalerie.current) refGalerie.current.value = ''
    }
  }

  async function maj(doc: DocumentPhoto, p: Partial<DocumentPhoto>) {
    await sauverDocument({ ...doc, ...p })
  }

  async function supprimer(doc: DocumentPhoto) {
    if (window.confirm(`Supprimer ${doc.libelle || 'ce document'} ?`)) {
      await supprimerDocument(doc)
    }
  }

  return (
    <>
      <TitrePage
        titre="Documents"
        sousTitre="Photos des pièces du prospect — avis d'imposition, relevés, contrats…"
      />

      <Carte>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            ref={refCamera}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={(e) => ajouterFichiers(e.target.files)}
          />
          <input
            ref={refGalerie}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => ajouterFichiers(e.target.files)}
          />
          <button
            className="bouton"
            onClick={() => refCamera.current?.click()}
            disabled={enCours}
          >
            <Camera size={18} />
            Prendre une photo
          </button>
          <button
            className="bouton-doux"
            onClick={() => refGalerie.current?.click()}
            disabled={enCours}
          >
            <ImageIcon size={18} />
            Ajouter depuis la galerie
          </button>
          {enCours && (
            <span style={{ alignSelf: 'center', color: 'var(--texte-2)', fontSize: 13.5 }}>
              Compression en cours…
            </span>
          )}
        </div>

        {documents && documents.length === 0 && (
          <div className="vide">
            <Paperclip size={22} style={{ color: 'var(--texte-2)' }} />
            <br />
            Aucun document pour le moment.
            <br />
            Photographiez les pièces remises par le prospect : elles restent stockées sur la
            tablette, compressées automatiquement.
          </div>
        )}

        <div className="grille-documents">
          {(documents ?? [])
            .slice()
            .sort((a, b) => b.creeLe.localeCompare(a.creeLe))
            .map((doc) => (
              <VignetteDocument
                key={doc.id}
                document={doc}
                onOuvrir={setAgrandi}
                onMaj={(p) => maj(doc, p)}
                onSupprimer={() => supprimer(doc)}
              />
            ))}
        </div>
      </Carte>

      {agrandi && (
        <button
          type="button"
          className="visionneuse"
          onClick={() => setAgrandi(null)}
          aria-label="Fermer l'aperçu"
        >
          <img src={agrandi} alt="Document agrandi" />
        </button>
      )}
    </>
  )
}
