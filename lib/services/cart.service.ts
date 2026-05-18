import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"

const { Decimal } = Prisma

type CartIdentity = { userId?: string | null; sessionId?: string | null }
type AddItemInput = { productId: string; variantId?: string | null; quantity: number }

async function getOrCreateCart(identity: CartIdentity) {
  const { userId, sessionId } = identity
  if (!userId && !sessionId) throw new Error("Cart identity required")

  if (userId) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    })
  }
  return prisma.cart.upsert({
    where: { sessionId: sessionId! },
    create: { sessionId: sessionId! },
    update: {},
  })
}

async function getCartWithItems(identity: CartIdentity) {
  const { userId, sessionId } = identity
  const where = userId ? { userId } : { sessionId: sessionId! }

  const cart = await prisma.cart.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
          variant: true,
        },
      },
    },
  })

  if (!cart) return null

  let subtotal = new Decimal(0)
  let itemCount = 0
  for (const item of cart.items) {
    const price = item.variant?.price ?? item.product.price
    subtotal = subtotal.add(price.mul(item.quantity))
    itemCount += item.quantity
  }

  return { ...cart, subtotal, itemCount }
}

async function addItem(identity: CartIdentity, input: AddItemInput) {
  const cart = await getOrCreateCart(identity)
  const { productId, variantId = null, quantity } = input

  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
    if (!variant || variant.stock < quantity) throw new Error("Insufficient stock")
  }

  // For null variantId, use findFirst since Prisma upsert struggles with null in composite unique
  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId, variantId },
  })

  if (existing) {
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } })
      if (!variant || variant.stock < existing.quantity + quantity) {
        throw new Error("Insufficient stock")
      }
    }
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: { increment: quantity } },
    })
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, productId, variantId, quantity },
  })
}

async function updateItem(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: itemId } })
  }
  return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } })
}

async function removeItem(itemId: string) {
  return prisma.cartItem.delete({ where: { id: itemId } })
}

async function clearCart(cartId: string) {
  return prisma.cartItem.deleteMany({ where: { cartId } })
}

async function mergeGuestCart(guestSessionId: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  })
  if (!guestCart || guestCart.items.length === 0) return

  const userCart = await getOrCreateCart({ userId })
  for (const item of guestCart.items) {
    try {
      await addItem(
        { userId },
        { productId: item.productId, variantId: item.variantId, quantity: item.quantity },
      )
    } catch {
      // skip items that fail stock check
    }
  }
  await prisma.cart.delete({ where: { id: guestCart.id } })
}

async function getItemCount(identity: CartIdentity) {
  const { userId, sessionId } = identity
  const where = userId ? { userId } : { sessionId: sessionId! }
  const cart = await prisma.cart.findFirst({
    where,
    include: { items: { select: { quantity: true } } },
  })
  return cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0
}

export const CartService = {
  getOrCreateCart,
  getCartWithItems,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeGuestCart,
  getItemCount,
}
