# Stage 1: install production dependencies only
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: production image
FROM node:20-alpine AS production

# ffmpeg required for video duration probing and thumbnail generation
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

ENV NODE_ENV=production

EXPOSE 5050

CMD ["node", "--dns-result-order=ipv4first", "src/index.js"]
