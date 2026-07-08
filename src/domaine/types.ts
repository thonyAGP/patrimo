// Modèle du dossier de découverte patrimoniale.
// Chaque montant porte un statut de fiabilité : en rendez-vous on note souvent
// une estimation, et les valeurs « à obtenir » alimentent la liste des pièces
// à demander au prospect.

export type StatutDonnee = 'confirme' | 'estime' | 'a_obtenir'

export interface Montant {
  valeur: number | null
  statut: StatutDonnee
}

export const montantVide = (): Montant => ({ valeur: null, statut: 'estime' })

export type StatutPipeline =
  | 'prospect'
  | 'rdv1_fait'
  | 'rdv2_planifie'
  | 'proposition'
  | 'client'
  | 'sans_suite'

export const LIBELLES_PIPELINE: Record<StatutPipeline, string> = {
  prospect: 'Prospect',
  rdv1_fait: 'RDV 1 fait',
  rdv2_planifie: 'RDV 2 planifié',
  proposition: 'Proposition',
  client: 'Client',
  sans_suite: 'Sans suite'
}

export interface Enfant {
  id: string
  prenom: string
  anneeNaissance: number | null
  aCharge: boolean
}

export interface EtatCivil {
  civilite: '' | 'M.' | 'Mme'
  nom: string
  prenom: string
  dateNaissance: string
  telephone: string
  email: string
  adresse: string
  situationFamiliale:
    | ''
    | 'celibataire'
    | 'marie'
    | 'pacse'
    | 'concubinage'
    | 'divorce'
    | 'veuf'
  regimeMatrimonial: string
  enfants: Enfant[]
  conjointNom: string
  conjointPrenom: string
  conjointDateNaissance: string
  conjointProfession: string
}

export interface SituationPro {
  profession: string
  statut:
    | ''
    | 'salarie'
    | 'tns'
    | 'fonctionnaire'
    | 'chef_entreprise'
    | 'retraite'
    | 'sans_activite'
  employeur: string
  revenuNetMensuel: Montant
  revenuConjointMensuel: Montant
  autresRevenusMensuels: Montant
  tmi: '' | '0' | '11' | '30' | '41' | '45'
  commentaire: string
}

export type TypeActif =
  | 'residence_principale'
  | 'residence_secondaire'
  | 'immobilier_locatif'
  | 'livrets'
  | 'assurance_vie'
  | 'pea'
  | 'compte_titres'
  | 'per'
  | 'scpi'
  | 'actif_professionnel'
  | 'autre'

export const LIBELLES_ACTIF: Record<TypeActif, string> = {
  residence_principale: 'Résidence principale',
  residence_secondaire: 'Résidence secondaire',
  immobilier_locatif: 'Immobilier locatif',
  livrets: 'Livrets / épargne bancaire',
  assurance_vie: 'Assurance-vie',
  pea: 'PEA',
  compte_titres: 'Compte-titres',
  per: 'PER',
  scpi: 'SCPI',
  actif_professionnel: 'Actif professionnel',
  autre: 'Autre'
}

export interface Actif {
  id: string
  type: TypeActif
  libelle: string
  valeur: Montant
  remarque: string
}

export interface Passif {
  id: string
  libelle: string
  capitalRestantDu: Montant
  mensualite: Montant
  echeance: string
  remarque: string
}

export type TypeContrat =
  | 'assurance_vie'
  | 'per'
  | 'prevoyance'
  | 'sante'
  | 'emprunteur'
  | 'retraite_entreprise'
  | 'autre'

export const LIBELLES_CONTRAT: Record<TypeContrat, string> = {
  assurance_vie: 'Assurance-vie',
  per: 'PER',
  prevoyance: 'Prévoyance',
  sante: 'Santé',
  emprunteur: 'Assurance emprunteur',
  retraite_entreprise: 'Retraite entreprise',
  autre: 'Autre'
}

export interface Contrat {
  id: string
  type: TypeContrat
  compagnie: string
  libelle: string
  dateEffet: string
  encours: Montant
  cotisationMensuelle: Montant
  clauseBeneficiaire: string
  remarque: string
}

