import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { OrderActions } from "@/components/admin/order-actions"
import type { OrderStatus } from "@/lib/generated/prisma/client"

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
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
          variant: true,
        },
      },
      address: true,
    },
  })
  if (!order) notFound()

  const shippingAddress = order.shippingAddress as {
    name?: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Orders
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{order.createdAt.toLocaleString()}</p>
        </div>
        <Badge
          variant={statusVariant[order.status] ?? "secondary"}
          className="capitalize text-sm px-3 py-1"
        >
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">Variant: {item.variant.name}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium">€{Number(item.price).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">×{item.quantity}</p>
                      <p className="text-sm font-semibold">
                        €{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>€{Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>€{Number(order.shippingAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>€{Number(order.taxAmount).toFixed(2)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-€{Number(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{Number(order.total).toFixed(2)}</span>
              </div>
              {order.paymentIntentId && (
                <p className="text-xs text-gray-400 mt-2">
                  Payment Intent: {order.paymentIntentId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - customer & shipping */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{order.user?.name ?? "Unknown"}</p>
              <p className="text-gray-500">{order.user?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-1">
              {shippingAddress.name && <p className="font-medium">{shippingAddress.name}</p>}
              <p>{shippingAddress.line1}</p>
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              <p>
                {shippingAddress.city}
                {shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : ""}
              </p>
              <p>{shippingAddress.country}</p>
            </CardContent>
          </Card>

          <OrderActions order={{ id: order.id, status: order.status as OrderStatus, paymentIntentId: order.paymentIntentId ?? null }} />
        </div>
      </div>
    </div>
  )
}
