# ---- dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ca.pem ikut terbawa (DB_SSL=true membutuhkannya)
USER node
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
