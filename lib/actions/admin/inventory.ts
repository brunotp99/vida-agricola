"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { InventoryService } from "@/lib/services/inventory.service"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

const AdjustStockSchema = z.object({
  variantId: z.string().min(1),
  productId: z.string().min(1),
  newStockCount: z.number().int().min(0),
  reason: z.string().min(1, "Reason is required"),
})

export async function adjustStockAction(input: unknown) {
  try {
    await requireAdmin()

    const parsed = AdjustStockSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.errors[0].message }
    }

    await InventoryService.adjustStock(
      parsed.data.productId,
      parsed.data.variantId,
      parsed.data.newStockCount,
      parsed.data.reason,
    )

    revalidatePath("/admin/inventory")
    return { success: true as const }
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Failed to adjust stock",
    }
  }
}
