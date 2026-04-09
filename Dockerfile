FROM node:20-alpine

WORKDIR /app

COPY apps/api/package*.json ./

RUN npm install --legacy-peer-deps --omit=dev

COPY apps/api/dist ./dist
COPY packages/infra/dist ./node_modules/@bling-orders/infra
COPY packages/core/dist ./node_modules/@bling-orders/core

EXPOSE 3001

CMD ["node", "dist/main"]
