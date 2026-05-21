import { headers, cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import { ChevronRight, Home } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { CartItems } from "@/components/cart/cart-items"

export default async function CartPage() {
  const t = await getTranslations("cart")
  const tCommon = await getTranslations("common")
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? null
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("guest-session-id")?.value

  const rawCart = userId
    ? await CartService.getCartWithItems({ userId })
    : sessionId
      ? await CartService.getCartWithItems({ sessionId })
      : null

  const cart = rawCart
    ? {
        ...rawCart,
        subtotal: Number(rawCart.subtotal),
        items: rawCart.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
            compareAtPrice:
              item.product.compareAtPrice != null
                ? Number(item.product.compareAtPrice)
                : null,
          },
          variant: item.variant
            ? { ...item.variant, price: Number(item.variant.price) }
            : null,
        })),
      }
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1 bg-muted/30">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                {tCommon("home")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{t("title")}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">
            {t("itemCount", { count: cart?.itemCount ?? 0 })}
          </h1>
          <CartItems cart={cart} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
