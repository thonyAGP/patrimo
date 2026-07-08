import {
  CheckCircle2,
  FileText,
  Heart,
  Layers,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_OBJECTIF,
  LIBELLES_PIPELINE,
  type Montant
} from '../domaine/types'
import { db } from '../db/db'
import { completude } from '../domaine/completude'
import { piecesAObtenir } from '../domaine/pieces'
import { formaterEuros } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'
import { MiniCourbe } from '../composants/Illustrations'

const somme = (montants: Montant[]) =>
  montants.reduce((total, m) => total + (m.valeur ?? 0), 0)

// Formulations « conseil » des sections encore incomplètes.
const RECOMMANDATIONS: Record<string, string> = {
  'etat-civil': 'Compléter l’état civil — identité et situation familiale.',
  pro: 'Préciser la situation professionnelle et les revenus du foyer.',
  patrimoine: 'Renseigner les actifs et crédits du foyer.',
  contrats: 'Compléter les informations sur les contrats — assurance-vie, PER, prévoyance…',
  budget: 'Évaluer la capacité d’épargne mensuelle pour affiner les simulations.',
  objectifs: 'Définir et hiérarchiser les objectifs patrimoniaux.',
  notes: 'Consigner les points clés du rendez-vous et les prochaines actions.',
  documents: 'Photographier les pièces justificatives remises par le prospect.'
}

const LIBELLES_HORIZON: Record<string, string> = {
  court: 'Court terme (< 3 ans)',
  moyen: 'Moyen terme (3-8 ans)',
  long: 'Long terme (> 8 ans)'
}

// Nuances « graphique » des teintes de marque : mêmes hues, chroma et
// contraste ajustés pour rester lisibles sur fond blanc (CVD vérifié).
const COULEURS_DONUT = ['#20707f', '#57906a', '#ce6434']

function Donut({ parts }: { parts: { libelle: string; valeur: number }[] }) {
  const total = parts.reduce((t, p) => t + p.valeur, 0)
  const rayon = 60
  const epaisseur = 26
  const circonference = 2 * Math.PI * rayon
  const ecart = 3 // px d'écart entre segments (fond de carte visible)

  let decalage = 0
  const segments = parts
    .filter((p) => p.valeur > 0)
    .map((p, i) => {
      const fraction = p.valeur / total
      const longueur = Math.max(fraction * circonference - ecart, 1)
      const segment = (
        <circle
          key={p.libelle}
          r={rayon}
          cx="80"
          cy="80"
          fill="none"
          stroke={COULEURS_DONUT[i % COULEURS_DONUT.length]}
          strokeWidth={epaisseur}
          strokeDasharray={`${longueur} ${circonference - longueur}`}
          strokeDashoffset={-decalage}
        >
          <title>{`${p.libelle} : ${Math.round(fraction * 100)} %`}</title>
        </circle>
      )
      decalage += fraction * circonference
      return segment
    })

  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      role="img"
      aria-label="Répartition du patrimoine brut"
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      {segments}
    </svg>
  )
}

