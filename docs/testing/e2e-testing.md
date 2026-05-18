# E2E Testing with Playwright

## Setup

```bash
pnpm add -D @playwright/test
pnpm playwright install chromium
```

`playwright.config.ts`:
```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
})
```

`package.json`:
```json
{
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui"
}
```

## Test 1: Purchase Flow

```typescript
// tests/e2e/purchase-flow.spec.ts
import { test, expect } from "@playwright/test"

test("guest adds item, registers, completes checkout", async ({ page }) => {
  // 1. Browse to a product
  await page.goto("/product/chicken-feed-25kg")
  await page.getByRole("button", { name: "Add to Cart" }).click()
  await expect(page.getByText("Added to cart")).toBeVisible()

  // 2. Go to cart
  await page.goto("/cart")
  await expect(page.getByText("Chicken Feed")).toBeVisible()

  // 3. Proceed to checkout → redirect to login
  await page.getByRole("link", { name: "Proceed to Checkout" }).click()
  await expect(page).toHaveURL(/login/)

  // 4. Register a new account
  await page.getByRole("link", { name: "Create account" }).click()
  await page.fill('[name="name"]', "Test User")
  await page.fill('[name="email"]', `test-${Date.now()}@example.com`)
  await page.fill('[name="password"]', "Test1234!")
  await page.getByRole("button", { name: "Create account" }).click()

  // 5. Cart should have merged — now on checkout
  await expect(page).toHaveURL("/checkout")
  await expect(page.getByText("Chicken Feed")).toBeVisible()

  // 6. Fill in shipping address
  await page.fill('[name="name"]', "Test User")
  await page.fill('[name="line1"]', "Rua das Flores 123")
  await page.fill('[name="city"]', "Lisboa")
  await page.fill('[name="postalCode"]', "1000-001")
  await page.getByRole("button", { name: "Continue to Payment" }).click()

  // 7. Fill in Stripe test card
  const stripeFrame = page.frameLocator('iframe[title="Secure card payment input frame"]')
  await stripeFrame.getByPlaceholder("Card number").fill("4242 4242 4242 4242")
  await stripeFrame.getByPlaceholder("MM / YY").fill("12 / 30")
  await stripeFrame.getByPlaceholder("CVC").fill("123")

  // 8. Place order
  await page.getByRole("button", { name: "Place Order" }).click()

  // 9. Confirm order confirmation page
  await expect(page).toHaveURL(/order-confirmation/)
  await expect(page.getByText("Order confirmed")).toBeVisible()
  await expect(page.getByText(/VA-/)).toBeVisible() // order number

  // 10. Verify order appears in account
  await page.goto("/account/orders")
  await expect(page.getByText(/VA-/)).toBeVisible()
})
```

## Test 2: Admin Creates Product

```typescript
// tests/e2e/admin-product.spec.ts
import { test, expect } from "@playwright/test"

test("admin creates a product and it appears on the storefront", async ({ page }) => {
  // 1. Log in as admin
  await page.goto("/login")
  await page.fill('[name="email"]', process.env.ADMIN_EMAIL!)
  await page.fill('[name="password"]', process.env.ADMIN_PASSWORD!)
  await page.getByRole("button", { name: "Sign In" }).click()
  await expect(page).toHaveURL("/account")

  // 2. Navigate to admin products
  await page.goto("/admin/products/new")

  // 3. Fill in product form
  const slug = `test-product-${Date.now()}`
  await page.fill('[name="name"]', "E2E Test Product")
  await page.fill('[name="sku"]', `TEST-${Date.now()}`)
  await page.fill('[name="price"]', "99.99")
  await page.fill('[name="description"]', "A test product for E2E testing")
  await page.selectOption('[name="status"]', "active")
  await page.getByRole("button", { name: "Create Product" }).click()

  // 4. Verify redirect to product list
  await expect(page).toHaveURL("/admin/products")
  await expect(page.getByText("E2E Test Product")).toBeVisible()

  // 5. Verify product appears on storefront
  await page.goto(`/product/${slug}`)
  await expect(page.getByRole("heading", { name: "E2E Test Product" })).toBeVisible()
  await expect(page.getByText("€99.99")).toBeVisible()
})
```

## Running E2E Tests

```bash
pnpm e2e          # headless
pnpm e2e:ui       # with Playwright UI
```

In CI, the tests run against a freshly seeded database on the test server.
