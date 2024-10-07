# Utilisez une image Node.js officielle comme base
FROM node:20

ENV http_proxy=http://192.168.42.15:3128/
ENV https_proxy=http://192.168.42.15:3128/
ENV HTTP_PROXY=http://192.168.42.15:3128/
ENV HTTPS_PROXY=http://192.168.42.15:3128/

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le package.json et le package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application NestJS
RUN npm run build

# Commande pour démarrer l'application NestJS
CMD ["npm", "run", "start:prod"]
