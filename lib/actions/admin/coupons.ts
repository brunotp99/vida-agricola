"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

const CouponInputSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
})

export async function createCouponAction(input: unknown) {
  try {
    await requireAdmin()
    const parsed = CouponInputSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message }

    const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } })
    if (existing) return { success: false as const, error: "A coupon with this code already exists" }

    const coupon = await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrderAmount: parsed.data.minOrderAmount ?? null,
        maxUses: parsed.data.maxUses ?? null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        active: parsed.data.active,
      },
    })

    revalidatePath("/admin/coupons")
    return { success: true as const, data: coupon }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to create coupon" }
  }
}

export async function updateCouponAction(id: string, input: unknown) {
  try {
    await requireAdmin()
    const parsed = CouponInputSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: parsed.data.code,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrderAmount: parsed.data.minOrderAmount ?? null,
        maxUses: parsed.data.maxUses ?? null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        active: parsed.data.active,
      },
    })

    revalidatePath("/admin/coupons")
    return { success: true as const, data: coupon }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update coupon" }
  }
}

export async function deleteCouponAction(id: string) {
  try {
    await requireAdmin()
    await prisma.coupon.delete({ where: { id } })
    revalidatePath("/admin/coupons")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to delete coupon" }
  }
}

export async function toggleCouponActiveAction(id: string) {
  try {
    await requireAdmin()
    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) return { success: false as const, error: "Coupon not found" }

    await prisma.coupon.update({ where: { id }, data: { active: !coupon.active } })
    revalidatePath("/admin/coupons")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to toggle coupon" }
  }
}
