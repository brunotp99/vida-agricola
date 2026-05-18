# Integration Testing

## Setup

Integration tests use a real PostgreSQL test database. They are slower than unit tests but more reliable.

### Test Database

Use the `postgres-test` container from `docker-compose.yml` (port 5433). Set in `.env.test`:
```
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/vida_agricola_test
```

### Vitest Config for Integration

Add a separate config file for integration tests:

```typescript
// vitest.integration.config.ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/setup.ts"],
    poolOptions: {
      threads: { singleThread: true }, // serialise to avoid DB conflicts
    },
  },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
})
```

### Setup File

```typescript
// tests/integration/setup.ts
import { prisma } from "@/lib/prisma"
import { execSync } from "child_process"

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
  execSync("pnpm prisma migrate deploy", { env: process.env })
  execSync("pnpm prisma db seed", { env: process.env })
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

`package.json`:
```json
{
  "test:integration": "vitest run --config vitest.integration.config.ts"
}
```

## Example: Cart Action Integration Test

```typescript
// tests/integration/actions/cart.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { prisma } from "@/lib/prisma"
import { CartService } from "@/lib/services/cart.service"

describe("CartService integration", () => {
  let testUserId: string

  beforeEach(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: { email: `test-${Date.now()}@test.com`, role: "customer" },
    })
    testUserId = user.id

    return async () => {
      // Cleanup after each test
      await prisma.cart.deleteMany({ where: { userId: testUserId } })
      await prisma.user.delete({ where: { id: testUserId } })
    }
  })

  it("creates a cart and adds an item", async () => {
    const product = await prisma.product.findFirst({ where: { status: "active" } })
    const variant = await prisma.productVariant.findFirst({ where: { productId: product!.id } })

    const cart = await CartService.getOrCreateCart({ userId: testUserId })
    await CartService.addItem(cart.id, {
      productId: product!.id,
      variantId: variant?.id ?? null,
      quantity: 1,
    })

    const updated = await CartService.getCartWithItems(cart.id)
    expect(updated.items).toHaveLength(1)
    expect(updated.items[0].quantity).toBe(1)
  })

  it("increments quantity when same item is added twice", async () => {
    const product = await prisma.product.findFirst({ where: { status: "active" } })
    const cart = await CartService.getOrCreateCart({ userId: testUserId })

    await CartService.addItem(cart.id, { productId: product!.id, variantId: null, quantity: 1 })
    await CartService.addItem(cart.id, { productId: product!.id, variantId: null, quantity: 2 })

    const updated = await CartService.getCartWithItems(cart.id)
    expect(updated.items[0].quantity).toBe(3)
  })
})
```

## Running Integration Tests

```bash
docker compose up -d postgres-test   # ensure test DB is running
pnpm test:integration
```
