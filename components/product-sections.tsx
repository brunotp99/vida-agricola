import { getTranslations } from "next-intl/server"
import { ProductSection } from "./product-section-client"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

export async function BestSellers() {
  const raw = await ProductService.findBestSellers()
  const products = raw.map(serializeProductCard)
  const t = await getTranslations("sections")
  return (
    <ProductSection
      title={t("bestSellers")}
      subtitle={t("bestSellersSubtitle")}
      products={products}
      viewAllHref="/best-sellers"
    />
  )
}

export async function NewArrivals() {
  const raw = await ProductService.findNewArrivals()
  const products = raw.map(serializeProductCard)
  const t = await getTranslations("sections")
  return (
    <ProductSection
      title={t("newArrivals")}
      subtitle={t("newArrivalsSubtitle")}
      products={products}
      viewAllHref="/new-arrivals"
    />
  )
}

export async function FeaturedProducts() {
  const raw = await ProductService.findFeatured()
  const products = raw.map(serializeProductCard)
  const t = await getTranslations("sections")
  return (
    <ProductSection
      title={t("featuredProducts")}
      subtitle={t("featuredProductsSubtitle")}
      products={products}
      viewAllHref="/featured"
    />
  )
}
