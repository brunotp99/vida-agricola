import { z } from "zod"

export const AddToCartSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  variantId: z.string().cuid("Invalid variant ID").optional(),
  quantity: z
    .number()
    .int()
    .min(1, "Quantity must be at least 1")
    .max(99, "Quantity cannot exceed 99"),
})

export const UpdateCartItemSchema = z.object({
  cartItemId: z.string().cuid("Invalid cart item ID"),
  quantity: z
    .number()
    .int()
    .min(0, "Quantity must be 0 or more")
    .max(99, "Quantity cannot exceed 99"),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
