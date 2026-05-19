import { prisma } from "@/lib/prisma"
import { InventoryClient } from "@/components/admin/inventory-client"

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminInventoryPage({ searchParams }: PageProps) {
  const { page: pageParam = "1", search = "" } = await searchParams
  const page = Math.max(1, parseInt(pageParam, 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { sku: { contains: search, mode: "insensitive" as const } },
          { product: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : {}

  const [variants, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      include: {
        product: {
          include: {
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: { stock: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.productVariant.count({ where }),
  ])

  // Fetch recent inventory logs for each variant
  const variantIds = variants.map((v) => v.id)
  const logs = await prisma.inventoryLog.findMany({
    where: { variantId: { in: variantIds } },
    orderBy: { createdAt: "desc" },
    take: variantIds.length * 5,
  })

  const logsByVariant: Record<string, typeof logs> = {}
  for (const log of logs) {
    if (!log.variantId) continue
    if (!logsByVariant[log.variantId]) logsByVariant[log.variantId] = []
    if (logsByVariant[log.variantId].length < 5) {
      logsByVariant[log.variantId].push(log)
    }
  }

  const serialized = variants.map((v) => ({
    ...v,
    price: Number(v.price),
    product: {
      ...v.product,
      price: Number(v.product.price),
    },
    recentLogs: logsByVariant[v.id] ?? [],
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">{total} variants total</p>
      </div>
      <InventoryClient variants={serialized} total={total} page={page} pageSize={pageSize} />
    </div>
  )
}
