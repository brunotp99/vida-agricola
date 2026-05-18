# Database Schema Reference

Quick-reference for every table. For the full Prisma schema, see [architecture/database-schema.md](../architecture/database-schema.md).

---

## Users & Auth

### `User`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| email | String | unique |
| name | String? | nullable |
| image | String? | avatar URL |
| role | Enum(admin, staff, customer) | default: customer |
| emailVerified | Boolean | default: false |
| banned | Boolean | default: false |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

**Indexes**: `email`

### `Session`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| userId | String | FK → User |
| token | String | unique |
| expiresAt | DateTime | |
| ipAddress | String? | |
| userAgent | String? | |

**Indexes**: `userId`, `token`

### `Account`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| userId | String | FK → User |
| provider | String | "google" \| "github" |
| providerAccountId | String | |

**Unique**: `(provider, providerAccountId)`

### `VerificationToken`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| email | String | |
| token | String | unique |
| type | String | "email-verification" \| "password-reset" |
| expiresAt | DateTime | |

---

## Catalog

### `Category`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| name | String | |
| slug | String | unique |
| description | String? | |
| imageUrl | String? | |
| icon | String? | lucide icon name |
| featured | Boolean | default: false |
| sortOrder | Int | default: 0 |
| parentId | String? | FK → Category (self-relation) |

**Indexes**: `slug`, `parentId`

### `Brand`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| name | String | |
| slug | String | unique |
| logoUrl | String? | |
| description | String? | |
| featured | Boolean | default: false |

### `Product`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| name | String | |
| slug | String | unique |
| description | String? | |
| sku | String | unique |
| price | Decimal(10,2) | |
| compareAtPrice | Decimal(10,2)? | null = no discount shown |
| categoryId | String? | FK → Category |
| brandId | String? | FK → Brand |
| status | Enum(draft, active, archived) | default: draft |
| featured | Boolean | default: false |
| newArrival | Boolean | default: false |
| bestSeller | Boolean | default: false |
| flashDeal | Boolean | default: false |
| weight | Decimal(8,3)? | kg |
| searchVector | tsvector? | generated STORED column |

**Indexes**: `slug`, `(categoryId, status)`, `brandId`, `(status, featured)`, `(status, bestSeller)`, `(status, newArrival)`, `(status, flashDeal)`, GIN on `searchVector`

### `ProductVariant`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| productId | String | FK → Product |
| name | String | e.g. "25kg bag" |
| sku | String | unique |
| price | Decimal(10,2)? | overrides product price if set |
| stockCount | Int | default: 0 |
| attributes | Json | e.g. `{"weight": "25kg", "flavor": "chicken"}` |

---

## Shopping

### `Cart`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| userId | String? | unique, FK → User |
| sessionId | String? | unique, for guest carts |

One cart per user (unique userId). Guest carts identified by sessionId cookie.

### `CartItem`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| cartId | String | FK → Cart |
| productId | String | FK → Product |
| variantId | String? | FK → ProductVariant |
| quantity | Int | default: 1 |

**Unique**: `(cartId, productId, variantId)` — prevents duplicate line items

### `WishlistItem`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| userId | String | FK → User |
| productId | String | FK → Product |

**Unique**: `(userId, productId)`

### `Coupon`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| code | String | unique, case-insensitive in queries |
| type | Enum(percentage, fixed) | |
| value | Decimal(10,2) | % for percentage, absolute for fixed |
| minOrderAmount | Decimal(10,2)? | null = no minimum |
| maxUses | Int? | null = unlimited |
| usedCount | Int | default: 0 |
| expiresAt | DateTime? | null = never expires |
| active | Boolean | default: true |

---

## Orders

### `Order`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| orderNumber | String | unique, human-readable (e.g. "VA-20240001") |
| userId | String | FK → User |
| status | Enum(pending, confirmed, processing, shipped, delivered, cancelled, refunded) | |
| subtotal | Decimal(10,2) | |
| shippingAmount | Decimal(10,2) | |
| taxAmount | Decimal(10,2) | |
| discountAmount | Decimal(10,2) | default: 0 |
| total | Decimal(10,2) | |
| paymentIntentId | String? | unique, Stripe PI id |
| shippingAddress | Json | snapshot of address at time of order |
| notes | String? | |

**Indexes**: `(userId, status)`, `orderNumber`, `paymentIntentId`, `createdAt`

### `Address`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| userId | String | FK → User |
| name | String | recipient name |
| line1 | String | |
| line2 | String? | |
| city | String | |
| state | String? | |
| postalCode | String | |
| country | String | default: "PT" |
| isDefault | Boolean | default: false |

---

## Analytics

### `InventoryLog`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| productId | String | FK → Product |
| variantId | String? | FK → ProductVariant |
| delta | Int | positive = added, negative = removed |
| reason | String | "sale" \| "restock" \| "adjustment" \| "return" |
| orderId | String? | FK → Order (nullable) |

### `AnalyticsEvent`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| type | String | "product_view" \| "add_to_cart" \| "checkout_start" \| "purchase" |
| userId | String? | null for anonymous |
| sessionId | String? | |
| productId | String? | |
| metadata | Json | extra context |
