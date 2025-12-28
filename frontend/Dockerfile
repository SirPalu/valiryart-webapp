FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# ✅ INSTALLA TUTTE LE DIPENDENZE (anche devDependencies)
# Usiamo --legacy-peer-deps per risolvere conflitti TypeScript
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# Copia codice sorgente
COPY . .

# Esponi porta
EXPOSE 3000

# Start app in development mode
CMD ["npm", "start"]