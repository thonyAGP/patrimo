import { Baby, Heart, MapPin, Trash2, UserRound } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import type { EtatCivil } from '../domaine/types'
import { ChampNombre, ChampSelect, ChampTexte } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

export function SectionEtatCivil({ dossier, patch }: PropsSection) {
  const ec = dossier.etatCivil
  const maj = (p: Partial<EtatCivil>) => patch({ etatCivil: { ...ec, ...p } })

  function ajouterEnfant() {
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

      <Carte titre="Identité" icone={<UserRound size={18} />}>
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
        </div>
      </Carte>

      <Carte titre="Coordonnées" icone={<MapPin size={18} />}>
        <div className="grille">
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
        </div>
      </Carte>

      <Carte titre="Situation familiale & conjoint" icone={<Heart size={18} />}>
        <div className="grille">
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
          <ChampTexte
            label="Nom du conjoint"
            valeur={ec.conjointNom}
            onChange={(v) => maj({ conjointNom: v })}
          />
          <ChampTexte
            label="Prénom du conjoint"
            valeur={ec.conjointPrenom}
            onChange={(v) => maj({ conjointPrenom: v })}
          />
          <ChampTexte
            label="Date de naissance du conjoint"
            type="date"
            valeur={ec.conjointDateNaissance}
            onChange={(v) => maj({ conjointDateNaissance: v })}
          />
          <ChampTexte
            label="Profession du conjoint"
            valeur={ec.conjointProfession}
            onChange={(v) => maj({ conjointProfession: v })}
          />
        </div>
      </Carte>

      <Carte titre="Enfants & personnes à charge" icone={<Baby size={18} />}>
        {ec.enfants.map((enfant, i) => (
          <div className="element" key={enfant.id}>
            <div className="element-entete">
              <span className="titre">
                <Baby size={17} />
                {enfant.prenom || `Enfant ${i + 1}`}
              </span>
              <button
                className="bouton-icone"
                aria-label={`Retirer ${enfant.prenom || 'cet enfant'}`}
                onClick={() => maj({ enfants: ec.enfants.filter((e) => e.id !== enfant.id) })}
              >
                <Trash2 size={17} />
              </button>
            </div>
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
            </div>
          </div>
        ))}
        <button className="bouton terracotta ligne-ajout" onClick={ajouterEnfant}>
          + Ajouter un enfant
        </button>
      </Carte>
    </>
  )
}
