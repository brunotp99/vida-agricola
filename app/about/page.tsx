import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, Leaf, Users, Award, Truck } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "About Us | Vida Agrícola" }

export default async function AboutPage() {
  const t = await getTranslations("about")
  const tCommon = await getTranslations("common")

  const stats = [
    { label: t("yearsExperience"), value: t("yearsExperienceValue") },
    { label: t("productsInStock"), value: t("productsInStockValue") },
    { label: t("happyCustomers"), value: t("happyCustomersValue") },
    { label: t("partnerBrands"), value: t("partnerBrandsValue") },
  ]

  const values = [
    {
      icon: Leaf,
      title: t("sustainability"),
      description: t("sustainabilityDesc"),
    },
    {
      icon: Users,
      title: t("community"),
      description: t("communityDesc"),
    },
    {
      icon: Award,
      title: t("quality"),
      description: t("qualityDesc"),
    },
    {
      icon: Truck,
      title: t("reliableSupply"),
      description: t("reliableSupplyDesc"),
    },
  ]

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
                {tCommon("home")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{t("title")}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-primary/5 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("subtitle")}
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
              <h2 className="mb-6 text-3xl font-bold text-foreground">{t("ourStory")}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t("storyP1")}</p>
                <p>{t("storyP2")}</p>
                <p>{t("storyP3")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">{t("ourValues")}</h2>
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
            <h2 className="mb-4 text-2xl font-bold text-foreground">{t("readyToShop")}</h2>
            <p className="mb-8 text-muted-foreground">
              {t("readyToShopDesc")}
            </p>
            <Link
              href="/search"
              className="inline-flex items-center rounded-md bg-primary px-8 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("shopNow")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
