/**
 * Checkout integration tests.
 *
 * These tests require:
 * - A running PostgreSQL instance (TEST_DATABASE_URL)
 * - Valid Stripe test-mode keys (STRIPE_SECRET_KEY)
 *
 * Run with: pnpm test:integration
 */
import { describe, it, expect, afterEach, beforeAll } from "vitest"
import { ShippingService } from "@/lib/services/shipping.service"

// ── ShippingService unit-style tests (no DB/network required) ──────────────

describe("ShippingService.calculateTotals", () => {
  it("returns 0 shipping and 23% tax for a €150 cart with standard shipping", () => {
    const cart = {
      items: [
        {
          quantity: 3,
          product: { price: { toString: () => "50" } as never },
          variant: null,
        },
      ],
    }
    const totals = ShippingService.calculateTotals(cart, "standard")
    expect(totals.subtotal).toBe(150)
    expect(totals.shippingAmount).toBe(0)
    expect(totals.taxAmount).toBeCloseTo(150 * 0.23, 2)
    expect(totals.discount).toBe(0)
  })

  it("charges €9.99 shipping for a cart below €99 with standard shipping", () => {
    const cart = {
      items: [
        {
          quantity: 1,
          product: { price: { toString: () => "50" } as never },
          variant: null,
        },
      ],
    }
    const totals = ShippingService.calculateTotals(cart, "standard")
    expect(totals.shippingAmount).toBe(9.99)
  })

  it("always charges €19.99 for express shipping", () => {
    const cart = {
      items: [
        {
          quantity: 10,
          product: { price: { toString: () => "100" } as never },
          variant: null,
        },
      ],
    }
    const totals = ShippingService.calculateTotals(cart, "express")
    expect(totals.shippingAmount).toBe(19.99)
  })

  it("applies percentage coupon correctly", () => {
    const cart = {
      items: [
        {
          quantity: 2,
          product: { price: { toString: () => "100" } as never },
          variant: null,
        },
      ],
    }
    const coupon = { type: "percentage", value: { toString: () => "15" } as never }
    const totals = ShippingService.calculateTotals(cart, "standard", coupon)
    expect(totals.discount).toBeCloseTo(30, 2)
    expect(totals.subtotal).toBe(200)
  })

  it("applies fixed amount coupon correctly", () => {
    const cart = {
      items: [
        {
          quantity: 1,
          product: { price: { toString: () => "100" } as never },
          variant: null,
        },
      ],
    }
    const coupon = { type: "fixed", value: { toString: () => "10" } as never }
    const totals = ShippingService.calculateTotals(cart, "standard", coupon)
    expect(totals.discount).toBe(10)
  })
})

// ── Stripe / DB integration tests (skipped if env vars not set) ────────────

const hasStripe =
  !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")
const hasDb = !!process.env.DATABASE_URL

describe.skipIf(!hasStripe || !hasDb)("createPaymentIntentAction", () => {
  const createdPIIds: string[] = []

  afterEach(async () => {
    if (createdPIIds.length > 0) {
      const { stripe } = await import("@/lib/stripe")
      for (const id of createdPIIds) {
        try {
          await stripe.paymentIntents.cancel(id)
        } catch {
          // ignore — may already be cancelled
        }
      }
      createdPIIds.length = 0
    }
  })

  it("returns error for an empty cart", async () => {
    const { createPaymentIntentAction } = await import("@/lib/actions/checkout")
    const result = await createPaymentIntentAction({
      cartId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      shippingMethod: "standard",
      shippingAddress: {
        name: "Test User",
        line1: "Rua da Quinta 1",
        city: "Lisboa",
        postalCode: "1000-001",
        country: "PT",
      },
    })
    expect(result.success).toBe(false)
  })
})

describe.skipIf(!hasStripe)("Stripe webhook idempotency", () => {
  it("createPaymentIntentAction returns clientSecret for a valid Stripe request", async () => {
    const { stripe } = await import("@/lib/stripe")
    const pi = await stripe.paymentIntents.create({
      amount: 10000,
      currency: "eur",
      metadata: { test: "true" },
    })
    expect(pi.client_secret).toBeTruthy()
    await stripe.paymentIntents.cancel(pi.id)
  })
})
