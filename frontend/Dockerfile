FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci --only=production && \
    npm cache clean --force

# Copia codice sorgente
COPY . .

# Esponi porta
EXPOSE 3000

# Start app
CMD ["npm", "start"]