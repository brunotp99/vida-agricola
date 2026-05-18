# OrderService

**File**: `lib/services/order.service.ts`

## Order Lifecycle

```
pending → confirmed → processing → shipped → delivered
                              ↘
                           cancelled
   (any non-delivered/cancelled state can be refunded)
```

| Status | Meaning | Triggered by |
|--------|---------|-------------|
| `pending` | Payment initiated, not yet confirmed | `createPaymentIntentAction` |
| `confirmed` | Stripe `payment_intent.succeeded` webhook received | Stripe webhook |
| `processing` | Admin has started fulfillment | Admin order status update |
| `shipped` | Tracking number assigned | Admin order status update |
| `delivered` | Delivery confirmed | Admin order status update or customer confirmation |
| `cancelled` | Order cancelled before shipping | Customer or admin |
| `refunded` | Stripe refund issued | Admin refund action |

## Interface

```typescript
export const OrderService = {
  createOrder,       // called from Stripe webhook handler
  findByUser,        // paginated order list for account page
  findById,          // single order detail (checks userId ownership)
  findAll,           // admin: all orders with filters
  updateStatus,      // admin: change order status
  cancelOrder,       // customer: cancel pending/confirmed orders
  generateOrderNumber, // generates "VA-YYYYMMDD-XXXXX"
}
```

## `createOrder` Parameters

```typescript
type CreateOrderInput = {
  userId: string
  cartId: string
  paymentIntentId: string
  shippingAddress: {
    name: string; line1: string; line2?: string
    city: string; state?: string; postalCode: string; country: string
  }
  shippingAmount: number
  discountAmount: number
  couponId?: string
}
```

The function:
1. Loads cart items with prices
2. Calculates subtotal, tax (8%), total
3. Creates `Order` with `status: confirmed`
4. Creates `OrderItem` rows (snapshots product name, sku, price at purchase time)
5. Clears the cart
6. Decrements stock via `InventoryService.reserveStock` (if not already done)
7. Records `InventoryLog` entries with `reason: "sale"`
8. Returns the created order

## `cancelOrder` Rules

```typescript
async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order || order.userId !== userId) throw new Error("Not found")
  
  const cancellable: OrderStatus[] = ["pending", "confirmed"]
  if (!cancellable.includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage")
  }
  // ... update status, restore stock
}
```

## Order Number Format

`VA-YYYYMMDD-XXXXX` where XXXXX is a zero-padded auto-increment per day:
- `VA-20240115-00001`
- `VA-20240115-00002`

Generate using a database sequence or a daily counter in the `Order` table.

## `findByUser` Return Shape

```typescript
type OrderSummary = {
  id: string
  orderNumber: string
  status: OrderStatus
  total: Decimal
  itemCount: number
  createdAt: Date
  items: Array<{ name: string; imageUrl: string | null; quantity: number }>
}
```

Paginated: `{ orders: OrderSummary[], total: number, pages: number }`
