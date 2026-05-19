import { CategoryService } from "@/lib/services/category.service"
import { BrandService } from "@/lib/services/brand.service"
import { ProductForm } from "@/components/admin/product-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    CategoryService.findAll(),
    BrandService.findAll(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Products
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        mode="create"
      />
    </div>
  )
}
