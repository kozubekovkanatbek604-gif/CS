FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]
