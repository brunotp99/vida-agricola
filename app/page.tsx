import { Suspense } from "react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { HeroSlider } from "@/components/hero-slider"
import { CategoriesGrid } from "@/components/categories-grid"
import { FlashDeals } from "@/components/flash-deals"
import { BestSellers, NewArrivals, FeaturedProducts } from "@/components/product-sections"
import { PromoBanner, NewsletterBanner } from "@/components/promo-banners"
import { Testimonials } from "@/components/testimonials"
import { BrandsCarousel } from "@/components/brands-carousel"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderServer />
      <main className="flex-1">
        <HeroSlider />
        <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
          <CategoriesGrid />
        </Suspense>
        <Suspense fallback={null}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={null}>
          <FlashDeals />
        </Suspense>
        <PromoBanner />
        <Suspense fallback={null}>
          <BestSellers />
        </Suspense>
        <Testimonials />
        <Suspense fallback={null}>
          <NewArrivals />
        </Suspense>
        <Suspense fallback={null}>
          <BrandsCarousel />
        </Suspense>
        <NewsletterBanner />
      </main>
      <Footer />
    </div>
  )
}
