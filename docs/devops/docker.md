# Docker

## `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: vida_agricola_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vida_agricola
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

## Usage

```bash
docker compose up -d      # Start in background
docker compose down       # Stop containers
docker compose down -v    # Stop and delete volume (wipes all data)
docker compose logs -f    # Tail logs
```

## `Dockerfile` (for production self-hosting)

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

Requires `output: "standalone"` in `next.config.mjs`:
```javascript
const nextConfig = {
  output: "standalone",
}
```

## Test Database (for CI / integration tests)

Add a `postgres-test` service to `docker-compose.yml`:

```yaml
  postgres-test:
    image: postgres:16-alpine
    container_name: vida_agricola_test_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vida_agricola_test
    ports:
      - "5433:5432"
```

Set `TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/vida_agricola_test` in `.env.test`.
