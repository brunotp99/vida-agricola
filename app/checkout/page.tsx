import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"
import { prisma } from "@/lib/prisma"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { CheckoutFlow } from "@/components/checkout/checkout-flow"

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? null
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("guest-session-id")?.value

  const cart = userId
    ? await CartService.getCartWithItems({ userId })
    : sessionId
      ? await CartService.getCartWithItems({ sessionId })
      : null

  if (!cart || cart.items.length === 0) {
    redirect("/cart")
  }

  const savedAddresses = userId
    ? await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : []

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1 bg-muted/30">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/cart" className="hover:text-foreground">
                Cart
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Checkout</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <CheckoutFlow
            cart={{
              id: cart.id,
              items: cart.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                product: {
                  name: item.product.name,
                  price: item.product.price,
                  images: item.product.images,
                },
                variant: item.variant ? { price: item.variant.price } : null,
              })),
            }}
            savedAddresses={savedAddresses}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
