# STAGE 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

ARG APP
RUN npm run build ${APP}

# STAGE 2: Production
FROM node:24-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ARG APP

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist/apps/${APP} ./dist
COPY --from=builder /app/grpc/protos ./grpc/protos

CMD ["node", "dist/main"]
