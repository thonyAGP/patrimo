import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Briefcase,
  CalendarCheck,
  CircleAlert,
  FileText,
  Heart,
  Landmark,
  NotebookPen,
  Paperclip,
  PieChart,
  Target,
  Trash2,
  Users,
  Wallet
} from 'lucide-react'
import { db, sauverDossier, supprimerDossier } from '../db/db'
import {
  LIBELLES_OBJECTIF,
  LIBELLES_PIPELINE,
  type Dossier,
  type StatutPipeline
} from '../domaine/types'
import { completude } from '../domaine/completude'
import { piecesAObtenir } from '../domaine/pieces'
import { Coquille, Carte } from '../composants/Coquille'
import { AvatarFrancois } from '../composants/Conseiller'
import {
  AnneauProgression,
  IllustrationCible,
  IllustrationMaison,
  IllustrationPlante
} from '../composants/Illustrations'
import { formaterEuros } from '../composants/champs'
import { SectionEtatCivil } from '../sections/SectionEtatCivil'
import { SectionSituationPro } from '../sections/SectionSituationPro'
import { SectionPatrimoine } from '../sections/SectionPatrimoine'
import { SectionContrats } from '../sections/SectionContrats'
import { SectionBudget } from '../sections/SectionBudget'
import { SectionObjectifs } from '../sections/SectionObjectifs'
import { SectionNotes } from '../sections/SectionNotes'
import { SectionDocuments } from '../sections/SectionDocuments'
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
  { cle: 'documents', libelle: 'Documents', Icone: Paperclip, Composant: SectionDocuments },
  { cle: 'synthese', libelle: 'Synthèse', Icone: PieChart, Composant: SectionSynthese }
]

const CLASSE_BADGE: Partial<Record<StatutPipeline, string>> = {
  client: 'sauge',
  sans_suite: 'danger',
  proposition: 'terracotta'
}

const LIBELLES_FAMILIALE: Record<string, string> = {
  celibataire: 'Célibataire',
  marie: 'Marié(e)',
  pacse: 'Pacsé(e)',
  concubinage: 'Concubinage',
  divorce: 'Divorcé(e)',
  veuf: 'Veuf / veuve'
}

function Astuce(props: { illustration: JSX.Element; texte: string; etiquette?: string }) {
  return (
    <div className="carte carte-astuce">
      <div className="illustration">{props.illustration}</div>
      <div className="etiquette-astuce">{props.etiquette ?? 'Astuce'}</div>
      <p>{props.texte}</p>
    </div>
  )
}

