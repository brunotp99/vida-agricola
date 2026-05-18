import { z } from "zod"

export const AddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  line1: z.string().min(5, "Address line 1 must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().optional(),
  postalCode: z.string().min(4, "Postal code must be at least 4 characters"),
  country: z.string().length(2, "Country must be a 2-letter ISO code").default("PT"),
})

export const CreatePaymentIntentSchema = z.object({
  cartId: z.string().cuid("Invalid cart ID"),
  addressId: z.string().cuid("Invalid address ID").optional(),
  shippingAddress: AddressSchema.optional(),
  couponCode: z.string().optional(),
})

export type AddressInput = z.infer<typeof AddressSchema>
export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentSchema>
