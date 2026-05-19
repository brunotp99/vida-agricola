import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Package, ShoppingBag } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderService } from "@/lib/services/order.service"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

type Props = {
  searchParams: Promise<{ orderId?: string; payment_intent?: string }>
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function OrderConfirmationPage({ searchParams }: Props) {
  const { orderId, payment_intent } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id

  let order = null

  if (orderId) {
    order = await OrderService.findById(orderId, userId)
  } else if (payment_intent) {
    order = await prisma.order.findUnique({
      where: { paymentIntentId: payment_intent },
      include: {
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            variant: true,
          },
        },
        address: true,
      },
    })
    if (order && userId && order.userId !== userId) order = null
  }

  if (!order) notFound()

  const shippingAddress = order.shippingAddress as {
    name: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="text-3xl font-bold text-foreground">Order Confirmed!</h1>
            <p className="mt-2 text-muted-foreground">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
            <p className="mt-1 font-medium text-foreground">Order #{order.orderNumber}</p>
          </div>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
              <Badge className={statusColors[order.status] ?? ""} variant="outline">
                {order.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {order.items.map((item) => {
                  const image =
                    "product" in item && item.product?.images?.[0]?.url
                      ? item.product.images[0].url
                      : null
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {image && (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image src={image} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </span>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(Number(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {Number(order.shippingAmount) === 0
                      ? "Free"
                      : formatPrice(Number(order.shippingAmount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (VAT)</span>
                  <span>{formatPrice(Number(order.taxAmount))}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-semibold">Shipping Address</h4>
                <p className="text-sm text-muted-foreground">
                  {shippingAddress.name}
                  <br />
                  {shippingAddress.line1}
                  {shippingAddress.line2 && (
                    <>
                      <br />
                      {shippingAddress.line2}
                    </>
                  )}
                  <br />
                  {shippingAddress.city}
                  {shippingAddress.state && `, ${shippingAddress.state}`},{" "}
                  {shippingAddress.postalCode}
                  <br />
                  {shippingAddress.country}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1 bg-primary text-primary-foreground">
              <Link href="/">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/account/orders">View All Orders</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
