"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Role } from "@/lib/generated/prisma/client"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

const RoleSchema = z.enum(["admin", "staff", "customer"])

export async function updateUserRoleAction(userId: string, role: Role) {
  try {
    const session = await requireAdmin()

    const parsed = RoleSchema.safeParse(role)
    if (!parsed.success) return { success: false as const, error: "Invalid role" }

    if (userId === session.user.id) {
      return { success: false as const, error: "You cannot change your own role" }
    }

    await prisma.user.update({ where: { id: userId }, data: { role } })

    revalidatePath("/admin/users")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update role" }
  }
}

export async function toggleUserBanAction(userId: string) {
  try {
    const session = await requireAdmin()

    if (userId === session.user.id) {
      return { success: false as const, error: "You cannot ban yourself" }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false as const, error: "User not found" }

    await prisma.user.update({
      where: { id: userId },
      data: { banned: !user.banned },
    })

    // Revoke all sessions for this user when banning
    if (!user.banned) {
      await prisma.session.deleteMany({ where: { userId } })
    }

    revalidatePath("/admin/users")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to toggle ban" }
  }
}
