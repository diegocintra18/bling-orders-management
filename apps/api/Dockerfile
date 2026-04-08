FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps 2>&1 || npm install --legacy-peer-deps 2>&1

COPY . .

RUN node apps/api/scripts/build.js

EXPOSE 3001

CMD ["node", "dist/main"]
