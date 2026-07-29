FROM node:20-slim AS builder

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/global-enterprise/package.json ./artifacts/global-enterprise/

RUN pnpm install --frozen-lockfile

COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/global-enterprise/ ./artifacts/global-enterprise/

ENV NODE_ENV=production
ENV BASE_PATH=/
ENV PORT=3000

RUN pnpm --filter @workspace/global-enterprise run build
RUN pnpm --filter @workspace/api-server run build

# ── Runner ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN npm install -g pnpm@10

WORKDIR /app

# Copy only the package manifests needed for prod deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/global-enterprise/package.json ./artifacts/global-enterprise/

# Install production dependencies only (multer, @aws-sdk, etc. are external)
RUN pnpm install --frozen-lockfile --prod

# Copy built assets
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/global-enterprise/dist/public ./artifacts/global-enterprise/dist/public

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
