import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, ShieldCheck, Users } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import { TEXTE_CONSENTEMENT, type EtatCivil } from '../domaine/types'
import { ChampNombre, ChampSelect, ChampTexte } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'
import { PadSignature } from '../composants/PadSignature'

export function SectionEtatCivil({ dossier, patch }: PropsSection) {
  const ec = dossier.etatCivil
  const maj = (p: Partial<EtatCivil>) => patch({ etatCivil: { ...ec, ...p } })
  const [enfantsOuverts, setEnfantsOuverts] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [signePar, setSignePar] = useState('')

  const consentement = dossier.consentement ?? null

  function enregistrerConsentement() {
    if (!signature) return
    patch({
      consentement: {
        texte: TEXTE_CONSENTEMENT,
        signePar: signePar || `${ec.prenom} ${ec.nom}`.trim(),
        signature,
        horodatage: new Date().toISOString()
      }
    })
    setSignature(null)
    setSignePar('')
  }

  function retirerConsentement() {
    if (window.confirm('Retirer le consentement enregistré ?')) {
      patch({ consentement: null })
    }
  }

  function ajouterEnfant() {
    setEnfantsOuverts(true)
    maj({
      enfants: [
        ...ec.enfants,
        { id: crypto.randomUUID(), prenom: '', anneeNaissance: null, aCharge: true }
      ]
    })
  }

  return (
    <>
      <TitrePage
        titre="État civil & foyer"
        sousTitre="Informations personnelles et composition du foyer."
      />

      <Carte>
        <div className="grille">
          <ChampSelect
            label="Civilité"
            valeur={ec.civilite}
            options={[
              ['M.', 'M.'],
              ['Mme', 'Mme']
            ]}
            onChange={(v) => maj({ civilite: v as EtatCivil['civilite'] })}
          />
          <ChampTexte label="Nom" valeur={ec.nom} onChange={(v) => maj({ nom: v })} />
          <ChampTexte label="Prénom" valeur={ec.prenom} onChange={(v) => maj({ prenom: v })} />
          <ChampTexte
            label="Date de naissance"
            type="date"
            valeur={ec.dateNaissance}
            onChange={(v) => maj({ dateNaissance: v })}
          />
          <ChampTexte
            label="Téléphone"
            type="tel"
            valeur={ec.telephone}
            onChange={(v) => maj({ telephone: v })}
          />
          <ChampTexte
            label="E-mail"
            type="email"
            valeur={ec.email}
            onChange={(v) => maj({ email: v })}
          />
          <ChampTexte
            label="Adresse"
            valeur={ec.adresse}
            onChange={(v) => maj({ adresse: v })}
          />
          <ChampSelect
            label="Situation familiale"
            valeur={ec.situationFamiliale}
            options={[
              ['celibataire', 'Célibataire'],
              ['marie', 'Marié(e)'],
              ['pacse', 'Pacsé(e)'],
              ['concubinage', 'Concubinage'],
              ['divorce', 'Divorcé(e)'],
              ['veuf', 'Veuf / veuve']
            ]}
            onChange={(v) => maj({ situationFamiliale: v as EtatCivil['situationFamiliale'] })}
          />
          <ChampTexte
            label="Régime matrimonial"
            valeur={ec.regimeMatrimonial}
            placeholder="Communauté réduite aux acquêts…"
            onChange={(v) => maj({ regimeMatrimonial: v })}
          />
        </div>

        <div className="titre-groupe petrole" style={{ marginTop: 24 }}>
          Conjoint
        </div>
        <div className="grille">
          <ChampTexte
            label="Nom"
            valeur={ec.conjointNom}
            onChange={(v) => maj({ conjointNom: v })}
          />
          <ChampTexte
            label="Prénom"
            valeur={ec.conjointPrenom}
            onChange={(v) => maj({ conjointPrenom: v })}
          />
          <ChampTexte
            label="Date de naissance"
            type="date"
            valeur={ec.conjointDateNaissance}
            onChange={(v) => maj({ conjointDateNaissance: v })}
          />
          <ChampTexte
            label="Profession"
            valeur={ec.conjointProfession}
            onChange={(v) => maj({ conjointProfession: v })}
          />
        </div>

        <button
          className="ligne-repliee"
          onClick={() => setEnfantsOuverts((o) => !o)}
          aria-expanded={enfantsOuverts}
        >
          <span className="picto">
            <Users size={18} />
          </span>
          <span className="textes">
            <span className="principal">
              {ec.enfants.length === 0
                ? 'Aucun enfant renseigné'
                : `${ec.enfants.length} enfant${ec.enfants.length > 1 ? 's' : ''}`}
            </span>
            <br />
            <span className="secondaire">Ajouter ou modifier les informations</span>
          </span>
          {enfantsOuverts ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </button>

        {enfantsOuverts && (
          <div style={{ marginTop: 8 }}>
            {ec.enfants.map((enfant, i) => (
              <div className="element" key={enfant.id}>
                <div className="grille">
                  <ChampTexte
                    label="Prénom"
                    valeur={enfant.prenom}
                    onChange={(v) => {
                      const enfants = [...ec.enfants]
                      enfants[i] = { ...enfant, prenom: v }
                      maj({ enfants })
                    }}
                  />
                  <ChampNombre
                    label="Année de naissance"
                    valeur={enfant.anneeNaissance}
                    onChange={(v) => {
                      const enfants = [...ec.enfants]
                      enfants[i] = { ...enfant, anneeNaissance: v }
                      maj({ enfants })
                    }}
                  />
                  <ChampSelect
                    label="À charge"
                    valeur={enfant.aCharge ? 'oui' : 'non'}
                    options={[
                      ['oui', 'Oui'],
                      ['non', 'Non']
                    ]}
                    onChange={(v) => {
                      const enfants = [...ec.enfants]
                      enfants[i] = { ...enfant, aCharge: v !== 'non' }
                      maj({ enfants })
                    }}
                  />
                  <div className="champ">
                    <span className="champ-label">&nbsp;</span>
                    <button
                      className="lien-retirer"
                      onClick={() =>
                        maj({ enfants: ec.enfants.filter((e) => e.id !== enfant.id) })
                      }
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button className="bouton-doux ligne-ajout" onClick={ajouterEnfant}>
              + Ajouter un enfant
            </button>
          </div>
        )}
      </Carte>

      <Carte titre="Consentement RGPD" icone={<ShieldCheck size={18} />}>
        {consentement ? (
          <div>
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: 'var(--sauge-fonce)',
                fontWeight: 600,
                margin: '0 0 10px'
              }}
            >
              <CheckCircle2 size={18} />
              Consentement signé par {consentement.signePar || '—'} le{' '}
              {new Date(consentement.horodatage).toLocaleDateString('fr-FR')} à{' '}
              {new Date(consentement.horodatage).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p style={{ fontSize: 13.5, color: 'var(--texte-2)', lineHeight: 1.55 }}>
              {consentement.texte}
            </p>
            <img
              src={consentement.signature}
              alt={`Signature de ${consentement.signePar}`}
              className="signature-apercu"
            />
            <div>
              <button className="lien-retirer" onClick={retirerConsentement}>
                Retirer le consentement
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--texte-2)', lineHeight: 1.55, marginTop: 0 }}>
              {TEXTE_CONSENTEMENT}
            </p>
            <div className="grille" style={{ marginBottom: 14 }}>
              <ChampTexte
                label="Nom du signataire"
                valeur={signePar || `${ec.prenom} ${ec.nom}`.trim()}
                onChange={setSignePar}
              />
            </div>
            <PadSignature onChange={setSignature} />
            <button
              className="bouton ligne-ajout"
              onClick={enregistrerConsentement}
              disabled={!signature}
              style={{ marginTop: 12, opacity: signature ? 1 : 0.5 }}
            >
              <ShieldCheck size={17} />
              Enregistrer le consentement
            </button>
          </div>
        )}
      </Carte>
    </>
  )
}
