FROM node:20-alpine AS base
RUN npm install -g pnpm
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app
COPY . .
RUN apk add --update python3 make g++ git && rm -rf /var/cache/apk/*
RUN pnpm install
RUN pnpm run build

#Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000

CMD ["pnpm", "start"]
