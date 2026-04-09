FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/*/package*.json ./packages/
COPY apps/web/package*.json ./apps/web/

RUN npm install --legacy-peer-deps --omit=dev

COPY packages/core/dist ./node_modules/@bling-orders/core

COPY apps/web ./

RUN npm run build --workspace=apps/web

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=apps/web"]
