# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

RUN npx prisma generate

RUN --mount=type=secret,id=app_env,target=/app/.env \
    npm run build

EXPOSE 3000

CMD ["npm", "start"]
