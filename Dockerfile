FROM node:20 AS builder

WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN BUILD_NODE=1 pnpm build
RUN pnpm pkg delete scripts.prepare
RUN pnpm prune --prod

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

ENTRYPOINT [ "node", "build" ]
