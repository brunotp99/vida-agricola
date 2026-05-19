import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, Briefcase, Mail } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"

export const metadata = { title: "Careers | Vida Agrícola" }

const openings = [
  {
    id: 1,
    title: "Agricultural Sales Representative",
    department: "Sales",
    location: "Agricultural City, AC",
    type: "Full-time",
    description:
      "Join our sales team to help farmers find the right products for their needs. Experience in agriculture preferred.",
  },
  {
    id: 2,
    title: "Warehouse Associate",
    department: "Operations",
    location: "Greenfield, GF",
    type: "Full-time",
    description:
      "Pick, pack, and ship orders in our modern fulfilment centre. Physical fitness and attention to detail required.",
  },
  {
    id: 3,
    title: "Customer Support Specialist",
    department: "Customer Service",
    location: "Remote",
    type: "Full-time",
    description:
      "Provide excellent support to our customers via email and phone. Background in agriculture a plus.",
  },
]

export default function CareersPage() {
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
              <span className="font-medium text-foreground">Careers</span>
            </nav>
          </div>
        </div>

        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">Work With Us</h1>
                <p className="text-muted-foreground">
                  Join our team and help shape the future of agriculture
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-12">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">Open Positions</h2>
            <div className="space-y-4">
              {openings.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                      {job.type}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {job.department} · {job.location}
                  </p>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl border border-border bg-muted/30 p-8 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Don't see your role?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Send us your CV and we'll keep it on file for future opportunities.
              </p>
              <a
                href="mailto:careers@vidaagricola.com"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Mail className="h-4 w-4" />
                careers@vidaagricola.com
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
