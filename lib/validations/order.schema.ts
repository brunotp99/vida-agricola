import { z } from "zod"

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().cuid("Invalid order ID"),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
})

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
