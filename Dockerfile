FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios
COPY package*.json ./

# Instala las dependencias
RUN npm install -g pm2 && npm install

# Copia el resto del código
COPY . .

# Expone el puerto
EXPOSE 3121

# Usa PM2 en modo foreground
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
