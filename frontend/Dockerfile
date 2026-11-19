# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

# Vite membakar nilai ini ke bundle saat build, bukan saat runtime
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- serve dengan vite preview (tanpa nginx) ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4173

# --host 0.0.0.0 wajib agar port bisa diakses dari host
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
