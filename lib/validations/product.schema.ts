import { z } from "zod"

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive("Compare at price must be positive").optional(),
  categoryId: z.string().cuid("Invalid category ID").optional(),
  brandId: z.string().cuid("Invalid brand ID").optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  flashDeal: z.boolean().default(false),
})

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().cuid("Invalid product ID"),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
