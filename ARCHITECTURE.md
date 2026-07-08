# Patrimo — Plan d'architecture

Outil tablette pour agent d'assurance indépendant : saisie structurée de la situation d'un prospect **pendant le rendez-vous** (patrimoine, finances, contrats, objectifs), stockage sécurisé, et exploitation ultérieure sans re-saisie.

---

## 1. Contexte et objectifs

**Problème actuel** : la phase de découverte en rendez-vous est saisie sur papier ou tablette non structurée, puis re-saisie plus tard (perte de temps, erreurs, données non exploitables).

**Objectifs de l'outil** :

1. **Saisie fluide en rendez-vous** sur tablette, y compris **sans connexion internet** (chez le prospect, réseau incertain).
2. **Zéro re-saisie** : les données capturées alimentent directement les étapes suivantes (analyse, rapport, proposition, documents réglementaires).
3. **Exploitation** : consultation, recherche, comparaison avant/après, génération de synthèses PDF, préparation du rendez-vous n°2.
4. **Conformité** : données patrimoniales = données sensibles → RGPD, et cadre DDA (recueil des exigences et besoins, devoir de conseil).

---

## 2. Cas d'usage principaux

| Acteur | Cas d'usage |
|---|---|
| Agent (en RDV) | Créer un prospect, dérouler le questionnaire de découverte par sections, saisir vite (listes, toggles, montants), joindre photos de documents (avis d'imposition, relevés), signer le recueil de consentement |
| Agent (au bureau) | Retrouver un dossier, compléter/corriger, générer une synthèse PDF, préparer une proposition, suivre le pipeline (prospect → client) |
| Agent (mobilité) | Travailler hors-ligne, synchroniser automatiquement au retour du réseau |
| Plus tard : cabinet | Multi-agents, partage de dossiers, statistiques |

---

## 3. Modèle de données (domaine métier)

Le cœur de l'appli est un **dossier de découverte** structuré. Modèle relationnel proposé :

```
Prospect (personne)
├── ÉtatCivil            : identité, situation familiale, régime matrimonial, enfants/personnes à charge
├── Foyer                : conjoint (lui-même un Prospect lié), rattachements
├── SituationPro         : profession, statut (salarié/TNS/retraité), revenus, TMI
│
├── Patrimoine
│   ├── ActifImmobilier   : résidence principale/secondaire/locatif, valeur, crédit associé
│   ├── ActifFinancier    : livrets, PEA, compte-titres, assurance-vie, PER, crypto…
│   ├── ActifProfessionnel: parts de société, fonds de commerce
│   └── Passif            : crédits (immo, conso), montant restant dû, échéance
│
├── ContratExistant       : type (AV, PER, prévoyance, santé, emprunteur…), compagnie,
│                           date d'effet, encours/cotisation, clause bénéficiaire, frais
│
├── BudgetFlux            : revenus récurrents, charges, capacité d'épargne mensuelle
│
├── Objectifs             : liste priorisée — retraite, capitalisation, transmission,
│                           protection famille, fiscalité, projet (achat, études enfants)…
│                           avec horizon, montant cible, priorité
│
├── ProfilInvestisseur    : questionnaire risque (connaissance, expérience, tolérance,
│                           capacité de perte) → profil calculé (prudent/équilibré/dynamique)
│
├── Documents             : photos/scans joints (avis d'imposition, relevés, tableaux d'amortissement)
├── Consentements         : RGPD, signature du recueil, horodatage
└── RendezVous / Notes    : compte-rendus, prochaines étapes, statut pipeline
```

**Principes clés** :

- **Versionnage** : chaque modification est historisée (audit trail) — indispensable pour la conformité et pour mesurer l'évolution du patrimoine entre deux rendez-vous.
- **Questionnaire paramétrable** : les sections/questions sont décrites en configuration (JSON), pas codées en dur → le frère peut faire évoluer sa trame de découverte sans redéploiement.
- **Champs "incomplet/à confirmer"** : en RDV on n'a pas toujours tout ; chaque donnée peut être marquée `estimée / confirmée / à obtenir`, ce qui génère automatiquement la liste des pièces à demander.

---

## 4. Architecture technique

### 4.1 Choix de plateforme : **PWA offline-first** (recommandé)

| Option | Avantages | Inconvénients |
|---|---|---|
| **PWA (web app installable)** ✅ | Un seul code, installable sur iPad/Android, pas d'App Store, mises à jour instantanées, offline via Service Worker + IndexedDB | Accès capteurs un peu plus limité (suffisant ici : caméra OK) |
| Native (React Native/Expo) | Meilleure intégration OS | Publication stores, 2 builds, plus lourd pour un utilisateur unique |
| App desktop/web simple | Simple | Pas d'offline fiable en RDV → rédhibitoire |

Pour un utilisateur unique au départ, la **PWA** minimise le coût et la friction. Expo/React Native reste une évolution possible si un vrai besoin natif apparaît.

### 4.2 Vue d'ensemble

```
┌────────────────────── Tablette (PWA) ──────────────────────┐
│  UI React (formulaires de découverte, dossier, recherche)  │
│  État local : base embarquée (IndexedDB / SQLite-wasm)     │
│  Moteur de sync (file d'attente d'opérations, offline)     │
│  Service Worker (cache app + assets → fonctionne offline)  │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTPS (sync quand réseau dispo)
┌───────────────────────────▼────────────────────────────────┐
│                     Backend (hébergé UE)                   │
│  API (REST/tRPC) + Authentification (email + MFA)          │
│  PostgreSQL (données dossiers, historisation)              │
│  Stockage objets chiffré (photos/scans de documents)       │
│  Génération PDF (synthèse patrimoniale, recueil signé)     │
│  Sauvegardes automatiques quotidiennes                     │
└────────────────────────────────────────────────────────────┘
```

### 4.3 Stack proposée (pragmatique pour démarrer)

- **Frontend** : React + TypeScript (Vite ou Next.js), UI orientée tablette (grands touch targets, saisie au doigt), bibliothèque de composants type shadcn/ui.
- **Stockage local** : IndexedDB via Dexie.js, ou SQLite-wasm — toutes les écritures se font **d'abord en local** (local-first), l'appli est donc toujours instantanée et utilisable offline.
- **Synchronisation** : file d'opérations horodatées rejouées vers le serveur au retour du réseau. Avec un seul utilisateur, les conflits sont quasi inexistants (stratégie simple : dernière écriture gagne + journal). Des solutions prêtes à l'emploi existent : **Supabase + PowerSync**, **ElectricSQL**, ou **RxDB**.
- **Backend** : au plus simple, **Supabase** (PostgreSQL + Auth + stockage fichiers + API auto-générée, hébergeable en région UE) — évite de développer et maintenir un serveur custom. Alternative : Node.js (Fastify/NestJS) + PostgreSQL si besoin de logique serveur riche.
- **PDF** : génération serveur (Playwright/Chromium headless sur un template HTML) → synthèse patrimoniale propre à remettre au client.

### 4.4 Offline-first : le point critique

Règle d'or : **le rendez-vous ne doit jamais dépendre du réseau**.

1. Toute l'appli (code + référentiels) est mise en cache par le Service Worker.
2. Toute saisie est écrite immédiatement en base locale (aucun spinner, aucun échec possible en RDV).
3. Un indicateur discret montre l'état de sync (`local / synchronisé`).
4. Au retour du réseau, la sync pousse les changements et récupère ceux du serveur.
5. Les photos de documents sont stockées localement puis téléversées en tâche de fond.

---

## 5. Sécurité et conformité (RGPD / DDA)

Données patrimoniales et financières = fort niveau d'exigence :

- **Hébergement en UE** (Supabase région EU, ou Scaleway/OVH si backend custom).
- **Chiffrement** : TLS en transit ; chiffrement au repos côté serveur ; sur tablette, verrouillage de l'appli (code PIN/biométrie) + possibilité de chiffrer la base locale.
- **Authentification** : compte unique au départ, mot de passe fort + MFA ; sessions expirantes.
- **RGPD** : registre de traitement, consentement recueilli et horodaté dans l'appli (avec signature tactile), droit d'accès/rectification/suppression (fonction « purger un dossier »), durée de conservation paramétrée.
- **DDA / devoir de conseil** : le questionnaire de découverte structuré sert directement de **recueil des exigences et besoins** ; l'export PDF signé en constitue la preuve. L'historisation (audit trail) protège l'agent en cas de contrôle ou litige.
- **Sauvegardes** : quotidiennes, testées, avec rétention (ex. 30 jours).

---

## 6. Exploitation des données (la valeur après le RDV)

- **Fiche de synthèse patrimoniale** générée en PDF : bilan actif/passif, camembert de répartition, flux, objectifs priorisés — support du 2ᵉ rendez-vous.
- **Liste automatique des pièces manquantes** (issue des champs « à obtenir »).
- **Recherche et pipeline** : filtres (objectif = transmission, TMI > 30 %, contrat arrivant à échéance…), statut du dossier (prospect → RDV2 → proposition → client).
- **Pré-remplissage** : export des données vers les documents suivants (proposition, bulletins de souscription) — d'abord via export CSV/PDF, plus tard via connecteurs (CRM, extranets compagnies) si pertinent.
- **Évolution dans le temps** : photographie du patrimoine à chaque bilan → graphes d'évolution, argument de suivi client.

---

## 7. Roadmap proposée

### Phase 1 — MVP (l'essentiel du RDV)
- Auth simple (1 utilisateur), création de dossier prospect.
- Questionnaire de découverte complet par sections (état civil, pro, patrimoine, contrats, budget, objectifs), optimisé tablette.
- Fonctionnement 100 % offline + sync serveur.
- Liste des dossiers, recherche simple, notes de RDV.

### Phase 2 — Exploitation
- Synthèse patrimoniale PDF, liste des pièces manquantes. *(liste des pièces : fait)*
- Photos de documents jointes au dossier. *(fait : compression automatique, stockage local)*
- Consentement RGPD avec signature tactile. *(fait)*
- Pipeline/statuts et rappels de relance. *(fait : date de relance + badge d'échéance)*

### Phase 3 — Confort et croissance
- Questionnaire paramétrable (l'agent édite sa trame lui-même).
- Profil investisseur avec scoring automatique.
- Graphes d'évolution du patrimoine, tableaux de bord.
- Multi-utilisateurs (si le cabinet grossit), exports/connecteurs CRM.

---

## 8. Risques et points d'attention

| Risque | Mitigation |
|---|---|
| Perte/vol de la tablette avec données sensibles | Verrouillage appli, chiffrement local, données maîtres sur serveur, révocation de session à distance |
| Sync défaillante → perte de saisie | Local-first : la donnée locale est la source pendant le RDV ; journal d'opérations rejouable |
| Questionnaire trop long → abandon en RDV | Sections indépendantes, tout est optionnel, saisie rapide (montants approximatifs marqués « estimé ») |
| Sur-ingénierie au départ | MVP strict : un utilisateur, Supabase managé, pas de connecteurs avant que le besoin soit prouvé |
