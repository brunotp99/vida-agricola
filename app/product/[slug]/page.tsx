import { notFound } from "next/navigation"
import { Suspense } from "react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductDetailComponent } from "@/components/product-detail"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

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
  const product = await ProductService.findBySlug(slug)

  if (!product) {
    notFound()
  }

  const rawRelated = await ProductService.findRelated(product.id, product.categoryId)
  const related = rawRelated.map(serializeProductCard)

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        <ProductDetailComponent product={product} relatedProducts={related} />
      </main>
      <Footer />
    </div>
  )
}
