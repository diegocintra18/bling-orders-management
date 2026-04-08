FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY packages/*/package.json ./packages/
COPY apps/*/package.json ./apps/

RUN npm install --legacy-peer-deps

COPY . .

RUN node apps/api/scripts/build.js

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
