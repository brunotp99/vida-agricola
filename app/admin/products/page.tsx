import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { ProductsTable } from "@/components/admin/products-table"

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { search = "", page: pageParam = "1" } = await searchParams
  const page = Math.max(1, parseInt(pageParam, 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        category: true,
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  const serialized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{total} products total</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      <ProductsTable
        products={serialized}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
      />
    </div>
  )
}
