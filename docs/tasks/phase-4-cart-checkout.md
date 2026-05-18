# Phase 4 — Cart, Checkout & Payments (Tasks 41–50)

**Goal**: A fully working checkout flow backed by Stripe — Payment Intent creation, Stripe Elements UI, webhook-based order creation, and confirmation email.

**Prerequisite**: Phase 3 Tasks 31, 35, 38, 39 complete (CartService, OrderService, InventoryService, EmailService).

---

## Task 41 — Install Stripe SDK and configure environment

**What to do**:
- Install: `pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js`
- Create `lib/stripe.ts`:
  ```typescript
  import Stripe from "stripe"
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" })
  ```
- Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` to `.env.example`
- Add Stripe keys to `lib/env.ts` validation (optional for development, required in production)

**Files**: `lib/stripe.ts`, `.env.example`, `lib/env.ts`

**Acceptance**: `stripe.paymentIntents.list({ limit: 1 })` returns without error in a test script run with `tsx lib/stripe.ts`

---

## Task 42 — Create the Payment Intent server action

**What to do**: Create `lib/actions/checkout.ts#createPaymentIntentAction(input)`:

1. Validate input with `CreatePaymentIntentSchema` (cartId, shippingMethod, shippingAddress, couponCode?)
2. Load cart via `CartService.getCartWithItems(cartId)` — throw if empty
3. Validate coupon if provided — return discount amount
4. Calculate totals (subtotal, discount, shipping, tax, total) via `ShippingService.calculateTotals`
5. Create Stripe PaymentIntent:
   ```typescript
   stripe.paymentIntents.create({
     amount: Math.round(totals.total * 100),
     currency: "eur",
     metadata: { cartId, userId: session?.user.id ?? "guest", couponId, shippingMethod },
   })
   ```
6. Return `{ clientSecret: pi.client_secret, totals }`

See [services/checkout-service.md](../services/checkout-service.md) for the full flow.

**Files**: `lib/actions/checkout.ts`

**Acceptance**: The action returns a `clientSecret`; the PaymentIntent is visible in the Stripe dashboard with the correct amount in EUR

---

## Task 43 — Rebuild the Checkout page with Stripe Elements

**What to do**: Replace the non-submitting `app/checkout/page.tsx` with a real multi-step checkout:

**Step 1 — Shipping Address**:
- Create `components/checkout/address-form.tsx` — React Hook Form + `AddressSchema`
- Allow selecting a saved address (if authenticated) or entering a new one
- Clicking "Continue" saves the address to state

**Step 2 — Shipping Method**:
- Show standard (free over €99, else €9.99) and express (€19.99) options
- Show running order total

**Step 3 — Payment**:
- Call `createPaymentIntentAction` to get `clientSecret`
- Mount Stripe Elements with `loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)`
- Render `<PaymentElement>` from `@stripe/react-stripe-js`
- "Place Order" button calls `stripe.confirmPayment` with redirect to `/order-confirmation`

Create:
- `components/checkout/address-form.tsx`
- `components/checkout/payment-form.tsx`
- `components/checkout/order-summary.tsx`
- `components/checkout/stripe-elements.tsx`

**Files**: `app/checkout/page.tsx`, `components/checkout/*`

