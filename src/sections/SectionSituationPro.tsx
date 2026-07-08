import { Briefcase, Euro } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import type { SituationPro } from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte, ChampZone } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

export function SectionSituationPro({ dossier, patch }: PropsSection) {
  const sp = dossier.situationPro
  const maj = (p: Partial<SituationPro>) => patch({ situationPro: { ...sp, ...p } })

  return (
    <>
      <TitrePage
        titre="Situation professionnelle"
        sousTitre="Activité, revenus et situation professionnelle du foyer."
      />

      <Carte>
        <div className="titre-groupe petrole">
          <Briefcase size={16} />
          Activité principale
        </div>
        <div className="grille">
          <ChampTexte
            label="Profession"
            valeur={sp.profession}
            onChange={(v) => maj({ profession: v })}
          />
          <ChampSelect
            label="Statut"
            valeur={sp.statut}
            options={[
              ['salarie', 'Salarié'],
              ['tns', 'TNS / indépendant'],
              ['fonctionnaire', 'Fonctionnaire'],
              ['chef_entreprise', "Chef d'entreprise"],
              ['retraite', 'Retraité'],
              ['sans_activite', 'Sans activité']
            ]}
            onChange={(v) => maj({ statut: v as SituationPro['statut'] })}
          />
          <ChampTexte
            label="Employeur / société"
            valeur={sp.employeur}
            onChange={(v) => maj({ employeur: v })}
          />
        </div>

        <div className="titre-groupe" style={{ marginTop: 24 }}>
          <Euro size={16} />
          Revenus du foyer
        </div>
        <div className="grille">
          <ChampMontant
            label="Revenu net mensuel"
            montant={sp.revenuNetMensuel}
            onChange={(m) => maj({ revenuNetMensuel: m })}
          />
          <ChampMontant
            label="Revenu du conjoint (mensuel)"
            montant={sp.revenuConjointMensuel}
            onChange={(m) => maj({ revenuConjointMensuel: m })}
          />
          <ChampMontant
            label="Autres revenus (mensuel)"
            montant={sp.autresRevenusMensuels}
            onChange={(m) => maj({ autresRevenusMensuels: m })}
          />
          <ChampSelect
            label="Tranche marginale d'imposition"
            valeur={sp.tmi}
            options={[
              ['0', '0 %'],
              ['11', '11 %'],
              ['30', '30 %'],
              ['41', '41 %'],
              ['45', '45 %']
            ]}
            onChange={(v) => maj({ tmi: v as SituationPro['tmi'] })}
          />
        </div>

        <div className="grille" style={{ marginTop: 20 }}>
          <ChampZone
            label="Commentaire"
            valeur={sp.commentaire}
            onChange={(v) => maj({ commentaire: v })}
          />
        </div>
      </Carte>
    </>
  )
}
