import type { PropsSection } from '../pages/PageDossier'
import type { NoteRdv } from '../domaine/types'
import { ChampTexte, ChampZone } from '../composants/champs'

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
    <div className="section">
      <h2>Notes de rendez-vous</h2>
      <button className="bouton discret" onClick={ajouter}>
        + Nouvelle note
      </button>
      {dossier.notes.map((note) => (
        <div className="element" key={note.id} style={{ marginTop: 12 }}>
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
              lignes={5}
              onChange={(v) => maj(note.id, { texte: v })}
            />
          </div>
          <button
            className="bouton danger ligne-ajout"
            onClick={() => patch({ notes: dossier.notes.filter((n) => n.id !== note.id) })}
          >
            Supprimer la note
          </button>
        </div>
      ))}
    </div>
  )
}
