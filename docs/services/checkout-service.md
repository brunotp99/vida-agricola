# CheckoutService & Stripe Integration

**Files**: `lib/services/checkout.service.ts`, `lib/stripe.ts`, `app/api/webhooks/stripe/route.ts`

## `lib/stripe.ts`

```typescript
import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})
```

## CheckoutService Interface

```typescript
export const CheckoutService = {
  createPaymentIntent,   // calculates totals, reserves stock, creates Stripe PI
  confirmCheckout,       // called from webhook: creates order, clears cart, sends email
  calculateTotals,       // subtotal + tax + shipping - discount
}
```

## `createPaymentIntent` Flow

```typescript
async function createPaymentIntent(input: {
  cartId: string
  userId: string | null
  shippingMethod: "standard" | "express"
  couponCode?: string
  shippingAddress: AddressInput
}) {
  // 1. Load cart and validate it's non-empty
  const cart = await CartService.getCartWithItems(input.cartId)
  if (cart.items.length === 0) throw new Error("Cart is empty")

  // 2. Validate coupon if provided
  const coupon = input.couponCode
    ? await validateCoupon(input.couponCode, cart.subtotal)
    : null

  // 3. Calculate totals
  const totals = calculateTotals(cart, input.shippingMethod, coupon)

  // 4. Create Stripe PaymentIntent
  const pi = await stripe.paymentIntents.create({
    amount: Math.round(totals.total * 100), // cents
    currency: "eur",
    metadata: {
      cartId: input.cartId,
      userId: input.userId ?? "guest",
      couponId: coupon?.id ?? "",
      shippingMethod: input.shippingMethod,
    },
  })

  return { clientSecret: pi.client_secret, totals }
}
```

## Webhook Handler (`app/api/webhooks/stripe/route.ts`)

```typescript
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent
    await CheckoutService.confirmCheckout(pi)
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent
    await InventoryService.releaseReservedStock(pi.metadata.cartId)
  }

  return new Response(null, { status: 200 })
}
```

## Idempotency

The webhook handler checks if an `Order` with `paymentIntentId = pi.id` already exists before creating a new one. Stripe may send the same event more than once:

```typescript
const existing = await prisma.order.findUnique({
  where: { paymentIntentId: pi.id },
})
if (existing) return // already processed
```

## Total Calculation

```typescript
function calculateTotals(cart, shippingMethod, coupon) {
  const subtotal = cart.subtotal
  const discount = coupon
    ? coupon.type === "percentage"
      ? subtotal * (coupon.value / 100)
      : coupon.value
    : 0
  const discountedSubtotal = subtotal - discount
  const shippingAmount = shippingMethod === "express" ? 19.99
    : discountedSubtotal >= 99 ? 0 : 9.99
  const taxAmount = (discountedSubtotal + shippingAmount) * 0.23 // Portuguese VAT
  const total = discountedSubtotal + shippingAmount + taxAmount

  return { subtotal, discount, shippingAmount, taxAmount, total }
}
```

Note: Portuguese VAT (IVA) is 23% for general goods. Verify rates for agricultural products, which may qualify for a reduced 6% rate.

## Testing with Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```
