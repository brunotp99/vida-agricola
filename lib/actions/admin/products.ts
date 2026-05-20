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

const ProductImageSchema = z.object({
  url: z
    .string()
    .min(1, "Image URL required")
    .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Must be a valid URL or uploaded path"),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
})

const ProductVariantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
})

const SpecificationSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
})

const ProductFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().optional().nullable(),
  ),
  defaultStock: z.number().int().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  flashDeal: z.boolean().default(false),
  images: z.array(ProductImageSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  specifications: z.array(SpecificationSchema).default([]),
  tags: z.array(z.string()).default([]),
})

export type ProductFormInput = z.infer<typeof ProductFormSchema>

export async function createProductAction(input: unknown) {
  try {
    await requireAdmin()
    const parsed = ProductFormSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.errors[0].message }
    }

    const data = parsed.data

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } })
    if (existing) return { success: false as const, error: "A product with this slug already exists" }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        categoryId: data.categoryId ?? null,
        brandId: data.brandId ?? null,
        status: data.status,
        featured: data.featured,
        newArrival: data.newArrival,
        bestSeller: data.bestSeller,
        flashDeal: data.flashDeal,
        images: {
          create: data.images.map((img, i) => ({ ...img, sortOrder: i })),
        },
        variants: {
          create:
            data.variants.length > 0
              ? data.variants
              : [{ name: "Standard", sku: `${data.sku}-STD`, price: data.price, stock: data.defaultStock }],
        },
        specifications: {
          create: data.specifications,
        },
        tags: {
          create: data.tags.map((tag) => ({ tag })),
        },
      },
    })

    revalidatePath("/admin/products")
    return { success: true as const, data: product }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to create product" }
  }
}

export async function updateProductAction(id: string, input: unknown) {
  try {
    await requireAdmin()
    const parsed = ProductFormSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false as const, error: parsed.error.errors[0].message }
    }

    const data = parsed.data

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice ?? null,
        categoryId: data.categoryId ?? null,
        brandId: data.brandId ?? null,
        status: data.status,
        featured: data.featured,
        newArrival: data.newArrival,
        bestSeller: data.bestSeller,
        flashDeal: data.flashDeal,
        images: {
          deleteMany: {},
          create: data.images.map((img, i) => ({ ...img, sortOrder: i })),
        },
        variants: {
          deleteMany: {},
          create:
            data.variants.length > 0
              ? data.variants
              : [{ name: "Standard", sku: `${data.sku}-STD`, price: data.price, stock: data.defaultStock }],
        },
        specifications: {
          deleteMany: {},
          create: data.specifications,
        },
        tags: {
          deleteMany: {},
          create: data.tags.map((tag) => ({ tag })),
        },
      },
    })

    revalidatePath("/admin/products")
    revalidatePath(`/product/${data.slug}`)
    return { success: true as const, data: product }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update product" }
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdmin()

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return { success: false as const, error: "Product not found" }

    await prisma.product.update({ where: { id }, data: { status: "archived" } })

    revalidatePath("/admin/products")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to delete product" }
  }
}

export async function updateProductStatusAction(id: string, status: "draft" | "active" | "archived") {
  try {
    await requireAdmin()

    await prisma.product.update({ where: { id }, data: { status } })

    revalidatePath("/admin/products")
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update status" }
  }
}
