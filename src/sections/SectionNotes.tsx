import { NotebookPen, Trash2 } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import type { NoteRdv } from '../domaine/types'
import { ChampTexte, ChampZone } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

export function SectionNotes({ dossier, patch }: PropsSection) {
  function ajouter() {
    const note: NoteRdv = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      texte: ''
    }
    patch({ notes: [note, ...dossier.notes] })
  }

  function maj(id: string, p: Partial<NoteRdv>) {
    patch({ notes: dossier.notes.map((n) => (n.id === id ? { ...n, ...p } : n)) })
  }

  return (
    <>
      <TitrePage
        titre="Notes du rendez-vous"
        sousTitre="Informations complémentaires et points importants."
      />

      <button className="bouton" onClick={ajouter} style={{ marginBottom: 18 }}>
        <NotebookPen size={17} />
        Nouvelle note
      </button>

      {dossier.notes.length === 0 && (
        <div className="vide">
          Votre carnet est vide pour ce dossier.
          <br />
          Créez une note pour garder la trace du rendez-vous et des prochaines étapes.
        </div>
      )}

      {dossier.notes.map((note) => (
        <Carte key={note.id}>
          <div className="element-entete" style={{ marginBottom: 14 }}>
            <span className="titre">
              <NotebookPen size={17} />
              Note du{' '}
              {note.date
                ? new Date(note.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : '—'}
            </span>
            <button
              className="bouton-icone"
              aria-label="Supprimer cette note"
              onClick={() => patch({ notes: dossier.notes.filter((n) => n.id !== note.id) })}
            >
              <Trash2 size={17} />
            </button>
          </div>
          <div className="grille">
            <ChampTexte
              label="Date"
              type="date"
              valeur={note.date}
              onChange={(v) => maj(note.id, { date: v })}
            />
            <ChampZone
              label="Compte-rendu / prochaines étapes"
              valeur={note.texte}
              lignes={6}
              onChange={(v) => maj(note.id, { texte: v })}
            />
          </div>
        </Carte>
      ))}
    </>
  )
}
