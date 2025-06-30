# Étape 1 : Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY vendor/logic-qcm-plus ./vendor/logic-qcm-plus
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Étape 2 : Run (image finale)
FROM gcr.io/distroless/nodejs20-debian11

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/vendor ./vendor
COPY package.json ./

CMD ["dist/app.js"]
