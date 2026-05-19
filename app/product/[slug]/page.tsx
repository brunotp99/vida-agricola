import { notFound } from "next/navigation"
import { Suspense } from "react"
import { headers } from "next/headers"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductDetailComponent } from "@/components/product-detail"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await ProductService.findBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, session] = await Promise.all([
    ProductService.findBySlug(slug),
    auth.api.getSession({ headers: await headers() }),
  ])

  if (!product) {
    notFound()
  }

  const rawRelated = await ProductService.findRelated(product.id, product.categoryId)
  const related = rawRelated.map(serializeProductCard)

  let canReview = false
  if (session) {
    const deliveredOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "delivered",
        items: { some: { productId: product.id } },
      },
    })
    canReview = !!deliveredOrder
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        <ProductDetailComponent product={product} relatedProducts={related} canReview={canReview} />
      </main>
      <Footer />
    </div>
  )
}
