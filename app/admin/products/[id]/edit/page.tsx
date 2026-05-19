import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { CategoryService } from "@/lib/services/category.service"
import { BrandService } from "@/lib/services/brand.service"
import { ProductForm } from "@/components/admin/product-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        specifications: { orderBy: { key: "asc" } },
        tags: true,
      },
    }),
    CategoryService.findAll(),
    BrandService.findAll(),
  ])

  if (!product) notFound()

  const defaultValues = {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    sku: product.sku,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    categoryId: product.categoryId ?? null,
    brandId: product.brandId ?? null,
    status: product.status,
    featured: product.featured,
    newArrival: product.newArrival,
    bestSeller: product.bestSeller,
    flashDeal: product.flashDeal,
    images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
    variants: product.variants.map((v) => ({
      name: v.name,
      sku: v.sku,
      price: Number(v.price),
      stock: v.stock,
    })),
    specifications: product.specifications.map((s) => ({ key: s.key, value: s.value })),
    tags: product.tags.map((t) => t.tag).join(", "),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Products
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit: {product.name}</h1>
      </div>

      <ProductForm
        categories={categories}
        brands={brands}
        defaultValues={defaultValues}
        mode="edit"
        productId={product.id}
      />
    </div>
  )
}
