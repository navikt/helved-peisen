FROM cgr.dev/chainguard/node:latest
WORKDIR /app

COPY --chown=nextjs:nodejs node_modules ./node_modules
COPY --chown=nextjs:nodejs next.config.mjs ./
COPY --chown=nextjs:nodejs public ./public/
COPY --chown=nextjs:nodejs .next ./.next

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./node_modules/next/dist/bin/next", "start"]