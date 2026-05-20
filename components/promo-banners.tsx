"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeAction } from "@/lib/actions/newsletter"

const promoCards = [
  {
    id: 1,
    title: "Spring Sale",
    subtitle: "Up to 30% off on seeds & fertilizers",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
    href: "/category/agriculture",
    color: "bg-primary",
  },
  {
    id: 2,
    title: "New Incubators",
    subtitle: "Latest technology for better hatch rates",
    image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600",
    href: "/category/farm-equipment/incubators",
    color: "bg-accent",
  },
  {
    id: 3,
    title: "Safety First",
    subtitle: "Professional farm boots & gear",
    image: "https://images.unsplash.com/photo-1586771106241-f2f2b7ec7ccd?w=600",
    href: "/category/clothing-safety",
    color: "bg-secondary",
  },
]

export function PromoBanner() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-6 md:grid-cols-3">
          {promoCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.href} className="group block">
                <div className="relative h-64 overflow-hidden rounded-xl">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="mb-1 text-2xl font-bold text-white">{card.title}</h3>
                    <p className="mb-4 text-white/80">{card.subtitle}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                      Shop Now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NewsletterBanner() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await subscribeAction(email)
      if (result.success) {
        setMessage(result.message ?? "Subscribed!")
        setIsError(false)
        setEmail("")
      } else {
        setMessage(result.error ?? "Something went wrong.")
        setIsError(true)
      }
    })
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12">
          <div className="relative z-10 mx-auto max-w-2xl text-center text-white">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Newsletter</h2>
            <p className="mb-8 text-lg text-white/80">
              Subscribe to receive exclusive deals, farming tips, and the latest product updates
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 rounded-lg bg-white/20 px-6 text-white placeholder:text-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button
                type="submit"
                disabled={isPending}
                className="h-12 bg-white px-8 text-primary hover:bg-white/90"
              >
                {isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            {message && (
              <p className={`mt-4 text-sm ${isError ? "text-red-300" : "text-white/90"}`}>
                {message}
              </p>
            )}
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10" />
        </div>
      </div>
    </section>
  )
}
