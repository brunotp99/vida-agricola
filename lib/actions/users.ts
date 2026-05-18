"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export async function updateProfileAction(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const parsed = UpdateProfileSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      ...(parsed.data.image ? { image: parsed.data.image } : {}),
    },
  })

  revalidatePath("/account")
  return { success: true }
}

export async function changePasswordAction(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const parsed = ChangePasswordSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: false,
      },
      headers: await headers(),
    })
    return { success: true }
  } catch {
    return { success: false, error: "Current password is incorrect" }
  }
}
