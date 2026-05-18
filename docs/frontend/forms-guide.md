# Forms Guide

React Hook Form + Zod + Server Actions is the standard form pattern throughout this app.

## Pattern

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LoginSchema } from "@/lib/validations/auth.schema"
import { signInAction } from "@/lib/actions/users"
import { useToast } from "@/hooks/use-toast"

type LoginFormData = z.infer<typeof LoginSchema>

export function LoginForm() {
  const { toast } = useToast()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: LoginFormData) {
    const result = await signInAction(data)
    if (!result.success) {
      toast({ title: "Sign in failed", description: result.error, variant: "destructive" })
      return
    }
    // redirect handled by the action or router.push here
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  )
}
```

## Zod Schema Location

All schemas live in `lib/validations/`. The same schema is used in both the form (client-side validation via `zodResolver`) and the Server Action (server-side validation via `schema.safeParse`). This ensures validation rules are not duplicated.

## Error Display

Form field errors are shown inline via `<FormMessage />` (from shadcn Form component). Server errors (e.g., "Email already taken") are shown via toast.

## Admin Forms

Admin forms use the same pattern. The product create/edit form has complex fields (image URL list, specification key-value pairs). Implement these as dynamic fields with `useFieldArray` from React Hook Form.

```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "images",
})
```

## Multi-Step Forms (Checkout)

The checkout multi-step form stores each step's data in `useState` at the parent level. Each step component receives the current data and an `onComplete(stepData)` callback. The parent combines all step data and calls `createPaymentIntentAction` on the final step.

```typescript
type CheckoutState = {
  address?: AddressFormData
  shippingMethod?: "standard" | "express"
  couponCode?: string
}
```
