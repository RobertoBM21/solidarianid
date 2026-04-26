# STAGE 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

RUN npm install

COPY . .

RUN npm run proto:gen
RUN npm run build:all

# STAGE 2: Production
FROM node:24-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/grpc/protos ./grpc/protos

ARG APP
COPY --from=builder /app/dist/apps/${APP} ./dist

CMD ["node", "dist/main"]
