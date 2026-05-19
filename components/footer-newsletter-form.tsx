"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeAction } from "@/lib/actions/newsletter"

export function FooterNewsletterForm() {
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        className="border-accent-foreground/20 bg-accent-foreground/10 text-accent-foreground placeholder:text-accent-foreground/50"
      />
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
      >
        {isPending ? "Subscribing..." : "Subscribe"}
      </Button>
      {message && <p className={`text-sm ${isError ? "text-red-300" : "opacity-80"}`}>{message}</p>}
    </form>
  )
}
