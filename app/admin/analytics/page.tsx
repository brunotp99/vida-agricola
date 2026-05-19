import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/admin/stats-card"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DollarSign, ShoppingCart, TrendingUp, RotateCcw } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

function getPeriodDays(period: string) {
  if (period === "7") return 7
  if (period === "90") return 90
  return 30
}

async function getAnalyticsData(days: number) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const [orders, orderCount, refundedOrders, topProducts, categoryRevenue, analyticsEvents] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { in: ["confirmed", "processing", "shipped", "delivered"] },
        },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate }, status: "refunded" },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: { in: ["confirmed", "processing", "shipped", "delivered"] },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { price: "desc" } },
        take: 10,
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { in: ["confirmed", "processing", "shipped", "delivered"] },
        },
        include: {
          items: { include: { product: { include: { category: true } } } },
        },
      }),
      prisma.analyticsEvent.groupBy({
        by: ["type"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
      }),
    ])

  // Revenue by day
  const byDay: Record<string, number> = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000)
    const key = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
    byDay[key] = 0
  }
  for (const order of orders) {
    const key = order.createdAt.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
    if (key in byDay) byDay[key] += Number(order.total)
  }

  const revenueChart = Object.entries(byDay).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }))

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0
  const conversionRate = 0 // Would need session data
  const refundRate = orderCount > 0 ? (refundedOrders / orderCount) * 100 : 0

  // Top products
  const productIds = topProducts.map((p) => p.productId)
  const productNames = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })
  const productNameMap = Object.fromEntries(productNames.map((p) => [p.id, p.name]))

  const topProductsData = topProducts.map((p) => ({
    name: productNameMap[p.productId] ?? "Unknown",
    unitsSold: p._sum.quantity ?? 0,
    revenue: Math.round(Number(p._sum.price) * 100) / 100,
  }))

  // Category breakdown
  const catRevenue: Record<string, number> = {}
  for (const order of categoryRevenue) {
    for (const item of order.items) {
      const catName = item.product.category?.name ?? "Uncategorized"
      catRevenue[catName] = (catRevenue[catName] ?? 0) + Number(item.price) * item.quantity
    }
  }
  const categoryData = Object.entries(catRevenue)
    .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  // Conversion funnel
  const eventCounts = Object.fromEntries(
    analyticsEvents.map((e) => [e.type, e._count.id]),
  )
  const funnelData = [
    { stage: "Product Views", count: eventCounts["product_view"] ?? 0 },
    { stage: "Add to Cart", count: eventCounts["add_to_cart"] ?? 0 },
    { stage: "Checkout Started", count: eventCounts["checkout_started"] ?? 0 },
    { stage: "Orders Placed", count: orderCount },
  ]

  return {
    totalRevenue,
    avgOrderValue,
    orderCount,
    conversionRate,
    refundRate,
    revenueChart,
    topProductsData,
    categoryData,
    funnelData,
  }
}

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const { period = "30" } = await searchParams
  const days = getPeriodDays(period)

  const cached = unstable_cache(
    () => getAnalyticsData(days),
    [`analytics-${days}`],
    { revalidate: 900, tags: ["analytics"] },
  )

  const data = await cached()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Data for the last {days} days
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 rounded-lg border bg-white p-1">
          {["7", "30", "90"].map((p) => (
            <Link key={p} href={`?period=${p}`}>
              <Button
                variant={period === p ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
              >
                {p}d
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`€${data.totalRevenue.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description={`Last ${days} days`}
          icon={DollarSign}
        />
        <StatsCard
          title="Average Order Value"
          value={`€${data.avgOrderValue.toFixed(2)}`}
          description="Per confirmed order"
          icon={TrendingUp}
        />
        <StatsCard
          title="Orders Placed"
          value={data.orderCount}
          description={`Last ${days} days (all statuses)`}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Refund Rate"
          value={`${data.refundRate.toFixed(1)}%`}
          description="Refunded vs total orders"
          icon={RotateCcw}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={data.revenueChart} title={`Daily Revenue — Last ${days} Days`} />

      {/* Charts: top products, category breakdown, funnel */}
      <AnalyticsCharts
        topProducts={data.topProductsData}
        categoryData={data.categoryData}
        funnelData={data.funnelData}
      />
    </div>
  )
}
