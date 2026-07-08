import { CircleAlert, Heart, ListChecks, Users } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_ACTIF,
  LIBELLES_CONTRAT,
  LIBELLES_OBJECTIF,
  LIBELLES_PIPELINE,
  type Dossier,
  type Montant
} from '../domaine/types'
import { completude } from '../domaine/completude'
import { formaterEuros } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

const somme = (montants: Montant[]) =>
  montants.reduce((total, m) => total + (m.valeur ?? 0), 0)

// Toute donnée marquée « à obtenir » devient une pièce à demander au prospect.
function piecesAObtenir(dossier: Dossier): string[] {
  const pieces: string[] = []
  const verifier = (m: Montant, libelle: string) => {
    if (m.statut === 'a_obtenir') pieces.push(libelle)
  }

  verifier(dossier.situationPro.revenuNetMensuel, 'Revenu net mensuel (bulletin de salaire / avis d’imposition)')
  verifier(dossier.situationPro.revenuConjointMensuel, 'Revenu du conjoint')
  verifier(dossier.situationPro.autresRevenusMensuels, 'Justificatif des autres revenus')
  verifier(dossier.budget.chargesMensuelles, 'Détail des charges mensuelles')
  verifier(dossier.budget.epargneMensuelleActuelle, 'Relevés d’épargne mensuelle')
  dossier.actifs.forEach((a) =>
    verifier(a.valeur, `Valeur de : ${a.libelle || LIBELLES_ACTIF[a.type]}`)
  )
  dossier.passifs.forEach((p) => {
    verifier(p.capitalRestantDu, `Tableau d’amortissement : ${p.libelle || 'crédit'}`)
    verifier(p.mensualite, `Mensualité : ${p.libelle || 'crédit'}`)
  })
  dossier.contrats.forEach((c) => {
    const nom = c.libelle || LIBELLES_CONTRAT[c.type]
    verifier(c.encours, `Relevé de situation : ${nom}`)
    verifier(c.cotisationMensuelle, `Cotisation : ${nom}`)
  })
  return pieces
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
  const totalContrats = somme(dossier.contrats.map((c) => c.encours))
  const totalPassifs = somme(dossier.passifs.map((p) => p.capitalRestantDu))
  const brut = totalImmobilier + totalEpargne + totalContrats
  const net = brut - totalPassifs

  const parts = [
    { libelle: 'Immobilier', valeur: totalImmobilier },
    { libelle: 'Épargne & placements', valeur: totalEpargne },
    { libelle: 'Encours contrats', valeur: totalContrats }
  ]

  const pieces = piecesAObtenir(dossier)
  const objectifsPrioritaires = [...dossier.objectifs].sort((a, b) => a.priorite - b.priorite)
  const { etapes, pourcentage } = completude(dossier)
  const incompletes = etapes.filter((e) => !e.complete)

  const ec = dossier.etatCivil
  const enfantsACharge = ec.enfants.filter((e) => e.aCharge).length

  return (
    <>
      <TitrePage
        titre="Synthèse patrimoniale"
        sousTitre={`${`${ec.prenom} ${ec.nom}`.trim() || 'Dossier sans nom'} · ${
          LIBELLES_PIPELINE[dossier.statutPipeline]
        } · mis à jour le ${new Date(dossier.modifieLe).toLocaleDateString('fr-FR')}`}
      />

      <div className="tuiles">
        <div className="tuile">
          <div className="valeur">{formaterEuros(brut)}</div>
          <div className="libelle">Patrimoine brut</div>
        </div>
        <div className="tuile terracotta">
          <div className="valeur">{formaterEuros(totalPassifs)}</div>
          <div className="libelle">Dettes</div>
        </div>
        <div className="tuile sauge">
          <div className="valeur">{formaterEuros(net)}</div>
          <div className="libelle">Patrimoine net estimé</div>
        </div>
        <div className="tuile">
          <div className="valeur">
            {formaterEuros(dossier.budget.capaciteEpargneMensuelle.valeur)}
          </div>
          <div className="libelle">Capacité d'épargne / mois</div>
        </div>
      </div>

      <div className="grille-synthese">
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

        <Carte titre="Objectifs prioritaires">
          {objectifsPrioritaires.length === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
              Aucun objectif saisi pour le moment.
            </p>
          ) : (
            <ul className="liste-simple">
              {objectifsPrioritaires.map((o, i) => (
                <li key={o.id}>
                  <span className="numero">{i + 1}</span>
                  <span>
                    <strong>{LIBELLES_OBJECTIF[o.type]}</strong>
                    {o.montantCible.valeur !== null &&
                      ` — cible ${formaterEuros(o.montantCible.valeur)}`}
                    {o.horizon && ` (${o.horizon} terme)`}
                    {o.description && (
                      <span style={{ color: 'var(--texte-2)' }}> — {o.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Carte>

        <Carte titre="Pièces à obtenir du prospect" icone={<CircleAlert size={18} />}>
          {pieces.length === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
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

        <Carte titre="Complétude du dossier" icone={<ListChecks size={18} />}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Dossier complété à {pourcentage} %
          </div>
          <div className="jauge" style={{ marginBottom: 14 }}>
            <div style={{ width: `${pourcentage}%` }} />
          </div>
          {incompletes.length === 0 ? (
            <p style={{ color: 'var(--texte-2)', margin: 0 }}>
              Toutes les sections sont renseignées — dossier prêt pour la restitution.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {incompletes.map((e) => (
                <span className="badge neutre" key={e.cle}>
                  {e.libelle}
                </span>
              ))}
            </div>
          )}
        </Carte>
      </div>
    </>
  )
}
