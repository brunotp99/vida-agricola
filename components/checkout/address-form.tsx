"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AddressSchema, type AddressInput } from "@/lib/validations/checkout.schema"

type SavedAddress = {
  id: string
  name: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  isDefault: boolean
}

type Props = {
  savedAddresses?: SavedAddress[]
  onSubmit: (address: AddressInput) => void
}

export function AddressForm({ savedAddresses = [], onSubmit }: Props) {
  const t = useTranslations("checkout")
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressInput>({ resolver: zodResolver(AddressSchema) })

  function fillFromSaved(addr: SavedAddress) {
    setValue("name", addr.name)
    setValue("line1", addr.line1)
    setValue("line2", addr.line2 ?? "")
    setValue("city", addr.city)
    setValue("state", addr.state ?? "")
    setValue("postalCode", addr.postalCode)
    setValue("country", addr.country)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          {t("address")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {savedAddresses.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Saved Addresses</Label>
                <div className="space-y-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => fillFromSaved(addr)}
                      className="w-full rounded-lg border border-border p-3 text-left text-sm hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="ml-2 text-xs text-primary">(Default)</span>
                      )}
                      <br />
                      <span className="text-muted-foreground">
                        {addr.line1}, {addr.city}, {addr.postalCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("firstName")}</Label>
            <Input id="name" placeholder="João Silva" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line1">{t("addressLine1")}</Label>
            <Input id="line1" placeholder="Rua da Quinta, 123" {...register("line1")} />
            {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2">{t("addressLine2")}</Label>
            <Input id="line2" placeholder="Apt 4B" {...register("line2")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" placeholder="Lisboa" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{t("state")}</Label>
              <Input id="state" placeholder="Lisboa" {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t("postalCode")}</Label>
              <Input id="postalCode" placeholder="1000-001" {...register("postalCode")} />
              {errors.postalCode && (
                <p className="text-xs text-destructive">{errors.postalCode.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">{t("country")}</Label>
            <Input id="country" defaultValue="PT" {...register("country")} />
            {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground">
            {t("continueToShipping")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
