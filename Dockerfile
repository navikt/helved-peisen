FROM cgr.dev/chainguard/node:latest
WORKDIR /app

# Build with pnpm build on Linux before building this runtime image.
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs public ./public/
COPY --chown=nextjs:nodejs .next/static ./.next/static

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["server.js"]
