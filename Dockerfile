FROM logic-qcm-plus AS logic

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.docker.json ./package.json
COPY tsconfig.json ./tsconfig.json

COPY --from=logic /app/dist               ./vendor/logic-qcm-plus/dist
COPY --from=logic /app/package.json       ./vendor/logic-qcm-plus/package.json

# Supprime le script "prepare" pour ne pas relancer tsc dans logic
RUN sed -i '/"prepare"/d' vendor/logic-qcm-plus/package.json

# logic ne rebuild pas
RUN npm install

# Copie du src du back 
COPY src/ ./src

# Compilation finale de back
RUN npm run build

# Distroless
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

COPY --from=builder /app/dist          ./dist
COPY --from=builder /app/node_modules  ./node_modules
COPY --from=builder /app/vendor        ./vendor
COPY package.docker.json               ./package.json

CMD ["dist/app.js"]
