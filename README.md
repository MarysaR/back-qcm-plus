# **QCM-PLUS Back**

## Rôle dans l'architecture

### Présentation

`back-qcm-plus` est l’API REST du projet QCM-PLUS, développée en **TypeScript (Node.js + Express)** selon une **Clean Architecture**.
Elle s’appuie sur le **domaine métier pur** (`logic-qcm-plus`), sans dépendance directe, et fournit l’implémentation des interfaces d’infrastructure.

### Responsabilités

* Serveur API : Express + TypeScript
* Connexion au domaine pur (`logic-qcm-plus`)
* Implémentation des interfaces : Repositories, Providers
* Authentification, gestion utilisateurs, questionnaires
* Exposition des endpoints REST

### Technologies

* Node.js + Express
* TypeScript
* Prisma (client)
* ESLint + Prettier
* Docker multi-stage (distroless)
* GitHub Actions (CI/CD)
* Pattern Result (aucun try/catch)

### Architecture hexagonale

```bash
                ┌───────────── ┐
                │    CLIENT    │
                │   (React)    │
                └──────┬───────┘
                       │
                       ▼
               ┌───────────────┐
               │    BACK       │
               │  (Express)    │
               └──────┬────────┘
                       │
                       ▼
               ┌───────────────┐
               │    LOGIC      │
               │  (Domaine pur)│
               └───────────────┘
```

---

## Installation

```bash
npm install
npm run build
```

---

## Lancement de l'application

### En local (Node.js)

```bash
# Compilation TypeScript
npm run build

# Démarrage serveur
npm run start
```

> Compile les sources et démarre `node dist/app.js`.

### En Docker

```bash
# Build de l'image
npm run docker:build

# Lancer le conteneur
docker run --rm -p 3000:3000 back-qcm-plus
```

> Démarre l'application dans un conteneur Docker, exposée sur `localhost:3000`.

---

## Structure des dossiers

```bash
src/
├── config/           # Configurations
├── controllers/      # Endpoints API
├── database/         # Connexion BDD, Prisma client
├── providers/        # Auth, services techniques
├── repositories/     # Implémentation des interfaces logic
├── routes/           # Routes Express
├── tests/            # Tests unitaires / intégration
└── index.ts          # Entrée application

vendor/
└── logic-qcm-plus/   # Domaine pur importé

scripts/
├── create-branch.sh  # Création de branche
└── docker-prepare.sh # Préparation build Docker

workflows/
├── branch-convention.yml # Vérifie nom des branches
├── ci.yml                # Build + lint + format check
└── pr-convention.yml      # Vérifie nom des PR
```

---

## Scripts disponibles

```bash
npm run build          # Compilation TypeScript
npm run start          # Build + lancement serveur
npm run create:branch  # Créer une branche avec convention
npm run lint           # Vérification ESLint
npm run lint:fix       # Correction ESLint
npm run format:check   # Vérification format Prettier
npm run docker:build   # Build Docker multi-stage
```

---

## Lint / Format

`.eslintrc.json`

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "prettier/prettier": "error",
    "no-try": "error",
    "eqeqeq": ["error", "never"],
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

Ce que ça signifie :

* `no-try`: interdiction des `try/catch`, **Pattern Result obligatoire**
* `eqeqeq: never`: pas de `===` ni `!==`, on impose des comparaisons typées
* `no-explicit-any`: `any` interdit, types explicites obligatoires

`.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80
}
```

Ce que ça signifie :

* `semi: true`: point-virgule obligatoire
* `singleQuote: true`: apostrophes pour les chaînes
* `trailingComma: all`: virgule finale partout (objets, tableaux, params multilignes)
* `printWidth: 80`: largeur max des lignes 80 caractères (meilleure lisibilité)

---

## Docker

* **Multi-stage build** : Node Alpine + distroless
* **Vendor logic** intégré via script
* **Commandes :**

```bash
npm run docker:build
docker run --rm -p 3000:3000 back-qcm-plus
```

---

## GitHub Actions

* `branch-convention.yml` : Vérifie préfixes `feat/`, `fix/`, `chore/`, `refactor/` + interdit push direct `main` / `develop`
* `pr-convention.yml` : Vérifie préfixes PR
* `ci.yml` : Build + lint + format check sur `main` / `develop` + PR

---

## Contraintes de développement

* **Clean Architecture**
* **Pattern Result obligatoire**
* **No try/catch**
* **No explicit any**
* **Comparaisons typées uniquement**
* **Respect strict des conventions branches/PR**

---

## Contribution

Voir `CONTRIBUTING.md` pour les règles de contribution.
