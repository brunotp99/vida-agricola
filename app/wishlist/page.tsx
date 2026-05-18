import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { WishlistService } from "@/lib/services/wishlist.service"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"

export default async function WishlistPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login?redirect=/wishlist")

  function decimalToNum(val: unknown): number {
    if (typeof val === "number") return val
    if (typeof val === "string") return parseFloat(val)
    if (val != null && typeof (val as { toNumber?: unknown }).toNumber === "function") {
      return (val as { toNumber(): number }).toNumber()
    }
    return Number(val)
  }

  const rawItems = await WishlistService.getWishlist(session.user.id)
  const items = rawItems.map((item) => ({
    ...item,
    product: {
      ...item.product,
      price: decimalToNum(item.product.price),
      compareAtPrice:
        item.product.compareAtPrice == null ? null : decimalToNum(item.product.compareAtPrice),
    },
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">My Wishlist ({items.length})</h1>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <ProductCard key={item.id} product={item.product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">Your wishlist is empty.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
