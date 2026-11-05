FROM cr.registry.res.cloud.zhejianglab.com/dde/node:n_for_build_v3 AS node-base

ARG NODE_VERSION=22.22.0

ENV N_NODE_MIRROR=https://npmmirror.com/mirrors/node

RUN npm config set registry https://registry.npmmirror.com \
    && npm install -g n \
    && n ${NODE_VERSION} \
    && hash -r \
    && node --version \
    && test "$(node --version)" = "v${NODE_VERSION}"

FROM node-base AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node-base AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --from=builder /app/build ./build
COPY .env* ./

EXPOSE 80

CMD ["node", "build/main.js"]
