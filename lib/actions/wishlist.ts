"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { WishlistService } from "@/lib/services/wishlist.service"

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Authentication required")
  return session
}

export async function addToWishlistAction(productId: string) {
  try {
    const session = await requireAuth()
    await WishlistService.addItem(session.user.id, productId)
    revalidatePath("/wishlist")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" }
  }
}

export async function removeFromWishlistAction(productId: string) {
  try {
    const session = await requireAuth()
    await WishlistService.removeItem(session.user.id, productId)
    revalidatePath("/wishlist")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" }
  }
}

export async function toggleWishlistAction(productId: string) {
  try {
    const session = await requireAuth()
    const isWishlisted = await WishlistService.isWishlisted(session.user.id, productId)
    if (isWishlisted) {
      await WishlistService.removeItem(session.user.id, productId)
    } else {
      await WishlistService.addItem(session.user.id, productId)
    }
    revalidatePath("/wishlist")
    return { success: true, wishlisted: !isWishlisted }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed" }
  }
}
