import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "Privacy Policy | Vida Agrícola" }

export default function PrivacyPage() {
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
              <span className="font-medium text-foreground">Privacy Policy</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mb-8 text-sm text-muted-foreground">Last updated: May 19, 2026</p>

          <div className="prose prose-neutral max-w-none dark:prose-invert space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              <p className="mt-3 text-muted-foreground">
                We collect information you provide when you create an account, place an order, or contact us. This includes your name, email address, shipping address, and payment information. We also automatically collect certain technical data such as IP address, browser type, and pages visited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <p className="mt-3 text-muted-foreground">
                Your information is used to process orders, send order confirmations and shipping updates, respond to customer service requests, and improve our website. We may also send promotional emails if you have opted in.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">3. Sharing of Information</h2>
              <p className="mt-3 text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except to trusted partners who assist us in operating our website and fulfilling orders, provided they agree to keep your information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">4. Cookies</h2>
              <p className="mt-3 text-muted-foreground">
                We use cookies to enhance your experience, maintain your session, and understand site traffic. You can choose to disable cookies through your browser settings, though some features of the site may not function properly as a result.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">5. Data Retention</h2>
              <p className="mt-3 text-muted-foreground">
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">6. Your Rights</h2>
              <p className="mt-3 text-muted-foreground">
                You have the right to access, correct, or delete your personal data. You may also object to certain processing and request data portability. To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@vidaagricola.com" className="text-primary hover:underline">
                  privacy@vidaagricola.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">7. Contact Us</h2>
              <p className="mt-3 text-muted-foreground">
                If you have questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@vidaagricola.com" className="text-primary hover:underline">
                  support@vidaagricola.com
                </a>{" "}
                or write to us at 123 Farm Road, Agricultural City, AC 12345.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
