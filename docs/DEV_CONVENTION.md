# Convention de Développement – Projet QCM Plus

---

## 1. Organisation du projet

Le projet est structuré en **trois sous-projets indépendants** (multi-stage), chacun ayant son cycle de vie, son `Dockerfile`, sa configuration CI/CD et ses dépendances séparées :

- **logic-qcm-plus** → cœur métier (architecture hexagonale, règles, tests)
- **back-qcm-plus** → infrastructure & API REST (Express/Node)
- **client-qcm-plus** → interface utilisateur (Front : React/Vue + Tailwind)

⚠️ Contrairement à un monorepo, chaque projet est **isolé** et déployé séparément.

---

## 2. Structure des répertoires

### logic-qcm-plus

- `src/`
  - `entities/` → entités métier (`User.ts`, `Questionnaire.ts`, …)
  - `use_cases/` → cas d’utilisation (`CreateUserUseCase.ts`, …)
  - `repositories/` → interfaces (contrats de persistance)
  - `commands/` → commandes (DTO en entrée des use cases)
  - `errors/` → erreurs centralisées (`ValidationError.ts`, `TechnicalError.ts`)
  - `result/` → implémentation du Pattern Result
  - `tests/` → **tests unitaires Jest (TDD obligatoire)**
- `jest.config.js`, `tsconfig.json`

### back-qcm-plus

- `src/`
  - `config/` → configuration serveur (db, auth, etc.)
  - `controllers/` → REST controllers (`UserController.ts`)
  - `routes/` → définitions routes API
  - `types/` → types spécifiques back-end
  - `app.ts` → point d’entrée serveur Express
- `Dockerfile` (multistage build back uniquement)
- `.dockerignore`, `.env`, `eslint.config.cjs`, `.prettierrc.json`

### client-qcm-plus

- `public/` → ressources statiques (favicon, icônes…)
- `src/`
  - `pages/` → pages (`LoginPage.vue`, `Dashboard.vue`, …)
  - `components/` → composants UI (`UserTable.vue`, `QuestionForm.vue`)
  - `services/` → appels API REST (`authService.ts`, `userService.ts`)
  - `types/` → types spécifiques front
- `tailwind.config.js`, `vite.config.ts`
- `Dockerfile` (multistage build front uniquement)

---

## 3. Patterns de développement

### Pattern Result

- Retour explicite des use cases sous forme `Result<T, E>`.
- **Zéro try/catch** → tout flux d’erreur passe par `Err.of(...)`.
- Erreurs centralisées uniquement (`ValidationError`, `PermissionDeniedError`, `NotFoundError`, …).

### Pattern Command

- Chaque action métier encapsulée dans une **commande** (`CreateUserCommand`, `AddQuestionCommand`).
- Testable indépendamment, sans dépendance externe.

---

## 4. Contraintes qualité code

- **Zéro try/catch** → Pattern Result obligatoire.
- **Zéro any** → typage strict TypeScript.
- **Zéro === / !==** → comparaisons typées (enum, unions).
- **Approche fonctionnelle** → fonctions pures.
- **Immutabilité** → entités en `readonly`.

---

## 5. Développement & Tests (TDD)

- **TDD obligatoire** : RED → GREEN → REFACTOR.
- **Tests Jest** :
  - Mocks explicites avec `jest.Mocked<Repository>`.
  - Pas de fixtures ni TempRepo.
  - Tous les cas doivent être testés :
    - droits insuffisants
    - champs invalides
    - doublons
    - inexistant
    - erreur technique
    - succès nominal

---

## 6. Back (API REST)

- Controllers REST stricts (aucune logique métier).
- Routes :
  - `POST /users` → créer
  - `PUT /users/:id` → modifier
  - `DELETE /users/:id` → supprimer
  - `GET /users` → liste
- Retour standardisé : `sendSuccessResponse` / `sendErrorResponse(error.toHttpError())`.

---

## 7. Client (Front)

- **Boutons explicites** :
  - Login → “Se connecter”
  - CRUD stagiaires → “+ Créer”, “Modifier”, “Supprimer”
  - Questionnaire → “Ajouter question”, “Désactiver”
  - QCM stagiaire → “Valider”, “Suivant”, “Précédent”, “Sauvegarder et quitter”
- **Formulaires validés** côté front & back.
- **Feedback utilisateur** (toast, messages d’erreur).
- **Responsive obligatoire**.

---

## 8. Workflow Git

- Branches :
  - `feat/<nom>` → nouvelle fonctionnalité
  - `fix/<nom>` → correction
  - `refactor/<nom>` → refonte
- Commits :
  - `feat: add user creation - TICKET-ID`
- CI/CD séparée pour chaque projet (`logic`, `back`, `client`).
- Pipelines multi-stage avec build, lint, tests unitaires.

---

## 9. Checklist “Definition of Done”

- Code conforme aux conventions
- UseCase implémenté avec **Command + Result**
- Tests Jest écrits en premier (RED/GREEN/REFACTOR)
- Pas de `any`, pas de `try/catch`, pas de `===`
- Entités immuables et typées
- API REST conforme
- Client : formulaires + boutons explicites + feedback UX
- CI/CD multi-stage → build + lint + tests verts
