import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, sauverDossier, supprimerDossier } from '../db/db'
import { LIBELLES_PIPELINE, type Dossier, type StatutPipeline } from '../domaine/types'
import { ChampSelect } from '../composants/champs'
import { SectionEtatCivil } from '../sections/SectionEtatCivil'
import { SectionSituationPro } from '../sections/SectionSituationPro'
import { SectionPatrimoine } from '../sections/SectionPatrimoine'
import { SectionContrats } from '../sections/SectionContrats'
import { SectionBudget } from '../sections/SectionBudget'
import { SectionObjectifs } from '../sections/SectionObjectifs'
import { SectionNotes } from '../sections/SectionNotes'
import { SectionSynthese } from '../sections/SectionSynthese'

export interface PropsSection {
  dossier: Dossier
  patch: (p: Partial<Dossier>) => void
}

const SECTIONS: { cle: string; libelle: string; Composant: (p: PropsSection) => JSX.Element }[] = [
  { cle: 'etat-civil', libelle: 'État civil & foyer', Composant: SectionEtatCivil },
  { cle: 'pro', libelle: 'Situation pro', Composant: SectionSituationPro },
  { cle: 'patrimoine', libelle: 'Patrimoine', Composant: SectionPatrimoine },
  { cle: 'contrats', libelle: 'Contrats', Composant: SectionContrats },
  { cle: 'budget', libelle: 'Budget', Composant: SectionBudget },
  { cle: 'objectifs', libelle: 'Objectifs', Composant: SectionObjectifs },
  { cle: 'notes', libelle: 'Notes RDV', Composant: SectionNotes },
  { cle: 'synthese', libelle: 'Synthèse', Composant: SectionSynthese }
]

export function PageDossier() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [introuvable, setIntrouvable] = useState(false)
  const [sectionActive, setSectionActive] = useState('etat-civil')
  const [derniereSauvegarde, setDerniereSauvegarde] = useState<Date | null>(null)
  const timerSauvegarde = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!id) return
    db.dossiers.get(id).then((d) => {
      if (d) setDossier(d)
      else setIntrouvable(true)
    })
  }, [id])

  // Local-first : chaque modification est écrite en base locale après une
  // courte pause de saisie — aucune action « Enregistrer » nécessaire.
  function patch(p: Partial<Dossier>) {
    setDossier((actuel) => {
      if (!actuel) return actuel
      const suivant = { ...actuel, ...p }
      clearTimeout(timerSauvegarde.current)
      timerSauvegarde.current = setTimeout(() => {
        sauverDossier(suivant).then(() => setDerniereSauvegarde(new Date()))
      }, 400)
      return suivant
    })
  }

  useEffect(() => () => clearTimeout(timerSauvegarde.current), [])

  async function supprimer() {
    if (!dossier) return
    const nom = `${dossier.etatCivil.prenom} ${dossier.etatCivil.nom}`.trim() || 'ce dossier'
    if (window.confirm(`Supprimer définitivement ${nom} ?`)) {
      clearTimeout(timerSauvegarde.current)
      await supprimerDossier(dossier.id)
      navigate('/')
    }
  }

  if (introuvable) return <div className="vide">Dossier introuvable.</div>
  if (!dossier) return <div className="vide">Chargement…</div>

  const { Composant } = SECTIONS.find((s) => s.cle === sectionActive) ?? SECTIONS[0]

  return (
    <>
      <div className="barre-outils">
        <div style={{ flex: 1, minWidth: 220 }}>
          <ChampSelect
            label="Statut du dossier"
            valeur={dossier.statutPipeline}
            options={Object.entries(LIBELLES_PIPELINE) as [string, string][]}
            onChange={(v) => patch({ statutPipeline: (v || 'prospect') as StatutPipeline })}
          />
        </div>
        <button className="bouton danger" onClick={supprimer} style={{ alignSelf: 'end' }}>
          Supprimer
        </button>
      </div>

      <nav className="onglets">
        {SECTIONS.map((s) => (
          <button
            key={s.cle}
            className={s.cle === sectionActive ? 'actif' : ''}
            onClick={() => setSectionActive(s.cle)}
          >
            {s.libelle}
          </button>
        ))}
      </nav>

      <Composant dossier={dossier} patch={patch} />

      <div className="indicateur-sauvegarde">
        {derniereSauvegarde
          ? `Enregistré localement à ${derniereSauvegarde.toLocaleTimeString('fr-FR')}`
          : 'Les modifications sont enregistrées automatiquement sur la tablette.'}
      </div>
    </>
  )
}
