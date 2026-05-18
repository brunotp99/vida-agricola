import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSlider } from '@/components/hero-slider'
import { CategoriesGrid } from '@/components/categories-grid'
import { FlashDeals } from '@/components/flash-deals'
import { BestSellers, NewArrivals, FeaturedProducts } from '@/components/product-sections'
import { PromoBanner, NewsletterBanner } from '@/components/promo-banners'
import { Testimonials } from '@/components/testimonials'
import { BrandsCarousel } from '@/components/brands-carousel'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <CategoriesGrid />
        <FeaturedProducts />
        <FlashDeals />
        <PromoBanner />
        <BestSellers />
        <Testimonials />
        <NewArrivals />
        <BrandsCarousel />
        <NewsletterBanner />
      </main>
      <Footer />
    </div>
  )
}
