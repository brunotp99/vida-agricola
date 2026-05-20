import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, Phone, Mail, MapPin, Clock } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"

export const metadata = { title: "Contact Us | Vida Agrícola" }

export default async function ContactPage() {
  const t = await getTranslations("contact")
  const tCommon = await getTranslations("common")

  const contactInfo = [
    {
      icon: Phone,
      label: t("phone"),
      value: "+351 21 000 0000",
      href: "tel:+351210000000",
    },
    {
      icon: Mail,
      label: t("emailLabel"),
      value: "suporte@vidaagricola.pt",
      href: "mailto:suporte@vidaagricola.pt",
    },
    {
      icon: MapPin,
      label: t("address"),
      value: "Rua da Agricultura, 42\n2670-000 Loures, Portugal",
      href: null,
    },
    {
      icon: Clock,
      label: t("hours"),
      value: t("hoursValue"),
      href: null,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                {tCommon("home")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{t("title")}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-3 text-4xl font-bold text-foreground">{t("getInTouch")}</h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact info */}
              <div>
                <h2 className="mb-8 text-2xl font-bold text-foreground">Contact Information</h2>
                <dl className="space-y-6">
                  {contactInfo.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {item.label}
                          </dt>
                          <dd className="mt-0.5 text-sm text-foreground">
                            {item.href ? (
                              <a href={item.href} className="hover:text-primary">
                                {item.value}
                              </a>
                            ) : (
                              <span className="whitespace-pre-line">{item.value}</span>
                            )}
                          </dd>
                        </div>
                      </div>
                    )
                  })}
                </dl>
              </div>

              {/* Form */}
              <div className="rounded-xl border border-border bg-card p-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
