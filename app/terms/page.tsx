import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "Terms of Service | Vida Agrícola" }

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Terms of Service</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: May 19, 2026</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="mt-3 text-muted-foreground">
                By accessing or using Vida Agrícola, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. Use of the Website</h2>
              <p className="mt-3 text-muted-foreground">
                You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others. You must not misuse our website by introducing viruses or other malicious material.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Orders and Payment</h2>
              <p className="mt-3 text-muted-foreground">
                When you place an order, you warrant that you are legally capable of entering into binding contracts. Payment must be made in full at the time of ordering. We reserve the right to refuse or cancel any order at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Shipping and Delivery</h2>
              <p className="mt-3 text-muted-foreground">
                We aim to dispatch orders within 2 business days. Delivery times vary depending on your location and chosen shipping method. We are not responsible for delays caused by courier services or customs processes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Returns and Refunds</h2>
              <p className="mt-3 text-muted-foreground">
                You have 30 days from receipt of your order to return unused items in their original packaging. Refunds will be processed within 7 business days of receiving the returned goods. Return shipping costs are the customer's responsibility unless the item is defective.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
              <p className="mt-3 text-muted-foreground">
                All content on this website, including text, images, logos, and graphics, is owned by or licensed to Vida Agrícola and is protected by copyright law. You may not reproduce any content without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
              <p className="mt-3 text-muted-foreground">
                Vida Agrícola shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products, to the extent permitted by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">8. Governing Law</h2>
              <p className="mt-3 text-muted-foreground">
                These terms are governed by the laws of the jurisdiction in which Vida Agrícola is registered. Any disputes shall be resolved in the courts of that jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">9. Contact</h2>
              <p className="mt-3 text-muted-foreground">
                For questions about these Terms, contact us at{" "}
                <a href="mailto:support@vidaagricola.com" className="text-primary hover:underline">
                  support@vidaagricola.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
