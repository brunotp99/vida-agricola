"use client"

import { useState } from "react"
import { Check, CreditCard, MapPin, Truck } from "lucide-react"
import { useTranslations } from "next-intl"
import { AddressForm } from "./address-form"
import { PaymentForm } from "./payment-form"
import { StripeElements } from "./stripe-elements"
import { OrderSummary } from "./order-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createPaymentIntentAction } from "@/lib/actions/checkout"
import type { AddressInput } from "@/lib/validations/checkout.schema"
import { formatPrice } from "@/lib/utils"

type CartItem = {
  id: string
  quantity: number
  product: {
    name: string
    price: { toString(): string }
    images: Array<{ url: string }>
  }
  variant: { price: { toString(): string } } | null
}

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

type Totals = {
  subtotal: number
  discount: number
  shippingAmount: number
  taxAmount: number
  total: number
}

type Props = {
  cart: { id: string; items: CartItem[] }
  savedAddresses: SavedAddress[]
}

export function CheckoutFlow({ cart, savedAddresses }: Props) {
  const t = useTranslations("checkout")
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState<AddressInput | null>(null)
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingPI, setLoadingPI] = useState(false)

  const steps = [
    { id: 1, name: t("address"), icon: MapPin },
    { id: 2, name: t("shippingStep"), icon: Truck },
    { id: 3, name: t("payment"), icon: CreditCard },
  ]

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + Number(item.variant?.price ?? item.product.price) * item.quantity
  }, 0)

  const previewShipping = shippingMethod === "express" ? 19.99 : subtotal >= 99 ? 0 : 9.99

  async function handleAddressSubmit(addr: AddressInput) {
    setAddress(addr)
    setStep(2)
  }

  async function handleShippingContinue() {
    if (!address) return
    setLoadingPI(true)
    setError(null)
    const result = await createPaymentIntentAction({
      cartId: cart.id,
      shippingMethod,
      shippingAddress: address,
    })
    setLoadingPI(false)
    if (!result.success) {
      setError(result.error ?? t("paymentFailed"))
      return
    }
    if (result.data) {
      setClientSecret(result.data.clientSecret)
      setTotals(result.data.totals)
    }
    setStep(3)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step > s.id
                      ? "bg-primary text-primary-foreground"
                      : step === s.id
                        ? "border-2 border-primary bg-card text-primary"
                        : "border-2 border-muted bg-card text-muted-foreground"
                  }`}
                >
                  {step > s.id ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className="hidden font-medium sm:inline">{s.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-16 sm:w-24 ${step > s.id ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {step === 1 && (
          <AddressForm savedAddresses={savedAddresses} onSubmit={handleAddressSubmit} />
        )}

        {step === 2 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                {t("shippingMethod")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={shippingMethod}
                onValueChange={(v) => setShippingMethod(v as "standard" | "express")}
                className="space-y-3"
              >
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <div>
                      <Label htmlFor="standard" className="font-medium">
                        {t("standardShipping")}
                      </Label>
                      <p className="text-sm text-muted-foreground">{t("standardShippingDesc")}</p>
                    </div>
                  </div>
                  <span className="font-medium">{subtotal >= 99 ? t("free") : "€9.99"}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" id="express" />
                    <div>
                      <Label htmlFor="express" className="font-medium">
                        {t("expressShipping")}
                      </Label>
                      <p className="text-sm text-muted-foreground">{t("expressShippingDesc")}</p>
                    </div>
                  </div>
                  <span className="font-medium">€19.99</span>
                </div>
              </RadioGroup>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t("back")}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onClick={handleShippingContinue}
                  disabled={loadingPI}
                >
                  {loadingPI ? t("preparingPayment") : t("continueToPayment")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && clientSecret && totals && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {t("payment")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StripeElements clientSecret={clientSecret}>
                <PaymentForm total={totals.total} onBack={() => setStep(2)} />
              </StripeElements>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-1">
        <OrderSummary
          items={cart.items}
          totals={
            totals ?? {
              subtotal,
              discount: 0,
              shippingAmount: previewShipping,
              taxAmount: Math.round(subtotal * 0.23 * 100) / 100,
              total: subtotal + previewShipping + Math.round(subtotal * 0.23 * 100) / 100,
            }
          }
        />
      </div>
    </div>
  )
}
