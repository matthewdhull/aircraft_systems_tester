# syntax=docker/dockerfile:1
FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json svelte.config.js ./
RUN npm ci
COPY vite.config.ts tsconfig.json ./
COPY src ./src
COPY static ./static
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production \
    APP_ENV=production \
    DATABASE_PATH=/data/aircraft-systems-tester.sqlite \
    HOST=0.0.0.0 \
    PORT=3000 \
    SHUTDOWN_TIMEOUT=10
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --chown=node:node drizzle ./drizzle
RUN mkdir /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
STOPSIGNAL SIGTERM
CMD ["node", "build"]
