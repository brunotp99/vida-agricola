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

const AddressInputSchema = z.object({
  name: z.string().min(2),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(4),
  country: z.string().length(2).default("PT"),
})

export async function addAddressAction(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const parsed = AddressInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } })
  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      isDefault: existingCount === 0,
    },
  })

  revalidatePath("/account")
  return { success: true, data: address }
}

export async function updateAddressAction(id: string, input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Address not found" }
  }

  const parsed = AddressInputSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const address = await prisma.address.update({ where: { id }, data: parsed.data })
  revalidatePath("/account")
  return { success: true, data: address }
}

export async function deleteAddressAction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Address not found" }
  }

  if (existing.isDefault) {
    const count = await prisma.address.count({ where: { userId: session.user.id } })
    if (count === 1) return { success: false, error: "Cannot delete the only address" }
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id, id: { not: id } },
    })
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
  }

  await prisma.address.delete({ where: { id } })
  revalidatePath("/account")
  return { success: true }
}

export async function setDefaultAddressAction(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Unauthorized" }

  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return { success: false, error: "Address not found" }
  }

  await prisma.address.updateMany({
    where: { userId: session.user.id },
    data: { isDefault: false },
  })
  await prisma.address.update({ where: { id }, data: { isDefault: true } })
  revalidatePath("/account")
  return { success: true }
}
