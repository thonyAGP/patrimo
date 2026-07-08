import { CreditCard, Home, PiggyBank, Trash2 } from 'lucide-react'
import type { PropsSection } from '../pages/PageDossier'
import {
  LIBELLES_ACTIF,
  montantVide,
  type Actif,
  type Passif,
  type TypeActif
} from '../domaine/types'
import { ChampMontant, ChampSelect, ChampTexte, formaterEuros } from '../composants/champs'
import { Carte, TitrePage } from '../composants/Coquille'

const TYPES_IMMOBILIER: TypeActif[] = [
  'residence_principale',
  'residence_secondaire',
  'immobilier_locatif'
]

export function SectionPatrimoine({ dossier, patch }: PropsSection) {
  const immobilier = dossier.actifs.filter((a) => TYPES_IMMOBILIER.includes(a.type))
  const epargne = dossier.actifs.filter((a) => !TYPES_IMMOBILIER.includes(a.type))

  const totalActifs = dossier.actifs.reduce((t, a) => t + (a.valeur.valeur ?? 0), 0)
  const totalPassifs = dossier.passifs.reduce((t, p) => t + (p.capitalRestantDu.valeur ?? 0), 0)

  function ajouterActif(type: TypeActif) {
    const actif: Actif = {
      id: crypto.randomUUID(),
      type,
      libelle: '',
      valeur: montantVide(),
      remarque: ''
    }
    patch({ actifs: [...dossier.actifs, actif] })
  }

  function majActif(id: string, p: Partial<Actif>) {
    patch({ actifs: dossier.actifs.map((a) => (a.id === id ? { ...a, ...p } : a)) })
  }

  function ajouterPassif() {
    const passif: Passif = {
      id: crypto.randomUUID(),
      libelle: '',
      capitalRestantDu: montantVide(),
      mensualite: montantVide(),
      echeance: '',
      remarque: ''
    }
    patch({ passifs: [...dossier.passifs, passif] })
  }

  function majPassif(id: string, p: Partial<Passif>) {
    patch({ passifs: dossier.passifs.map((x) => (x.id === id ? { ...x, ...p } : x)) })
  }

  const blocActif = (actif: Actif, IconeTitre: typeof Home) => (
    <div className="element" key={actif.id}>
      <div className="element-entete">
        <span className="titre">
          <IconeTitre size={17} />
          {actif.libelle || LIBELLES_ACTIF[actif.type]}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge neutre">{formaterEuros(actif.valeur.valeur)}</span>
          <button
            className="bouton-icone"
            aria-label="Retirer cet actif"
            onClick={() => patch({ actifs: dossier.actifs.filter((a) => a.id !== actif.id) })}
          >
            <Trash2 size={17} />
          </button>
        </span>
      </div>
      <div className="grille">
        <ChampSelect
          label="Type"
          valeur={actif.type}
          options={Object.entries(LIBELLES_ACTIF) as [string, string][]}
          onChange={(v) => majActif(actif.id, { type: (v || 'autre') as TypeActif })}
        />
        <ChampTexte
          label="Libellé"
          valeur={actif.libelle}
          placeholder="Livret A Crédit Agricole…"
          onChange={(v) => majActif(actif.id, { libelle: v })}
        />
        <ChampMontant
          label="Valeur"
          montant={actif.valeur}
          onChange={(m) => majActif(actif.id, { valeur: m })}
        />
        <ChampTexte
          label="Remarque"
          valeur={actif.remarque}
          onChange={(v) => majActif(actif.id, { remarque: v })}
        />
      </div>
    </div>
  )

  return (
    <>
      <TitrePage
        titre="Patrimoine"
        sousTitre="Vue détaillée des actifs et engagements du foyer."
      />

      <div className="tuiles">
        <div className="tuile">
          <div className="valeur">{formaterEuros(totalActifs)}</div>
          <div className="libelle">Patrimoine brut</div>
        </div>
        <div className="tuile terracotta">
          <div className="valeur">{formaterEuros(totalPassifs)}</div>
          <div className="libelle">Dettes</div>
        </div>
        <div className="tuile sauge">
          <div className="valeur">{formaterEuros(totalActifs - totalPassifs)}</div>
          <div className="libelle">Patrimoine net</div>
        </div>
      </div>

      <Carte titre="Immobilier" icone={<Home size={18} />}>
        {immobilier.length === 0 && (
          <p style={{ color: 'var(--texte-2)', marginTop: 0 }}>
            Aucun bien immobilier renseigné.
          </p>
        )}
        {immobilier.map((a) => blocActif(a, Home))}
        <button
          className="bouton terracotta ligne-ajout"
          onClick={() => ajouterActif('residence_principale')}
        >
          + Ajouter un bien
        </button>
      </Carte>

      <Carte titre="Épargne & placements" icone={<PiggyBank size={18} />}>
        {epargne.length === 0 && (
          <p style={{ color: 'var(--texte-2)', marginTop: 0 }}>
            Aucune épargne ni placement renseigné.
          </p>
        )}
        {epargne.map((a) => blocActif(a, PiggyBank))}
        <button className="bouton terracotta ligne-ajout" onClick={() => ajouterActif('livrets')}>
          + Ajouter une épargne ou un placement
        </button>
      </Carte>

      <Carte titre="Crédits en cours" icone={<CreditCard size={18} />}>
        {dossier.passifs.length === 0 && (
          <p style={{ color: 'var(--texte-2)', marginTop: 0 }}>Aucun crédit en cours.</p>
        )}
        {dossier.passifs.map((passif) => (
          <div className="element" key={passif.id}>
            <div className="element-entete">
              <span className="titre">
                <CreditCard size={17} />
                {passif.libelle || 'Crédit'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge neutre">
                  {formaterEuros(passif.capitalRestantDu.valeur)}
                </span>
                <button
                  className="bouton-icone"
                  aria-label="Retirer ce crédit"
                  onClick={() =>
                    patch({ passifs: dossier.passifs.filter((x) => x.id !== passif.id) })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </span>
            </div>
            <div className="grille">
              <ChampTexte
                label="Libellé"
                valeur={passif.libelle}
                placeholder="Crédit immobilier résidence principale…"
                onChange={(v) => majPassif(passif.id, { libelle: v })}
              />
              <ChampMontant
                label="Capital restant dû"
                montant={passif.capitalRestantDu}
                onChange={(m) => majPassif(passif.id, { capitalRestantDu: m })}
              />
              <ChampMontant
                label="Mensualité"
                montant={passif.mensualite}
                onChange={(m) => majPassif(passif.id, { mensualite: m })}
              />
              <ChampTexte
                label="Échéance"
                type="date"
                valeur={passif.echeance}
                onChange={(v) => majPassif(passif.id, { echeance: v })}
              />
              <ChampTexte
                label="Remarque"
                valeur={passif.remarque}
                onChange={(v) => majPassif(passif.id, { remarque: v })}
              />
            </div>
          </div>
        ))}
        <button className="bouton terracotta ligne-ajout" onClick={ajouterPassif}>
          + Ajouter un crédit
        </button>
      </Carte>
    </>
  )
}
