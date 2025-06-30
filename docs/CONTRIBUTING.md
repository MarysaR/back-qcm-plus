# **Contribution au projet Back**

## Structure des branches

Le projet **back-qcm-plus** suit une stratégie de branches stricte pour assurer la stabilité, la traçabilité et la qualité du code.

### Branches principales

* `main` : version stable, livrable, démontrable en production.
* `develop` : branche d’intégration des développements en cours (stabilisation avant merge vers `main`).

### Branches de travail

* `feat/<nom>` : développement d'une fonctionnalité (infra, API, provider, controller, etc.).
* `fix/<nom>` : correction ciblée d’un bug. Aucun test associé exigé (vérification manuelle possible).

---

## Création des branches

### Initialisation locale (1ère fois)

Avant la première utilisation du script de création de branche :

```bash
chmod +x scripts/create-branch.sh
```

Ensuite, utilisez :

```bash
npm run create:branch -- feat Ajouter gestion JWT
```

Ce script :

* Se place automatiquement sur `develop`
* Vérifie que la branche n’existe pas
* Convertit le nom en kebab-case
* Crée la branche au format `feat/ajouter-gestion-jwt`

---

## Règles générales

### `main`

* Push direct interdit
* Reçoit uniquement des merges depuis `develop`
* Doit rester stable et déployable

### `develop`

* Push direct interdit
* Fusion uniquement de `feat/*` ou `fix/*`
* Vérifications automatiques (CI) obligatoires avant merge

---

## Fonctionnalités (`feat/<nom>`)

* Création depuis `develop`
* Respect de l'architecture Clean
* Nettoyage avant merge : aucun log, console temporaire, code mort

---

## Correctifs (`fix/<nom>`)

* Création depuis `develop`
* Portée strictement limitée au bug
* Vérification manuelle suffisante avant merge

---

## Règles de fusion

| Source    | Cible     | Autorisé | Conditions                                 |
| --------- | --------- | -------- | ------------------------------------------ |
| `feat/*`  | `develop` | Oui      | CI passée, code propre, conforme au besoin |
| `fix/*`   | `develop` | Oui      | Correctif ciblé et vérifié                 |
| `develop` | `main`    | Oui      | Fin de lot, CI complète, version stable    |
| `main`    | `develop` | Non      | Interdit                                   |
| `develop` | `feat/*`  | Oui      | Rebase local autorisé pour synchro         |

---

## Bonnes pratiques

* Commits explicites : `feat: ajout auth JWT`, `fix: bug sur route ping`
* Aucun code mort, `console.log`, TODO non traité
* Lisibilité et qualité avant tout

---

## Contrôles automatiques GitHub (Workflows CI)

### CI standard (`.github/workflows/ci.yml`)

* Exécuté sur `main` et `develop`
* Vérifie :

  * Compilation TypeScript
  * ESLint
  * Prettier

### Convention branches (`branch-convention.yml`)

* Bloque push direct sur `main` / `develop`
* Refuse branches sans préfixe conforme (`feat/`, `fix/`, etc.)

### Convention PR (`pr-convention.yml`)

* Bloque PR depuis branches non conformes vers `main` / `develop`

---

## Exemple de cycle complet

- Création de la branche :

```bash
npm run create:branch -- feat ajout user controller
```

👉 Cela crée : `feat/ajout-user-controller`

- Développement
- PR vers `develop`
- Vérifications automatiques :

* Nom de branche
* Nom PR
* CI (compilation, lint, format)

- Merge vers `develop` une fois validé

- Merge de `develop` vers `main` à la fin d’une fonctionnalité
