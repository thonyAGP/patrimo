# Patrimo

Application tablette pour agent d'assurance indépendant : saisie structurée de
la découverte patrimoniale d'un prospect **pendant le rendez-vous**, 100 %
hors-ligne, avec stockage local et synchronisation serveur à venir.

Le plan d'architecture complet est dans [ARCHITECTURE.md](ARCHITECTURE.md).

## Démarrer

```bash
npm install
npm run dev        # développement (http://localhost:5173)
npm run build      # build de production (dossier dist/)
npm run preview    # sert le build localement
```

## Ce que fait le MVP (Phase 1)

- **Liste des dossiers** : recherche par nom, statut pipeline (prospect → client), tri par dernière modification.
- **Dossier de découverte** par sections : état civil & foyer, situation professionnelle, patrimoine (actifs/passifs), contrats existants, budget, objectifs priorisés, notes de rendez-vous.
- **Statut de fiabilité** sur chaque montant (`✓ confirmé / ≈ estimé / ? à obtenir`) — les données « à obtenir » alimentent automatiquement la liste des pièces à demander, visible dans la synthèse.
- **Synthèse** : total actifs/passifs, patrimoine net estimé, objectifs priorisés, pièces manquantes.
- **Offline-first** : toutes les données sont écrites dans IndexedDB (Dexie) avec sauvegarde automatique — aucun réseau nécessaire en rendez-vous. L'application est une PWA installable sur l'écran d'accueil de la tablette.
- **Journal d'opérations** : chaque écriture est tracée localement, prête à être rejouée vers un backend (Supabase, région UE) — voir `src/sync/sync.ts`.

## Prochaines étapes (voir ARCHITECTURE.md)

- Phase 1.5 : synchronisation serveur (Supabase) + authentification.
- Phase 2 : synthèse PDF, photos de documents, consentement RGPD signé, relances.
- Phase 3 : trame de questionnaire paramétrable, profil investisseur, multi-utilisateurs.

## Structure du code

```
src/
├── domaine/types.ts      # modèle métier du dossier de découverte
├── db/db.ts              # base locale (Dexie/IndexedDB) + journal d'opérations
├── sync/sync.ts          # état de synchronisation (squelette local-first)
├── composants/champs.tsx # champs de formulaire tactiles réutilisables
├── pages/                # liste des dossiers, page dossier (auto-sauvegarde)
└── sections/             # les 8 sections du questionnaire de découverte
```
