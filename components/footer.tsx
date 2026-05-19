import Link from "next/link"
import Image from "next/image"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react"
import { CategoryService } from "@/lib/services/category.service"
import { FooterNewsletterForm } from "./footer-newsletter-form"

export async function Footer() {
  const categories = await CategoryService.findWithSubcategories()

  return (
    <footer className="bg-accent text-accent-foreground">
      {/* Trust Badges */}
      <div className="border-b border-accent-foreground/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent-foreground/10 p-3">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-sm opacity-80">On orders over $99</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent-foreground/10 p-3">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Easy Returns</p>
                <p className="text-sm opacity-80">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent-foreground/10 p-3">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Secure Payment</p>
                <p className="text-sm opacity-80">100% protected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent-foreground/10 p-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Flexible Payment</p>
                <p className="text-sm opacity-80">Pay in installments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-Hjpms2ad6drWedZDir5r0K0ruzWghG.png"
              alt="Vida Agrícola"
              width={160}
              height={45}
              className="mb-4 h-12 w-auto brightness-0 invert"
            />
            <p className="mb-6 max-w-sm text-sm opacity-80">
              Your trusted partner in agricultural excellence. We provide premium quality products
              for farmers, livestock owners, and agricultural businesses.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4" />
                <span>support@vidaagricola.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4" />
                <span>123 Farm Road, Agricultural City, AC 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="opacity-80 transition-opacity hover:opacity-100">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="opacity-80 transition-opacity hover:opacity-100">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="opacity-80 transition-opacity hover:opacity-100">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="opacity-80 transition-opacity hover:opacity-100">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/stores" className="opacity-80 transition-opacity hover:opacity-100">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="opacity-80 transition-opacity hover:opacity-100"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Newsletter</h3>
            <p className="mb-4 text-sm opacity-80">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <FooterNewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-accent-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm opacity-80">
              © {new Date().getFullYear()} Vida Agrícola. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="opacity-60 transition-opacity hover:opacity-100">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="opacity-60 transition-opacity hover:opacity-100">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="opacity-60 transition-opacity hover:opacity-100">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="opacity-60 transition-opacity hover:opacity-100">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/privacy" className="opacity-80 hover:opacity-100">
                Privacy Policy
              </Link>
              <Link href="/terms" className="opacity-80 hover:opacity-100">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
