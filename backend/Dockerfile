FROM node:18-alpine

# Installa dipendenze per compilazione native modules
RUN apk add --no-cache python3 make g++

# Crea directory app
WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production && \
    npm cache clean --force

# Copia codice sorgente
COPY . .

# Crea directory uploads
RUN mkdir -p uploads && \
    chmod 755 uploads

# Esponi porta
EXPOSE 5000

# User non-root per sicurezza
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Start application
CMD ["npm", "start"]