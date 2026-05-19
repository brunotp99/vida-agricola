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

const CategoryInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  featured: z.boolean().default(false),
})

export async function createCategoryAction(input: unknown) {
  try {
    await requireAdmin()
    const parsed = CategoryInputSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message }

    const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return { success: false as const, error: "A category with this slug already exists" }

    const category = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl || null,
        parentId: parsed.data.parentId || null,
        sortOrder: parsed.data.sortOrder,
        featured: parsed.data.featured,
      },
    })

    revalidatePath("/admin/categories")
    return { success: true as const, data: category }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to create category" }
  }
}

export async function updateCategoryAction(id: string, input: unknown) {
  try {
    await requireAdmin()
    const parsed = CategoryInputSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: parsed.error.errors[0].message }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl || null,
        parentId: parsed.data.parentId || null,
        sortOrder: parsed.data.sortOrder,
        featured: parsed.data.featured,
      },
    })

    revalidatePath("/admin/categories")
    return { success: true as const, data: category }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update category" }
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdmin()

    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return {
        success: false as const,
        error: `Cannot delete: ${productCount} product(s) are assigned to this category. Reassign them first.`,
      }
    }

    await prisma.category.delete({ where: { id } })

    revalidatePath("/admin/categories")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to delete category" }
  }
}
