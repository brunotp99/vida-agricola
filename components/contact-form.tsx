"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const t = useTranslations("contact")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    await new Promise((r) => setTimeout(r, 800))
    setStatus("sent")
  }

  if (status === "sent") {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <Send className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{t("successTitle")}</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("successDesc")}
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          {t("sendAnother")}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground">{t("sendMessage")}</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" placeholder={t("namePlaceholder")} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">{t("subject")}</Label>
        <Input id="subject" name="subject" placeholder={t("subjectPlaceholder")} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea id="message" name="message" placeholder={t("messagePlaceholder")} rows={5} required />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">{t("errorMessage")}</p>
      )}

      <Button type="submit" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("send")}
      </Button>
    </form>
  )
}
