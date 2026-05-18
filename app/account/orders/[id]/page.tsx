import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, ChevronRight, Package } from "lucide-react"
import { auth } from "@/lib/auth"
import { OrderService } from "@/lib/services/order.service"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect(`/login?redirect=/account/orders/${id}`)

  const order = await OrderService.findById(id, session.user.id)
  if (!order) notFound()

  const subtotal = typeof order.subtotal === "number" ? order.subtotal : Number(order.subtotal)
  const shippingAmount =
    typeof order.shippingAmount === "number" ? order.shippingAmount : Number(order.shippingAmount)
  const taxAmount = typeof order.taxAmount === "number" ? order.taxAmount : Number(order.taxAmount)
  const discountAmount =
    typeof order.discountAmount === "number" ? order.discountAmount : Number(order.discountAmount)
  const total = typeof order.total === "number" ? order.total : Number(order.total)

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/account" className="hover:text-foreground">
                My Account
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Order {order.orderNumber}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge
              className={
                order.status === "delivered"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "ml-auto bg-secondary text-secondary-foreground"
              }
            >
              {order.status}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item) => {
                    const imageUrl = item.product?.images?.[0]?.url ?? null
                    const itemPrice =
                      typeof item.price === "number" ? item.price : Number(item.price)
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        {imageUrl && (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image src={imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {typeof order.shippingAddress === "object" && order.shippingAddress !== null ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {(order.shippingAddress as Record<string, string>).name && (
                          <p className="font-medium text-foreground">
                            {(order.shippingAddress as Record<string, string>).name}
                          </p>
                        )}
                        <p>{(order.shippingAddress as Record<string, string>).line1}</p>
                        {(order.shippingAddress as Record<string, string>).line2 && (
                          <p>{(order.shippingAddress as Record<string, string>).line2}</p>
                        )}
                        <p>
                          {(order.shippingAddress as Record<string, string>).city},{" "}
                          {(order.shippingAddress as Record<string, string>).state}{" "}
                          {(order.shippingAddress as Record<string, string>).postalCode}
                        </p>
                        <p>{(order.shippingAddress as Record<string, string>).country}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(shippingAmount)}</span>
                    </div>
                  )}
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatPrice(taxAmount)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-primary">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
