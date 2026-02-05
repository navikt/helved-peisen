FROM node:24-alpine3.23
WORKDIR /app
ENV PORT=3000 \
    NODE_ENV=production

RUN apk update && apk upgrade --no-cache

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs node_modules ./node_modules
COPY --chown=nextjs:nodejs next.config.mjs ./
COPY --chown=nextjs:nodejs public ./public/
COPY --chown=nextjs:nodejs .next ./.next

USER nextjs
EXPOSE 3000

CMD ["./node_modules/next/dist/bin/next", "start"]