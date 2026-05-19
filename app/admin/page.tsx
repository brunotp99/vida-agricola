import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/admin/stats-card"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, AlertTriangle } from "lucide-react"
import { formatPrice } from "@/lib/utils"

const getDashboardStats = unstable_cache(
  async () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [totalRevenueResult, ordersToday, newUsers, lowStockCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["delivered", "confirmed", "shipped", "processing"] } },
      }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.productVariant.count({ where: { stock: { lte: 5 } } }),
    ])

    const totalRevenue = Number(totalRevenueResult._sum.total ?? 0)

    return { totalRevenue, ordersToday, newUsers, lowStockCount }
  },
  ["dashboard-stats"],
  { revalidate: 900, tags: ["dashboard"] },
)

const getRevenueChart = unstable_cache(
  async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ["delivered", "confirmed", "shipped", "processing"] },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" },
    })

    const byDay: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      const key = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      byDay[key] = 0
    }

    for (const order of orders) {
      const key = order.createdAt.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
      if (key in byDay) {
        byDay[key] += Number(order.total)
      }
    }

    return Object.entries(byDay).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }))
  },
  ["dashboard-revenue-chart"],
  { revalidate: 900, tags: ["dashboard"] },
)

const getRecentOrders = unstable_cache(
  async () => {
    return prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    })
  },
  ["dashboard-recent-orders"],
  { revalidate: 900, tags: ["dashboard"] },
)

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  processing: "secondary",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
  pending: "secondary",
}

export default async function AdminDashboardPage() {
  const [stats, chartData, recentOrders] = await Promise.all([
    getDashboardStats(),
    getRevenueChart(),
    getRecentOrders(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          description="All time (confirmed orders)"
          icon={DollarSign}
        />
        <StatsCard
          title="Orders Today"
          value={stats.ordersToday}
          description="All statuses"
          icon={ShoppingCart}
        />
        <StatsCard
          title="New Users (7d)"
          value={stats.newUsers}
          description="Registered in last 7 days"
          icon={Users}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          description="Variants with ≤5 units"
          icon={AlertTriangle}
          className={stats.lowStockCount > 0 ? "border-orange-200" : ""}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={chartData} title="Revenue — Last 30 Days" />

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left pb-3 font-medium">Order</th>
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-right pb-3 font-medium">Items</th>
                  <th className="text-right pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs">{order.orderNumber}</td>
                    <td className="py-3 text-gray-700">
                      {order.user.name ?? order.user.email}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={statusVariant[order.status] ?? "secondary"}
                        className="capitalize text-xs"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="py-3 text-right text-gray-500">{order._count.items}</td>
                    <td className="py-3 text-right text-gray-400">
                      {order.createdAt.toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
