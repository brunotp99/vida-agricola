import { prisma } from "@/lib/prisma"

async function reserveStock(
  productId: string,
  variantId: string | null,
  quantity: number,
  orderId?: string,
) {
  await prisma.$transaction(async (tx) => {
    if (variantId) {
      const result = await tx.$executeRaw`
        UPDATE "ProductVariant"
        SET "stock" = "stock" - ${quantity}
        WHERE id = ${variantId} AND "stock" >= ${quantity}
      `
      if (result === 0) throw new Error(`Insufficient stock for variant ${variantId}`)
    }
    await tx.inventoryLog.create({
      data: { productId, variantId, delta: -quantity, reason: "sale", orderId },
    })
  })
}

async function releaseStock(productId: string, variantId: string | null, quantity: number) {
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: { increment: quantity } },
    })
  }
  await logMovement(productId, variantId, quantity, "return")
}

async function logMovement(
  productId: string,
  variantId: string | null,
  delta: number,
  reason: string,
  orderId?: string,
) {
  return prisma.inventoryLog.create({
    data: { productId, variantId, delta, reason, orderId },
  })
}

async function getStockLevel(productId: string, variantId?: string) {
  if (variantId) {
    const v = await prisma.productVariant.findUnique({ where: { id: variantId } })
    return v?.stock ?? 0
  }
  const variants = await prisma.productVariant.findMany({
    where: { productId },
  })
  return variants.reduce((sum, v) => sum + v.stock, 0)
}

async function getLowStockProducts(threshold = 5) {
  return prisma.productVariant.findMany({
    where: { stock: { lte: threshold } },
    include: {
      product: { include: { images: { take: 1 } } },
    },
    orderBy: { stock: "asc" },
  })
}

async function adjustStock(productId: string, variantId: string, newStock: number, reason: string) {
  const current = await prisma.productVariant.findUnique({
    where: { id: variantId },
  })
  const delta = newStock - (current?.stock ?? 0)

  await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: newStock },
    }),
    prisma.inventoryLog.create({
      data: { productId, variantId, delta, reason: "adjustment" },
    }),
  ])
}

export const InventoryService = {
  reserveStock,
  releaseStock,
  logMovement,
  getStockLevel,
  getLowStockProducts,
  adjustStock,
}
