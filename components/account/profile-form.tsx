"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateProfileAction } from "@/lib/actions/users"

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

interface ProfileFormProps {
  name: string
  email: string
}

export function ProfileForm({ name, email }: ProfileFormProps) {
  const form = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    values: { name },
  })

  async function onSubmit(data: z.infer<typeof UpdateProfileSchema>) {
    const result = await updateProfileAction(data)
    if (result.success) {
      toast.success("Profile updated")
    } else {
      toast.error(result.error || "Failed to update profile")
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your account details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="opacity-60" />
            </div>
          </div>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