export function SectionSynthese({ dossier }: PropsSection) {
  const totalImmobilier = somme(
    dossier.actifs
      .filter((a) =>
        ['residence_principale', 'residence_secondaire', 'immobilier_locatif'].includes(a.type)
      )
      .map((a) => a.valeur)
  )
  const totalEpargne = somme(
    dossier.actifs
      .filter(
        (a) =>
          !['residence_principale', 'residence_secondaire', 'immobilier_locatif'].includes(a.type)
      )
      .map((a) => a.valeur)
  )
  const totalActifs = totalImmobilier + totalEpargne
  const totalContrats = somme(dossier.contrats.map((c) => c.encours))
  const totalPassifs = somme(dossier.passifs.map((p) => p.capitalRestantDu))
  const brut = totalActifs + totalContrats
  const net = brut - totalPassifs

  const parts = [
    { libelle: 'Immobilier', valeur: totalImmobilier },
    { libelle: 'Épargne & placements', valeur: totalEpargne },
    { libelle: 'Encours contrats', valeur: totalContrats }
  ]

  const nbDocuments =
    useLiveQuery(
      () => db.documents.where('dossierId').equals(dossier.id).count(),
      [dossier.id]
    ) ?? 0

  const pieces = piecesAObtenir(dossier)
  const objectifsPrioritaires = [...dossier.objectifs].sort((a, b) => a.priorite - b.priorite)
  const { etapes } = completude(dossier, nbDocuments)
  const incompletes = etapes.filter((e) => !e.complete)

  const ec = dossier.etatCivil
  const enfantsACharge = ec.enfants.filter((e) => e.aCharge).length

  return (
    <>
      <TitrePage
        titre="Synthèse"
        sousTitre={`${`${ec.prenom} ${ec.nom}`.trim() || 'Dossier sans nom'} · ${
          LIBELLES_PIPELINE[dossier.statutPipeline]
        } · mis à jour le ${new Date(dossier.modifieLe).toLocaleDateString('fr-FR')}`}
      />

      <div className="tuiles">
        <div className="tuile sauge">
          <span className="picto-tuile">
            <Layers size={18} />
          </span>
          <div className="valeur">{formaterEuros(totalActifs)}</div>
          <div className="libelle">Total actifs</div>
          <MiniCourbe couleur="#87a58d" />
        </div>
        <div className="tuile terracotta">
          <span className="picto-tuile">
            <Wallet size={18} />
          </span>
          <div className="valeur">{formaterEuros(totalPassifs)}</div>
          <div className="libelle">Total passifs</div>
          <MiniCourbe couleur="#d66a3a" />
        </div>
        <div className="tuile">
          <span className="picto-tuile">
            <ShieldCheck size={18} />
          </span>
          <div className="valeur">{formaterEuros(totalContrats)}</div>
          <div className="libelle">Encours contrats</div>
          <MiniCourbe couleur="#174c56" />
        </div>
        <div className="tuile">
          <span className="picto-tuile">
            <TrendingUp size={18} />
          </span>
          <div className="valeur" style={net < 0 ? { color: 'var(--danger)' } : undefined}>
            {formaterEuros(net)}
          </div>
          <div className="libelle">Patrimoine net estimé</div>
          <MiniCourbe couleur={net < 0 ? '#c6534c' : '#174c56'} />
        </div>
      </div>

      <div className="grille-synthese">
        <Carte titre="Objectifs priorisés">
          {objectifsPrioritaires.length === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
              Aucun objectif saisi pour le moment.
            </p>
          ) : (
            <ul className="liste-simple">
              {objectifsPrioritaires.map((o, i) => (
                <li key={o.id}>
                  <span className="numero">{i + 1}</span>
                  <span style={{ flex: 1 }}>
                    <strong>{LIBELLES_OBJECTIF[o.type]}</strong>{' '}
                    {o.horizon && (
                      <span className="badge neutre">{LIBELLES_HORIZON[o.horizon]}</span>
                    )}
                    {o.description && (
                      <span style={{ color: 'var(--texte-2)' }}>
                        <br />
                        {o.description}
                      </span>
                    )}
                  </span>
                  {o.montantCible.valeur !== null && (
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {formaterEuros(o.montantCible.valeur)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Carte>

        <Carte titre="Points à approfondir">
          {incompletes.length === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
              Toutes les sections sont renseignées — dossier prêt pour la restitution.
            </p>
          ) : (
            <ul className="liste-simple">
              {incompletes.map((e) => (
                <li key={e.cle}>
                  <FileText size={16} style={{ color: 'var(--texte-2)', flexShrink: 0, alignSelf: 'center' }} />
                  <span>
                    <strong>{e.libelle}</strong>
                    <br />
                    <span style={{ color: 'var(--texte-2)' }}>{RECOMMANDATIONS[e.cle]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Carte>

        <Carte titre="Répartition du patrimoine">
          {brut === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
              Renseignez des actifs ou des contrats pour visualiser la répartition.
            </p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <Donut parts={parts} />
              <div className="legende" style={{ flex: 1, minWidth: 180 }}>
                {parts.map((p, i) => (
                  <div className="ligne" key={p.libelle}>
                    <span
                      className="pastille"
                      style={{ background: COULEURS_DONUT[i % COULEURS_DONUT.length] }}
                    />
                    <span>{p.libelle}</span>
                    <span className="part">
                      {formaterEuros(p.valeur)}
                      {brut > 0 ? ` · ${Math.round((p.valeur / brut) * 100)} %` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Carte>

        <Carte titre="Situation du foyer" icone={<Users size={18} />}>
          <div className="resume-foyer">
            <div className="ligne">
              <Heart size={16} />
              {ec.situationFamiliale
                ? {
                    celibataire: 'Célibataire',
                    marie: 'Marié(e)',
                    pacse: 'Pacsé(e)',
                    concubinage: 'En concubinage',
                    divorce: 'Divorcé(e)',
                    veuf: 'Veuf / veuve'
                  }[ec.situationFamiliale]
                : 'Situation familiale non renseignée'}
              {ec.regimeMatrimonial ? ` — ${ec.regimeMatrimonial}` : ''}
            </div>
            {(ec.conjointPrenom || ec.conjointNom) && (
              <div className="ligne">
                <Users size={16} />
                Conjoint : {`${ec.conjointPrenom} ${ec.conjointNom}`.trim()}
                {ec.conjointProfession ? ` (${ec.conjointProfession})` : ''}
              </div>
            )}
            <div className="ligne">
              <Users size={16} />
              {ec.enfants.length === 0
                ? 'Aucun enfant renseigné'
                : `${ec.enfants.length} enfant${ec.enfants.length > 1 ? 's' : ''}, dont ${enfantsACharge} à charge`}
            </div>
            {dossier.situationPro.profession && (
              <div className="ligne">
                <Users size={16} />
                {dossier.situationPro.profession}
                {dossier.situationPro.tmi ? ` — TMI ${dossier.situationPro.tmi} %` : ''}
              </div>
            )}
          </div>
        </Carte>

        <Carte titre="Pièces à obtenir du prospect">
          {pieces.length === 0 ? (
            <p
              style={{
                color: 'var(--sauge-fonce)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <CheckCircle2 size={18} />
              Aucune — toutes les données sont confirmées ou estimées.
            </p>
          ) : (
            <ul className="liste-simple">
              {pieces.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </Carte>
      </div>
    </>
  )
}
