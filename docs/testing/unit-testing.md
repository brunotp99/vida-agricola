# Unit Testing

## Setup

```bash
pnpm add -D vitest @vitejs/plugin-react @vitest/coverage-v8
```

`vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      include: ["lib/services/**", "lib/validations/**"],
      thresholds: { statements: 80 },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
})
```

`package.json` scripts:
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Mocking Prisma

```typescript
// tests/mocks/prisma.ts
import { vi } from "vitest"
import { PrismaClient } from "@prisma/client"

const prismaMock = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  // ... other models
}

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }))

export { prismaMock }
```

## Example: Validating Zod Schemas

```typescript
// tests/unit/validations/cart.schema.test.ts
import { describe, it, expect } from "vitest"
import { AddToCartSchema } from "@/lib/validations/cart.schema"

describe("AddToCartSchema", () => {
  it("accepts valid input", () => {
    const result = AddToCartSchema.safeParse({
      productId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      quantity: 2,
    })
    expect(result.success).toBe(true)
  })

  it("rejects quantity of 0", () => {
    const result = AddToCartSchema.safeParse({
      productId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })

  it("rejects quantity above 99", () => {
    const result = AddToCartSchema.safeParse({
      productId: "clxxxxxxxxxxxxxxxxxxxxxxxx",
      quantity: 100,
    })
    expect(result.success).toBe(false)
  })
})
```

## Example: Service with Mocked Prisma

```typescript
// tests/unit/services/cart.service.test.ts
import { describe, it, expect, beforeEach } from "vitest"
import { prismaMock } from "../../mocks/prisma"
import { CartService } from "@/lib/services/cart.service"

describe("CartService.addItem", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("throws when stock is insufficient", async () => {
    prismaMock.productVariant.findUnique.mockResolvedValue({ stockCount: 1 })

    await expect(
      CartService.addItem("cart-id", { productId: "p1", variantId: "v1", quantity: 5 })
    ).rejects.toThrow("Insufficient stock")
  })
})
```

## Running Tests

```bash
pnpm test             # run all unit tests once
pnpm test:watch       # watch mode
pnpm test:coverage    # run with coverage report
```
