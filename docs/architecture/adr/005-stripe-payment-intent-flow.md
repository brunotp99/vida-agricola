# ADR 005: Use Stripe Payment Intents with Webhooks

**Status**: Accepted

## Context

We need a payment processing architecture. Options: Stripe Checkout (hosted), Stripe Payment Intents (embedded), PayPal, or a local payment gateway.

## Decision

Use **Stripe Payment Intents** with the **Stripe Elements** embedded UI and webhook-based order creation.

## Rationale

- **Payment Intents + webhooks** is the Stripe-recommended pattern for reliable order creation — the order is only created after the webhook confirms payment, not on the client redirect (which can fail)
- **Stripe Elements** renders the card UI inside our own checkout page, keeping the user on our domain (better conversion than redirect to hosted Checkout)
- The webhook handler is idempotent via Stripe's event ID — safe to process twice if the webhook fires more than once
- Stripe's fraud detection (Radar) is included at no extra cost

## Flow

```
1. Client: createPaymentIntentAction(cartId)
   └── Reserve stock
   └── Calculate totals
   └── Stripe.paymentIntents.create({ amount, metadata: { cartId, userId } })
   └── Return clientSecret

2. Client: Stripe Elements mounts with clientSecret
   └── User enters card and submits
   └── Stripe handles 3DS if needed

3. Stripe: fires payment_intent.succeeded webhook to /api/webhooks/stripe
   └── Verify webhook signature (STRIPE_WEBHOOK_SECRET)
   └── Check event type
   └── OrderService.createOrder
   └── CartService.clearCart
   └── EmailService.sendOrderConfirmation
   └── InventoryService.logMovement

4. Client: Stripe redirects to /order-confirmation?orderId=xxx
```

## Trade-offs

- Stripe Checkout (hosted) is simpler to implement and handles more edge cases (Google Pay, Apple Pay, local payment methods) automatically — but redirects the user off-site
- If we later need Apple Pay / Google Pay, Stripe Payment Request Button can be added to the existing embedded flow
