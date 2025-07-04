#!/bin/bash

# Script de création de branches Git : feat/<nom> ou fix/<nom>
# - Convertit automatiquement le nom en kebab-case
# - Vérifie si la branche existe déjà localement ou sur origin

# Vérifie que l'on est bien dans un dépôt Git
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Erreur : ce répertoire n'est pas un dépôt Git."
  exit 1
fi

# Vérifie les arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage : npm run create:branch -- feat|fix|chore|refactor nom-de-la-branche"
  exit 1
fi

TYPE=$1

# Vérifie que le type est autorisé
if [[ "$TYPE" != "feat" && "$TYPE" != "fix" ]]; then
  echo "Type de branche invalide : $TYPE (utiliser feat ou fix)"
  exit 1
fi

# Nom brut de la branche à partir des arguments suivants
RAW_NAME="${*:2}"

# Conversion en kebab-case :
# - minuscules
# - remplace espaces et underscores par des tirets
# - supprime tout caractère non alphanumérique ou tiret
NAME=$(echo "$RAW_NAME" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | sed 's/[^a-z0-9\-]//g')
BRANCH_NAME="$TYPE/$NAME"

# Vérifie si la branche existe en local
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
  echo "Erreur : la branche locale '$BRANCH_NAME' existe déjà."
  exit 1
fi

# Vérifie si la branche existe sur le remote
if git ls-remote --exit-code --heads origin "$BRANCH_NAME" > /dev/null 2>&1; then
  echo "Erreur : la branche distante 'origin/$BRANCH_NAME' existe déjà."
  exit 1
fi

# Se place sur develop à jour
git checkout develop && git pull origin develop

# Crée la nouvelle branche
git checkout -b "$BRANCH_NAME"

echo "Branche créée : $BRANCH_NAME"
