# ============================================
# Stage 1: Build
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy built node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads/profil /app/uploads/smart/pdfs && \
    chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["node", "src/index.js"]
