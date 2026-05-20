import Link from "next/link"
import { Wheat, Tractor, Heart, HardHat, Leaf, Bird } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { CategoryService } from "@/lib/services/category.service"

const iconMap: Record<string, React.ElementType> = {
  Wheat,
  Tractor,
  Heart,
  HardHat,
  Leaf,
  Bird,
}

export async function CategoriesGrid() {
  const categories = await CategoryService.findWithSubcategories()
  const t = await getTranslations("categories")

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">{t("title")}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon ?? ""] || Leaf
            return (
              <Link key={category.id} href={`/category/${category.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("subcategories", { count: category.children.length })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