function RailDossier({
  dossier,
  section,
  allerA
}: {
  dossier: Dossier
  section: string
  allerA: (cle: string) => void
}) {
  const nbDocuments =
    useLiveQuery(
      () => db.documents.where('dossierId').equals(dossier.id).count(),
      [dossier.id]
    ) ?? 0
  const { etapes } = completude(dossier, nbDocuments)
  const faites = etapes.filter((e) => e.complete).length
  const ec = dossier.etatCivil

  const totalActifs = dossier.actifs.reduce((t, a) => t + (a.valeur.valeur ?? 0), 0)
  const totalPassifs = dossier.passifs.reduce(
    (t, p) => t + (p.capitalRestantDu.valeur ?? 0),
    0
  )

  const objectifsTries = [...dossier.objectifs].sort((a, b) => a.priorite - b.priorite)

  return (
    <aside className="rail">
      <Carte titre="Avancement du dossier">
        <div className="anneau-bloc">
          <AnneauProgression faites={faites} total={etapes.length} />
          <span className="legende-anneau">Étapes complétées</span>
        </div>
      </Carte>

      {section === 'etat-civil' && (
        <>
          <Carte titre="Résumé">
            <div className="rail-lignes">
              <div className="ligne">
                <Heart size={15} />
                {ec.situationFamiliale
                  ? LIBELLES_FAMILIALE[ec.situationFamiliale]
                  : 'Situation à renseigner'}
              </div>
              {(ec.conjointPrenom || ec.conjointNom) && (
                <div className="ligne">
                  <Users size={15} />
                  Conjoint : {`${ec.conjointPrenom} ${ec.conjointNom}`.trim()}
                </div>
              )}
              <div className="ligne">
                <Users size={15} />
                {ec.enfants.length === 0
                  ? 'Aucun enfant renseigné'
                  : `${ec.enfants.length} enfant${ec.enfants.length > 1 ? 's' : ''}`}
              </div>
            </div>
          </Carte>
          <Astuce
            illustration={<IllustrationPlante />}
            texte="Plus votre dossier est complet, plus vos préconisations seront pertinentes."
          />
        </>
      )}

      {(section === 'patrimoine' || section === 'contrats') && (
        <>
          <Carte titre="Synthèse rapide">
            <div className="rail-lignes">
              <div className="ligne">
                <span className="pastille" style={{ background: 'var(--petrole)' }} />
                Actifs
                <span className="valeur-droite">{formaterEuros(totalActifs)}</span>
              </div>
              <div className="ligne">
                <span className="pastille" style={{ background: 'var(--terracotta)' }} />
                Passifs
                <span className="valeur-droite">{formaterEuros(totalPassifs)}</span>
              </div>
              <div className="ligne">
                <span className="pastille" style={{ background: 'var(--sauge)' }} />
                Patrimoine net
                <span className="valeur-droite">{formaterEuros(totalActifs - totalPassifs)}</span>
              </div>
            </div>
          </Carte>
          <Astuce
            illustration={<IllustrationMaison />}
            texte="Pensez à renseigner tous vos actifs et passifs pour obtenir une vision complète."
          />
        </>
      )}

      {(section === 'pro' || section === 'budget') && (
        <Astuce
          illustration={<IllustrationCible />}
          texte={
            section === 'pro'
              ? 'Le statut et la TMI orientent directement les préconisations fiscales.'
              : 'Une capacité d’épargne réaliste vaut mieux qu’une capacité optimiste.'
          }
        />
      )}

      {section === 'objectifs' && (
        <>
          <Carte titre="Vos objectifs">
            <div className="rail-lignes">
              <div className="ligne">
                <Target size={15} />
                {dossier.objectifs.length === 0
                  ? 'Aucun objectif défini'
                  : `${dossier.objectifs.length} objectif${dossier.objectifs.length > 1 ? 's' : ''} défini${dossier.objectifs.length > 1 ? 's' : ''}`}
              </div>
              {objectifsTries[0] && (
                <div className="ligne">
                  <span className="pastille" style={{ background: 'var(--terracotta)' }} />
                  Priorité n°1 : {LIBELLES_OBJECTIF[objectifsTries[0].type]}
                </div>
              )}
            </div>
            {dossier.objectifs.length > 0 && (
              <button
                className="bouton-doux petrole ligne-ajout"
                style={{ marginTop: 14, width: '100%' }}
                onClick={() => allerA('synthese')}
              >
                Voir la synthèse des objectifs
              </button>
            )}
          </Carte>
          <Astuce
            illustration={<IllustrationCible />}
            etiquette="Conseil"
            texte="Hiérarchisez vos objectifs pour mieux construire votre stratégie."
          />
        </>
      )}

      {section === 'notes' && (
        <Astuce
          illustration={<IllustrationPlante />}
          texte="Notez les prochaines actions convenues : elles structureront le second rendez-vous."
        />
      )}

      {section === 'documents' && (
        <>
          <Carte titre="Pièces à obtenir">
            {piecesAObtenir(dossier).length === 0 ? (
              <div className="rail-lignes">
                <div className="ligne">
                  <span className="pastille" style={{ background: 'var(--sauge)' }} />
                  Aucune pièce en attente.
                </div>
              </div>
            ) : (
              <div className="rail-lignes">
                {piecesAObtenir(dossier).map((p) => (
                  <div className="ligne" key={p}>
                    <CircleAlert size={15} style={{ color: 'var(--terracotta)', flexShrink: 0 }} />
                    {p}
                  </div>
                ))}
              </div>
            )}
          </Carte>
          <Astuce
            illustration={<IllustrationMaison />}
            texte="Quand une pièce arrive, photographiez-la : le dossier reste complet sans re-saisie."
          />
        </>
      )}

      {section === 'synthese' && (
        <div className="carte carte-francois">
          <div className="avatar-grand">
            <AvatarFrancois taille={72} />
          </div>
          <div className="nom">François</div>
          <div className="role">Votre conseiller patrimonial</div>
          <p>À votre disposition pour échanger sur les prochaines étapes.</p>
          <button className="bouton" style={{ width: '100%' }} onClick={() => allerA('notes')}>
            <CalendarCheck size={17} />
            Planifier un RDV
          </button>
        </div>
      )}
    </aside>
  )
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

  const navigationSections = SECTIONS.map((s) => (
    <button
      key={s.cle}
      className={s.cle === sectionActive ? 'actif' : ''}
      onClick={() => setSectionActive(s.cle)}
      title={s.libelle}
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
      <nav className="nav-sections">{navigationSections}</nav>
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
      ongletsMobiles={<nav className="onglets-mobiles">{navigationSections}</nav>}
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
        <div style={{ minWidth: 190 }}>
          <label className="champ">
            <span className="champ-label">Prochaine relance</span>
            <input
              type="date"
              value={dossier.relance ?? ''}
              onChange={(e) => patch({ relance: e.target.value })}
            />
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

      <div className="disposition">
        <div>
          <Composant dossier={dossier} patch={patch} />
        </div>
        <RailDossier dossier={dossier} section={sectionActive} allerA={setSectionActive} />
      </div>

      <div className="pied-contenu">
        {derniereSauvegarde
          ? `Enregistré localement à ${derniereSauvegarde.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}.`
          : 'Les modifications sont enregistrées automatiquement.'}
      </div>
    </Coquille>
  )
}
