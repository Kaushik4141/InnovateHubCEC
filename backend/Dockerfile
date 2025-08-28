# Multi-stage Dockerfile for InnovateHubCEC backend
# Stage 1: deps (install only once unless package-lock.json changes)
FROM node:18-alpine AS deps
WORKDIR /app
# Install OS deps only if you later need the Python job scraper
# RUN apk add --no-cache python3
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: runner
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy app source (keep this after deps to maximize cache hits)
COPY . .

# Ensure the process runs as non-root
USER node

# Render/containers will pass PORT; server reads process.env.PORT
EXPOSE 8000

# Start server
CMD ["node", "src/server.js"]
