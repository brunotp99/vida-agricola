import Link from "next/link"
import { BrandService } from "@/lib/services/brand.service"

export async function BrandsCarousel() {
  const brands = await BrandService.findFeatured()

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">Trusted Brands</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We partner with the best brands in agricultural industry
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group block rounded-lg border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex h-12 items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground transition-colors group-hover:text-foreground">
                  {brand.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
