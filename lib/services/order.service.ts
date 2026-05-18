import { prisma } from "@/lib/prisma"
import type { OrderStatus } from "@/lib/generated/prisma/client"

type CreateOrderInput = {
  userId: string
  cartId: string
  paymentIntentId: string
  shippingAddress: {
    name: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  shippingAmount: number
  discountAmount: number
  couponId?: string
}

function generateOrderNumber() {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  const random = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0")
  return `VA-${dateStr}-${random}`
}

async function createOrder(input: CreateOrderInput) {
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
          variant: true,
        },
      },
    },
  })
  if (!cart || cart.items.length === 0) throw new Error("Cart is empty")

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.variant?.price ?? item.product.price
    return sum + Number(price) * item.quantity
  }, 0)

  const taxAmount = Math.round(subtotal * 0.08 * 100) / 100
  const total = subtotal + Number(input.shippingAmount) + taxAmount - Number(input.discountAmount)
  const orderNumber = generateOrderNumber()

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        status: "confirmed",
        subtotal,
        shippingAmount: input.shippingAmount,
        taxAmount,
        discountAmount: input.discountAmount,
        total,
        paymentIntentId: input.paymentIntentId,
        shippingAddress: input.shippingAddress,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.product.name,
            sku: item.variant?.sku ?? item.product.sku,
            price: item.variant?.price ?? item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.images[0]?.url ?? null,
          })),
        },
      },
      include: { items: true },
    })

    await tx.cartItem.deleteMany({ where: { cartId: input.cartId } })

    for (const item of cart.items) {
      if (item.variantId) {
        await tx.$executeRaw`
          UPDATE "ProductVariant"
          SET "stock" = "stock" - ${item.quantity}
          WHERE id = ${item.variantId} AND "stock" >= ${item.quantity}
        `
      }
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          delta: -item.quantity,
          reason: "sale",
          orderId: created.id,
        },
      })
    }

    return created
  })

  return order
}

async function findByUser(userId: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          take: 3,
          select: { name: true, imageUrl: true, quantity: true },
        },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ])
  return { orders, total, pages: Math.ceil(total / limit) }
}

async function findById(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
          variant: true,
        },
      },
      address: true,
    },
  })
  if (!order) return null
  if (userId && order.userId !== userId) return null
  return order
}

async function findAll(options: { status?: OrderStatus; page?: number; limit?: number } = {}) {
  const { status, page = 1, limit = 20 } = options
  const skip = (page - 1) * limit
  const where = status ? { status } : {}

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])
  return { orders, total, pages: Math.ceil(total / limit) }
}

async function updateStatus(orderId: string, status: OrderStatus) {
  return prisma.order.update({ where: { id: orderId }, data: { status } })
}

async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: true } } },
  })
  if (!order || order.userId !== userId) throw new Error("Order not found")

  const cancellable: OrderStatus[] = ["pending", "confirmed"]
  if (!cancellable.includes(order.status)) {
    throw new Error("Order cannot be cancelled at this stage")
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: "cancelled" },
    })
    for (const item of order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        })
      }
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          variantId: item.variantId,
          delta: item.quantity,
          reason: "cancellation",
          orderId,
        },
      })
    }
  })
}

export const OrderService = {
  createOrder,
  findByUser,
  findById,
  findAll,
  updateStatus,
  cancelOrder,
  generateOrderNumber,
}
export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof findById>>>
