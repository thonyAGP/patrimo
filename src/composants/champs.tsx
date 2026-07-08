import type { Montant, StatutDonnee } from '../domaine/types'

// Champs de formulaire orientés tablette : zones tactiles larges, libellés
// au-dessus, et pour les montants un bouton qui fait tourner le statut de
// fiabilité (confirmé → estimé → à obtenir).

export function ChampTexte(props: {
  label: string
  valeur: string
  onChange: (v: string) => void
  type?: 'text' | 'tel' | 'email' | 'date'
  placeholder?: string
}) {
  return (
    <label className="champ">
      <span className="champ-label">{props.label}</span>
      <input
        type={props.type ?? 'text'}
        value={props.valeur}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  )
}

export function ChampZone(props: {
  label: string
  valeur: string
  onChange: (v: string) => void
  lignes?: number
}) {
  return (
    <label className="champ champ-large">
      <span className="champ-label">{props.label}</span>
      <textarea
        rows={props.lignes ?? 3}
        value={props.valeur}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  )
}

export function ChampSelect(props: {
  label: string
  valeur: string
  options: [string, string][]
  onChange: (v: string) => void
}) {
  return (
    <label className="champ">
      <span className="champ-label">{props.label}</span>
      <select value={props.valeur} onChange={(e) => props.onChange(e.target.value)}>
        <option value="">—</option>
        {props.options.map(([valeur, libelle]) => (
          <option key={valeur} value={valeur}>
            {libelle}
          </option>
        ))}
      </select>
    </label>
  )
}

export function ChampNombre(props: {
  label: string
  valeur: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <label className="champ">
      <span className="champ-label">{props.label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={props.valeur ?? ''}
        onChange={(e) =>
          props.onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      />
    </label>
  )
}

const STATUT_SUIVANT: Record<StatutDonnee, StatutDonnee> = {
  confirme: 'estime',
  estime: 'a_obtenir',
  a_obtenir: 'confirme'
}

const STATUT_AFFICHAGE: Record<StatutDonnee, { texte: string; classe: string }> = {
  confirme: { texte: '✓ confirmé', classe: 'statut-confirme' },
  estime: { texte: '≈ estimé', classe: 'statut-estime' },
  a_obtenir: { texte: '? à obtenir', classe: 'statut-a-obtenir' }
}

export function ChampMontant(props: {
  label: string
  montant: Montant
  onChange: (m: Montant) => void
  suffixe?: string
}) {
  const affichage = STATUT_AFFICHAGE[props.montant.statut]
  return (
    <div className="champ">
      <span className="champ-label">
        {props.label}
        {props.suffixe ? ` (${props.suffixe})` : ' (€)'}
      </span>
      <div className="champ-montant">
        <input
          type="number"
          inputMode="decimal"
          value={props.montant.valeur ?? ''}
          onChange={(e) =>
            props.onChange({
              ...props.montant,
              valeur: e.target.value === '' ? null : Number(e.target.value)
            })
          }
        />
        <button
          type="button"
          className={`bouton-statut ${affichage.classe}`}
          onClick={() =>
            props.onChange({ ...props.montant, statut: STATUT_SUIVANT[props.montant.statut] })
          }
        >
          {affichage.texte}
        </button>
      </div>
    </div>
  )
}

export function formaterEuros(valeur: number | null): string {
  if (valeur === null) return '—'
  return valeur.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €'
}
