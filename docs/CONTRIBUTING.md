# **Contribution au projet Back**

## Structure des branches

Ce document décrit les étapes pour cloner, installer, développer, tester, lint et dockeriser le projet **back-qcm-plus**.
Le dépot **back-qcm-plus** suit une stratégie de branches stricte pour assurer la stabilité, la traçabilité et la qualité du code.

---
## 2. Clonage des dépôts

```bash
git clone https://github.com/MarysaR/back-qcm-plus.git - back-qcm-plus
```

---

## 3. Installation et lien local

### 3.1. Dans logic-qcm-plus

```bash
cd logic-qcm-plus
npm install
npm run build
npm link
```

> *Cette commande crée un lien symbolique global `logic-qcm-plus` pointant sur votre dossier `logic-qcm-plus`.*

### 3.2. Dans `back-qcm-plus`

```bash
cd back-qcm-plus
npm install
npm link logic-qcm-plus
```

> *`npm link logic-qcm-plus` crée dans `node_modules` un lien symbolique vers le code de `logic-qcm-plus`.*

---

## 4. Scripts npm

```jsonc
"scripts": {
  "build": "tsc",
  "start": "npm run build && node dist/app.js",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --check src/**/*.ts",
  "docker:build": "bash scripts/docker-prepare.sh && docker build -t back-qcm-plus ."
}
```

* `npm run build` : build TypeScript du backend
* `npm run start` : build + démarrage
* `npm run lint` / `npm run lint:fix` : contrôles ESLint
* `npm run format` : vérification Prettier
* `npm run docker:build` : préparation + build Docker

---

## 5. Lint en mode watch (optionnel)

Ajouter dans chaque `package.json` :

```json
"scripts": {
  "lint:watch": "eslint . --ext .ts --watch"
}
```

Puis lancer :

```bash
npm run lint:watch
```

> *`Les erreurs ESLint` s’affichent en temps réel.*

---

## 6. Build & Docker

Dockerfile (à la racine de `back-qcm-plus`) :

```bash
cd back-qcm-plus
docker build -t back-qcm-plus .
docker run --rm -p 3000:3000 back-qcm-plus
```

---

## 7. Branches & workflow Git

* **`main`** : code stable, pas de commit direct
* **`develop`** : intégration continue, tests et lint doivent passer
* **`feat/<nom>`** : nouvelle fonctionnalité (tests TDD)
* **`fix/<nom>`** : correctif ciblé
* **`chore/<nom>`** : tâche technique
* **`refactor/<nom>`** : refactoring

Respecter les workflows CI (compilation, lint, tests) avant tout merge vers `develop`, puis vers `main`.

**Avant chaque push sur une branche, il faut obligatoirement exécuter :**
```bash
npm run lint
```

*S’il y a des erreurs, exécuter :*

```bash
npm run lint:fix
```

Sinon le workflow GitHub Action des lint échouera (voir CI : compilation TypeScript, lint ESLint, format Prettier).

---

### Branches de travail

* `feat/<nom>` : développement d'une fonctionnalité métier (TDD strict).
* `fix/<nom>` : correction ciblée d’un bug. Aucun test associé exigé.
* `chore/<nom>` : tâche technique
* `refactor/<nom>` : refactoring

---

## Création des branches

### Initialisation locale (1ère fois)

Avant la première utilisation du script de création de branche :

```bash
chmod +x tools/create-branch.sh
```

Ensuite :

```bash
npm run create:branch -- feat Ajouter l'authentification stagiaire
```

Cette commande va :

* Se placer automatiquement sur `develop`
* Vérifier que la branche n’existe pas déjà
* Convertir le nom en kebab-case
* Créer la branche au format `feat/ajouter-lauthentification-stagiaire`

---

## Règles générales

### `main`

* Interdiction de modifier directement cette branche.
* Ne recevoir que des fusions de `develop`.
* Contenu toujours stable et démontrable.

### `develop`

* Aucune modification directe.
* Fusion uniquement de branches `feat/*`, `fix/*`, `chore/*` ou `refactor/*`.
* Tous les tests doivent passer avant fusion.

---

## Fonctionnalités (`feat/<nom>`)

* Création depuis `develop` uniquement.
* Développement selon le cycle TDD (test rouge → implémentation (green) → refactorisation).
  \*Tests unitaires obligatoires.
* Nettoyage obligatoire avant fusion (logs, commentaires, fichiers temporaires).

---

## Correctifs (`fix/<nom>`)

* Création depuis `develop` uniquement.
* Portée strictement limitée au correctif.
* Aucun test unitaire associé requis.
* Vérification manuelle suffisante avant fusion.

---

## Règles de fusion

| Source       | Cible     | Autorisé | Conditions                                                      |
| ------------ | --------- | -------- | --------------------------------------------------------------- |
| `feat/*`     | `develop` | Oui      | Tests passés, code propre, conforme au besoin                   |
| `fix/*`      | `develop` | Oui      | Correctif ciblé et vérifié manuellement                         |
| `chore/*`    | `develop` | Oui      | Tâche technique propre et validée                               |
| `refactor/*` | `develop` | Oui      | Refactoring terminé, code propre, pas de régression             |
| `develop`    | `main`    | Oui      | Fin de lot ou jalon validé. Tout le contenu est testé et stable |
| `main`       | `develop` | Non      | Interdiction absolue                                            |
| `develop`    | `feat/*`  | Oui      | Rebase autorisé pour synchronisation locale                     |

---

## Bonnes pratiques

* Commits clairs et explicites : `feat: ajout de la création de questionnaire`, `fix: doublon autorisé`
* Aucun code mort, `console.log` ou commentaire temporaire ne doit être mergé.
* La qualité et la lisibilité du code sont prioritaires.

---

## Contrôles automatiques GitHub (Workflows CI)

### 1. CI standard => (`.github/workflows/ci.yml`)

* Exécuté sur `main` et `develop`
* Vérifie : compilation TypeScript, ESLint, Prettier, tests unitaires Jest

### 2. CI allégée pour `feat/*`, `fix/*`, `chore/*`, `refactor/*` => (ci-feature.yml)

* Exécuté uniquement pour les PR vers `develop`
* Vérifie uniquement les tests (exécution rapide)

### 3. Convention de nommage de branches => (`branch-convention.yml`)

* Interdit les push directs sur `main` et `develop`
* Refuse toute branche ne préfixant pas par `feat/`, `fix/`, `chore/` ou `refactor/`

### 4. Convention de nommage des PR => (`pr-convention.yml`)

* Empêche les PR vers `main` ou `develop` depuis une branche non conforme
* Refuse par exemple `feature/...` ou `ajout-auth`, impose `feat/...` ou `fix/...`

---

## Exemple de cycle complet

1. L'utilisateur lance :

   ```bash
   npm run create:branch -- feat/mre_add_user_back
   ```

2. Le script crée `feat/mre_add_user_back` depuis `develop`

3. Une fois terminé, une PR est ouverte vers `develop`

4. Les workflows vérifient :

   * le nom de la branche
   * le nom de la PR
   * les tests
   * le lint, le format, la compilation si vers `develop`

5. Une fois la PR approuvée, elle est mergée dans `develop`

6. `develop` est mergé dans `main` à la fin de la fonctionnalité (version stable)
