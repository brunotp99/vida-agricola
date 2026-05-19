import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OrderStatus } from "@/lib/generated/prisma/client"

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
]

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  processing: "secondary",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
  pending: "secondary",
}

interface PageProps {
  searchParams: Promise<{
    status?: string
    search?: string
    page?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status = "all", search = "", page: pageParam = "1" } = await searchParams
  const page = Math.max(1, parseInt(pageParam, 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where: Record<string, unknown> = {}
  if (status && status !== "all") where.status = status as OrderStatus
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  const pages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{total} orders total</p>
      </div>

      {/* Filters */}
      <form className="flex items-center gap-3 flex-wrap">
        <Input
          name="search"
          defaultValue={search}
          placeholder="Search by order # or email..."
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Order</th>
              <th className="text-left p-4 font-medium text-gray-600">Customer</th>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-right p-4 font-medium text-gray-600">Total</th>
              <th className="text-right p-4 font-medium text-gray-600">Items</th>
              <th className="text-right p-4 font-medium text-gray-600">Date</th>
              <th className="text-right p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                <td className="p-4">
                  <div>
                    <p className="font-medium text-gray-900">{order.user.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{order.user.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={statusVariant[order.status] ?? "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </td>
                <td className="p-4 text-right font-medium">€{Number(order.total).toFixed(2)}</td>
                <td className="p-4 text-right text-gray-500">{order._count.items}</td>
                <td className="p-4 text-right text-gray-400">
                  {order.createdAt.toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={`?status=${status}&search=${search}&page=${page - 1}`}>
                <Button variant="outline" size="sm">Prev</Button>
              </Link>
            )}
            <span>{page} / {pages}</span>
            {page < pages && (
              <Link href={`?status=${status}&search=${search}&page=${page + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
