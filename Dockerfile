# Étape 0 : on récupère logic-qcm-plus tout prêt
FROM logic-qcm-plus AS logic

# Étape 1 : Build de back-qcm-plus
FROM node:20-alpine AS builder
WORKDIR /app

# 1️⃣ On copie package.json de back et tsconfig
COPY package.docker.json ./package.json
COPY tsconfig.json ./tsconfig.json

# 2️⃣ On intègre logic-qcm-plus complet dans vendor
COPY --from=logic /app/dist               ./vendor/logic-qcm-plus/dist
COPY --from=logic /app/package.json       ./vendor/logic-qcm-plus/package.json

# 3️⃣ On supprime le script "prepare" pour ne pas relancer tsc dans logic
RUN sed -i '/"prepare"/d' vendor/logic-qcm-plus/package.json

# 4️⃣ Installation des dépendances (logic ne rebuild pas)
RUN npm install

# 5️⃣ On copie votre code source de back
COPY src/ ./src

# 6️⃣ Compilation finale de back
RUN npm run build

# Étape 2 : Image finale distroless
FROM gcr.io/distroless/nodejs20-debian11
WORKDIR /app

COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/vendor        ./vendor
COPY package.docker.json               ./package.json

CMD ["dist/app.js"]
