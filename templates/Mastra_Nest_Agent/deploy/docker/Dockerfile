FROM cr.registry.res.cloud.zhejianglab.com/dde/node:22.23.5-bookworm AS node-base

RUN npm config set registry https://registry.npmmirror.com \
    && node --version 

# 构建阶段
FROM node-base AS builder

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN SKIP_MASTRA_SKILLS=1 npm install

COPY . .
RUN npm run build

# 运行阶段也继承升级后的 node-base
FROM node-base AS runner

WORKDIR /app

COPY package*.json ./
COPY scripts ./scripts
RUN npm install --omit=dev --ignore-scripts \
    && npm cache clean --force

COPY --from=builder /app/build ./build
COPY .env* ./

EXPOSE 80

CMD ["node", "build/main.js"]
