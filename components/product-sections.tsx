import { ProductSection } from "./product-section-client"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

export async function BestSellers() {
  const raw = await ProductService.findBestSellers()
  const products = raw.map(serializeProductCard)
  return (
    <ProductSection
      title="Best Sellers"
      subtitle="Our most popular products loved by farmers"
      products={products}
      viewAllHref="/best-sellers"
    />
  )
}

export async function NewArrivals() {
  const raw = await ProductService.findNewArrivals()
  const products = raw.map(serializeProductCard)
  return (
    <ProductSection
      title="New Arrivals"
      subtitle="Fresh additions to our product range"
      products={products}
      viewAllHref="/new-arrivals"
    />
  )
}

export async function FeaturedProducts() {
  const raw = await ProductService.findFeatured()
  const products = raw.map(serializeProductCard)
  return (
    <ProductSection
      title="Featured Products"
      subtitle="Handpicked selection of premium products"
      products={products}
      viewAllHref="/featured"
    />
  )
}
