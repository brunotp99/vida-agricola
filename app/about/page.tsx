import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, ChevronRight, Leaf, Users, Award, Truck } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "About Us | Vida Agrícola" }

const stats = [
  { label: "Years of Experience", value: "25+" },
  { label: "Products in Stock", value: "5,000+" },
  { label: "Happy Customers", value: "50,000+" },
  { label: "Partner Brands", value: "200+" },
]

const values = [
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We promote responsible agricultural practices and stock products that respect the land and environment.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "From family farms to large cooperatives, we serve every type of agricultural producer with the same dedication.",
  },
  {
    icon: Award,
    title: "Quality",
    description:
      "Every product in our catalogue is carefully selected and tested by our team of agronomists.",
  },
  {
    icon: Truck,
    title: "Reliable Supply",
    description:
      "Fast, nationwide delivery so your operation never stops due to missing inputs or equipment.",
  },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">About Us</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-primary/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              About Vida Agrícola
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              For over 25 years we have been the trusted partner of Portugal's agricultural
              community, supplying quality inputs, equipment, and expertise to help farms of all
              sizes thrive.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-card py-12">
          <div className="container mx-auto px-4">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 text-3xl font-bold text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-6 text-3xl font-bold text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Vida Agrícola was founded in 1999 by a family of farmers who understood firsthand
                  the difficulty of sourcing reliable agricultural supplies in Portugal. What started
                  as a small local warehouse has grown into one of the country's leading online
                  agri-input distributors.
                </p>
                <p>
                  Today our team of 150 agronomists, logistics specialists, and customer advisors
                  works every day to ensure that growers get the right products at the right time —
                  whether they are tending a few olive trees or running a 500-hectare cereal farm.
                </p>
                <p>
                  We stock everything from seeds, fertilisers, and crop-protection products to
                  irrigation systems, machinery, and precision-agriculture technology, always
                  partnering with brands that share our commitment to quality and sustainability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">Our Values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon
                return (
                  <div key={value.title} className="rounded-xl border border-border bg-card p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold text-foreground">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="container mx-auto px-4">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to shop?</h2>
            <p className="mb-8 text-muted-foreground">
              Browse our full catalogue of agricultural products.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Shop Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