export interface Budget {
  chargesMensuelles: Montant
  epargneMensuelleActuelle: Montant
  capaciteEpargneMensuelle: Montant
  commentaire: string
}

export type TypeObjectif =
  | 'retraite'
  | 'capitalisation'
  | 'transmission'
  | 'protection_famille'
  | 'fiscalite'
  | 'revenus_complementaires'
  | 'projet'
  | 'autre'

export const LIBELLES_OBJECTIF: Record<TypeObjectif, string> = {
  retraite: 'Préparer la retraite',
  capitalisation: 'Capitaliser / valoriser',
  transmission: 'Transmettre',
  protection_famille: 'Protéger la famille',
  fiscalite: 'Optimiser la fiscalité',
  revenus_complementaires: 'Revenus complémentaires',
  projet: 'Projet (achat, études…)',
  autre: 'Autre'
}

export interface Objectif {
  id: string
  type: TypeObjectif
  description: string
  horizon: '' | 'court' | 'moyen' | 'long'
  montantCible: Montant
  priorite: 1 | 2 | 3
}

export interface NoteRdv {
  id: string
  date: string
  texte: string
}

// Photo de document jointe au dossier (stockée dans sa propre table pour ne
// pas alourdir le document dossier ni son journal d'opérations).
export type CategorieDocument =
  | 'avis_imposition'
  | 'releve_compte'
  | 'contrat'
  | 'tableau_amortissement'
  | 'identite'
  | 'autre'

export const LIBELLES_CATEGORIE_DOCUMENT: Record<CategorieDocument, string> = {
  avis_imposition: "Avis d'imposition",
  releve_compte: 'Relevé de compte / contrat',
  contrat: 'Contrat',
  tableau_amortissement: "Tableau d'amortissement",
  identite: "Pièce d'identité",
  autre: 'Autre'
}

export interface DocumentPhoto {
  id: string
  dossierId: string
  libelle: string
  categorie: CategorieDocument
  mime: string
  donnees: Blob
  creeLe: string
}

// Consentement RGPD signé sur la tablette pendant le rendez-vous.
export interface Consentement {
  texte: string
  signePar: string
  signature: string // data URL PNG du tracé
  horodatage: string
}

export const TEXTE_CONSENTEMENT =
  'Je consens à la collecte et au traitement de mes données personnelles, familiales et patrimoniales par mon conseiller, aux seules fins d’analyse de ma situation et de conseil en assurance, conformément au RGPD. Je peux exercer à tout moment mes droits d’accès, de rectification et de suppression de ces données auprès de mon conseiller.'

export interface Dossier {
  id: string
  statutPipeline: StatutPipeline
  etatCivil: EtatCivil
  situationPro: SituationPro
  actifs: Actif[]
  passifs: Passif[]
  contrats: Contrat[]
  budget: Budget
  objectifs: Objectif[]
  notes: NoteRdv[]
  // Champs optionnels (ajoutés en Phase 2) : absents des dossiers créés avant.
  relance?: string // date ISO de la prochaine relance
  consentement?: Consentement | null
  creeLe: string
  modifieLe: string
}

export function nouveauDossier(): Dossier {
  const maintenant = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    statutPipeline: 'prospect',
    etatCivil: {
      civilite: '',
      nom: '',
      prenom: '',
      dateNaissance: '',
      telephone: '',
      email: '',
      adresse: '',
      situationFamiliale: '',
      regimeMatrimonial: '',
      enfants: [],
      conjointNom: '',
      conjointPrenom: '',
      conjointDateNaissance: '',
      conjointProfession: ''
    },
    situationPro: {
      profession: '',
      statut: '',
      employeur: '',
      revenuNetMensuel: montantVide(),
      revenuConjointMensuel: montantVide(),
      autresRevenusMensuels: montantVide(),
      tmi: '',
      commentaire: ''
    },
    actifs: [],
    passifs: [],
    contrats: [],
    budget: {
      chargesMensuelles: montantVide(),
      epargneMensuelleActuelle: montantVide(),
      capaciteEpargneMensuelle: montantVide(),
      commentaire: ''
    },
    objectifs: [],
    notes: [],
    relance: '',
    consentement: null,
    creeLe: maintenant,
    modifieLe: maintenant
  }
}