**Acceptance**: Test card `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits) completes successfully; the PaymentIntent in Stripe dashboard shows as "succeeded"

---

## Task 44 — Implement the Stripe webhook handler

**What to do**: Create `app/api/webhooks/stripe/route.ts`:

1. Read raw body and `stripe-signature` header
2. Verify signature: `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`
3. Handle `payment_intent.succeeded`:
   - Check idempotency: skip if `Order` with this `paymentIntentId` already exists
   - Call `OrderService.createOrder(...)` using metadata from the PaymentIntent
   - Call `CartService.clearCart(cartId)`
   - Call `EmailService.sendOrderConfirmation(order)`
   - Call `InventoryService.logMovement` for each order item
4. Handle `payment_intent.payment_failed`:
   - Call `InventoryService.releaseStock` for each cart item

**Files**: `app/api/webhooks/stripe/route.ts`

**Acceptance**: Running `stripe trigger payment_intent.succeeded` creates an Order row in the database; the idempotency check prevents a duplicate order if the event fires twice

---

## Task 45 — Build the Order Confirmation page

**What to do**:
- Create `app/order-confirmation/page.tsx` — reads `?orderId=` from URL search params
- Load order via `OrderService.findById(orderId, userId)` — return 404 if not found or belongs to different user
- Display: order number, items, shipping address, totals, status badge
- Show "Continue Shopping" button and "View All Orders" link

**Files**: `app/order-confirmation/page.tsx`

**Acceptance**: After a successful Stripe payment, the redirect lands on this page with the correct order data; visiting with an invalid order ID shows a 404

---

## Task 46 — Implement coupon validation

**What to do**:
- Add `applyCouponAction(code: string, subtotal: number)` to `lib/actions/cart.ts`
- Lookup `Coupon` by code (case-insensitive)
- Validate: `active === true`, not expired, `usedCount < maxUses`, `subtotal >= minOrderAmount`
- Return `{ discountAmount, couponId, error? }`
- Wire to the coupon input field in `app/cart/page.tsx`
- The hardcoded "WELCOME15" now works via the real `Coupon` table (seeded in Task 12)

**Files**: `lib/actions/cart.ts`, `app/cart/page.tsx`

**Acceptance**: `WELCOME15` applies a 15% discount; an expired or invalid code returns an error message inline; an out-of-stock coupon returns "Coupon usage limit reached"

---

## Task 47 — Build address management server actions

**What to do**: Add to `lib/actions/users.ts`:
- `addAddressAction(input: AddressInput)` — creates `Address` linked to session user
- `updateAddressAction(id, input)` — updates fields, verifies ownership
- `deleteAddressAction(id)` — verifies ownership, prevents deleting the default if it's the only one
- `setDefaultAddressAction(id)` — sets `isDefault: true` on this address, `false` on all others for this user

Wire to the Addresses tab in `app/account/page.tsx` (currently a static form).

**Files**: `lib/actions/users.ts`, `app/account/page.tsx`

**Acceptance**: Adding an address from the account page creates an `Address` row; setting a new default updates `isDefault` correctly

---

## Task 48 — Create ShippingService

**What to do**: Create `lib/services/shipping.service.ts#calculateShipping(subtotal, method)`:

```typescript
function calculateShipping(subtotal: number, method: "standard" | "express"): number {
  if (method === "express") return 19.99
  return subtotal >= 99 ? 0 : 9.99
}
```

Add a `calculateTotals(cart, shippingMethod, coupon)` function that returns `{ subtotal, discount, shippingAmount, taxAmount, total }`.

Note: Portuguese VAT for general goods is 23%. Agricultural products may qualify for the reduced 6% rate — use 23% as a safe default and flag this for legal review.

**Files**: `lib/services/shipping.service.ts`

**Acceptance**: `calculateTotals` with a €150 cart, standard shipping, and no coupon returns 0 shipping, 23% tax on total

---

## Task 49 — Add cart merge on login

**What to do**:
- Add an `onAfterSignIn` callback in `lib/auth.ts` (if Better Auth supports it) or call `CartService.mergeGuestCart` from the login Server Action after successful auth
- Read the `guest-session-id` cookie in the merge function
- Clear the guest cart after merging

**Files**: `lib/auth.ts`, `lib/services/cart.service.ts`

**Acceptance**: Adding items to the cart as a guest, then logging in, results in those items appearing in the authenticated cart; the guest cart row is deleted

---

## Task 50 — Write integration tests for checkout flow

**What to do**: Create `tests/integration/checkout.test.ts`:

Test cases:
1. `createPaymentIntentAction` with an empty cart → returns `{ success: false, error: "Cart is empty" }`
2. `createPaymentIntentAction` with insufficient stock → returns `{ success: false, error: "Insufficient stock" }`
3. `createPaymentIntentAction` with a valid cart → returns `{ success: true, data: { clientSecret: "..." } }` and the PaymentIntent exists in Stripe test mode
4. Webhook handler `payment_intent.succeeded` → creates `Order` row and clears cart
5. Webhook handler called twice with same event → second call is a no-op (idempotency)

**Files**: `tests/integration/checkout.test.ts`

**Acceptance**: All 5 test cases pass; the test does not leave orphaned PaymentIntents in Stripe (cancel them in `afterEach`)
