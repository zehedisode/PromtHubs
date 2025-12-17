# PromtHubs Docker Image
FROM node:20-alpine

# Install dependencies for Sharp
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY config/ ./config/
COPY src/ ./src/
COPY public/ ./public/
COPY telegram-bot/ ./telegram-bot/

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start server
CMD ["node", "src/server/index.js"]
