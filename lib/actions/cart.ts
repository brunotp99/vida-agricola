"use server"

import { cookies } from "next/headers"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"
import { prisma } from "@/lib/prisma"

async function getCartIdentity() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user.id ?? null
  if (userId) return { userId }

  const cookieStore = await cookies()
  let sessionId = cookieStore.get("guest-session-id")?.value
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    cookieStore.set("guest-session-id", sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }
  return { sessionId }
}

export async function addToCartAction(productId: string, variantId?: string, quantity = 1) {
  try {
    const identity = await getCartIdentity()
    await CartService.addItem(identity, { productId, variantId, quantity })
    revalidatePath("/cart")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add item" }
  }
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  try {
    await CartService.updateItem(itemId, quantity)
    revalidatePath("/cart")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update item" }
  }
}

export async function removeFromCartAction(itemId: string) {
  try {
    await CartService.removeItem(itemId)
    revalidatePath("/cart")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to remove item" }
  }
}

export async function mergeGuestCartAction() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Not authenticated" }

    const cookieStore = await cookies()
    const guestSessionId = cookieStore.get("guest-session-id")?.value
    if (!guestSessionId) return { success: true }

    await CartService.mergeGuestCart(guestSessionId, session.user.id)
    cookieStore.delete("guest-session-id")
    revalidatePath("/cart")
    return { success: true }
  } catch {
    return { success: false, error: "Failed to merge cart" }
  }
}

export async function applyCouponAction(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: { code: { equals: code, mode: "insensitive" } },
    })

    if (!coupon) return { success: false, error: "Invalid coupon code" }
    if (!coupon.active) return { success: false, error: "This coupon is no longer active" }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { success: false, error: "This coupon has expired" }
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { success: false, error: "Coupon usage limit reached" }
    }
    if (coupon.minOrderAmount !== null && subtotal < Number(coupon.minOrderAmount)) {
      return {
        success: false,
        error: `Minimum order amount of €${coupon.minOrderAmount} required`,
      }
    }

    let discountAmount = 0
    if (coupon.type === "percentage") {
      discountAmount = Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
    } else {
      discountAmount = Math.min(Number(coupon.value), subtotal)
    }

    return {
      success: true,
      data: { discountAmount, couponId: coupon.id, code: coupon.code, type: coupon.type },
    }
  } catch {
    return { success: false, error: "Failed to apply coupon" }
  }
}
