"use server"

import { cookies } from "next/headers"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"

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
