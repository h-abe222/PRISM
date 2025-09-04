# ============================================
# マルチステージビルド: ベースイメージ
# ============================================
FROM node:18-alpine AS base
WORKDIR /app

# 必要なパッケージをインストール
RUN apk add --no-cache libc6-compat

# ============================================
# 依存関係のインストール
# ============================================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ============================================
# 開発用依存関係のインストール
# ============================================
FROM base AS dev-deps
COPY package.json package-lock.json ./
RUN npm ci

# ============================================
# ビルドステージ
# ============================================
FROM base AS builder
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# 環境変数の設定
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# Prismaクライアントの生成
RUN npx prisma generate

# Next.jsアプリケーションのビルド
RUN npm run build

# ============================================
# 本番用イメージ
# ============================================
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# セキュリティ: 非rootユーザーの作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 必要なファイルのコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prismaクライアントのコピー
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# パーミッションの設定
RUN chown -R nextjs:nodejs /app

# ユーザーを切り替え
USER nextjs

# ポートの公開
EXPOSE 3000

# ヘルスチェックの設定
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# アプリケーションの起動
CMD ["node", "server.js"]