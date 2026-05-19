import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, MapPin, Phone, Clock } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "Store Locator | Vida Agrícola" }

const stores = [
  {
    id: 1,
    name: "Vida Agrícola — Main Branch",
    address: "123 Farm Road, Agricultural City, AC 12345",
    phone: "+1 (800) 123-4567",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM",
  },
  {
    id: 2,
    name: "Vida Agrícola — North Branch",
    address: "456 Harvest Lane, Greenfield, GF 67890",
    phone: "+1 (800) 123-4568",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 4:00 PM",
  },
  {
    id: 3,
    name: "Vida Agrícola — South Branch",
    address: "789 Crop Circle Drive, Fieldton, FT 11223",
    phone: "+1 (800) 123-4569",
    hours: "Mon–Fri 8:00 AM – 6:00 PM · Sat 9:00 AM – 2:00 PM",
  },
]

export default function StoresPage() {
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
              <span className="font-medium text-foreground">Store Locator</span>
            </nav>
          </div>
        </div>

        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">Find a Store</h1>
                <p className="text-muted-foreground">Visit one of our locations near you</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <h2 className="mb-4 text-lg font-semibold text-foreground">{store.name}</h2>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-primary" />
                      <a href={`tel:${store.phone.replace(/\D/g, "")}`} className="hover:text-foreground">
                        {store.phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
