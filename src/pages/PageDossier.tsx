import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Briefcase,
  FileText,
  Landmark,
  NotebookPen,
  PieChart,
  Target,
  Trash2,
  Users,
  Wallet
} from 'lucide-react'
import { db, sauverDossier, supprimerDossier } from '../db/db'
import { LIBELLES_PIPELINE, type Dossier, type StatutPipeline } from '../domaine/types'
import { completude } from '../domaine/completude'
import { Coquille } from '../composants/Coquille'
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

const SECTIONS: {
  cle: string
  libelle: string
  Icone: typeof Users
  Composant: (p: PropsSection) => JSX.Element
}[] = [
  { cle: 'etat-civil', libelle: 'État civil & foyer', Icone: Users, Composant: SectionEtatCivil },
  { cle: 'pro', libelle: 'Situation pro', Icone: Briefcase, Composant: SectionSituationPro },
  { cle: 'patrimoine', libelle: 'Patrimoine', Icone: Landmark, Composant: SectionPatrimoine },
  { cle: 'contrats', libelle: 'Contrats', Icone: FileText, Composant: SectionContrats },
  { cle: 'budget', libelle: 'Budget', Icone: Wallet, Composant: SectionBudget },
  { cle: 'objectifs', libelle: 'Objectifs', Icone: Target, Composant: SectionObjectifs },
  { cle: 'notes', libelle: 'Notes RDV', Icone: NotebookPen, Composant: SectionNotes },
  { cle: 'synthese', libelle: 'Synthèse', Icone: PieChart, Composant: SectionSynthese }
]

const CLASSE_BADGE: Partial<Record<StatutPipeline, string>> = {
  client: 'sauge',
  sans_suite: 'danger',
  proposition: 'terracotta'
}

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

  if (introuvable) {
    return (
      <Coquille breadcrumb={<Link to="/">Dossiers</Link>}>
        <div className="vide">Dossier introuvable.</div>
      </Coquille>
    )
  }
  if (!dossier) {
    return (
      <Coquille breadcrumb={<Link to="/">Dossiers</Link>}>
        <div className="vide">Chargement…</div>
      </Coquille>
    )
  }

  const nom =
    `${dossier.etatCivil.prenom} ${dossier.etatCivil.nom}`.trim() || 'Dossier sans nom'
  const { Composant } = SECTIONS.find((s) => s.cle === sectionActive) ?? SECTIONS[0]
  const { pourcentage } = completude(dossier)

  const navigationSections = (compacte: boolean) =>
    SECTIONS.map((s) => (
      <button
        key={s.cle}
        className={s.cle === sectionActive ? 'actif' : ''}
        onClick={() => setSectionActive(s.cle)}
        aria-label={compacte ? s.libelle : undefined}
        title={compacte ? s.libelle : undefined}
      >
        <s.Icone size={20} />
        <span className="libelle-nav">{s.libelle}</span>
      </button>
    ))

  const sidebar = (
    <>
      <div className="sidebar-dossier">
        <div className="etiquette">Dossier</div>
        <div className="nom">{nom}</div>
        <span className={`badge ${CLASSE_BADGE[dossier.statutPipeline] ?? ''}`}>
          {LIBELLES_PIPELINE[dossier.statutPipeline]}
        </span>
      </div>
      <nav className="nav-sections">{navigationSections(false)}</nav>
      <div className="sidebar-progression">
        <div className="libelle">Dossier complété à {pourcentage} %</div>
        <div className="jauge">
          <div style={{ width: `${pourcentage}%` }} />
        </div>
      </div>
    </>
  )

  return (
    <Coquille
      sidebar={sidebar}
      breadcrumb={
        <>
          <Link to="/" style={{ color: 'inherit' }}>
            Dossiers
          </Link>
          {' / '}
          <strong>{nom}</strong>
        </>
      }
      etatSauvegarde={
        <span className="indicateur-etat">
          <span className="point" />
          {derniereSauvegarde
            ? `Enregistré à ${derniereSauvegarde.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}`
            : 'Enregistrement automatique'}
        </span>
      }
      ongletsMobiles={<nav className="onglets-mobiles">{navigationSections(false)}</nav>}
    >
      <div className="barre-outils">
        <div style={{ flex: 1, minWidth: 220, maxWidth: 340 }}>
          <label className="champ">
            <span className="champ-label">Statut du dossier</span>
            <select
              value={dossier.statutPipeline}
              onChange={(e) =>
                patch({ statutPipeline: (e.target.value || 'prospect') as StatutPipeline })
              }
            >
              {Object.entries(LIBELLES_PIPELINE).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="bouton danger-discret"
          onClick={supprimer}
          style={{ alignSelf: 'end' }}
        >
          <Trash2 size={17} />
          Supprimer
        </button>
      </div>

      <Composant dossier={dossier} patch={patch} />

      <div className="indicateur-sauvegarde">
        Les modifications sont enregistrées automatiquement sur la tablette.
      </div>
    </Coquille>
  )
}
