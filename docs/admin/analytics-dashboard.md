# Analytics Dashboard

**Route**: `/admin/analytics`

## Charts

All charts use **Recharts** (already installed in the project) wrapped with shadcn's `Chart` component.

### Revenue Over Time

- **Type**: Line chart or area chart
- **X-axis**: Day/week/month (toggled by period selector)
- **Y-axis**: Revenue in EUR
- **Data source**:
  ```sql
  SELECT DATE_TRUNC('day', "createdAt") AS day, SUM(total)::float AS total
  FROM "Order"
  WHERE status IN ('confirmed', 'processing', 'shipped', 'delivered')
    AND "createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY day ORDER BY day
  ```

### Top-Selling Products

- **Type**: Table with bar indicators
- **Columns**: Product name, Units sold, Revenue
- **Data source**:
  ```sql
  SELECT oi.name, SUM(oi.quantity) AS units, SUM(oi.price * oi.quantity) AS revenue
  FROM "OrderItem" oi
  JOIN "Order" o ON o.id = oi."orderId"
  WHERE o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
    AND o."createdAt" >= NOW() - INTERVAL '30 days'
  GROUP BY oi.name ORDER BY units DESC LIMIT 10
  ```

### Category Sales Breakdown

- **Type**: Pie chart or donut chart
- **Data source**: Join `OrderItem` → `Product` → `Category`, group by category name

### Conversion Funnel

- **Type**: Funnel/bar chart
- **Stages**: Product Views → Add to Cart → Checkout Started → Orders Placed
- **Data source**: `AnalyticsEvent` table grouped by `type`

## Period Selector

A button group (7 days / 30 days / 90 days) stored as a URL search param (`?period=30`). The page is a Server Component that passes the period to raw SQL queries.

## Key Metrics (Stats Cards)

| Metric | Formula |
|--------|---------|
| Total Revenue | SUM(total) WHERE status in active states |
| Average Order Value | total revenue / order count |
| Conversion Rate | orders / product_view events |
| Return Rate | refunded orders / total orders |

## Caching

Analytics data does not need real-time accuracy. Cache the dashboard queries with `unstable_cache` with a 15-minute TTL:

```typescript
const getDashboardStats = unstable_cache(
  async (period: number) => { /* queries */ },
  ["admin-analytics"],
  { revalidate: 900 }
)
```
