"use client"

import { useState, useTransition } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { submitReviewAction } from "@/lib/actions/reviews"

interface ReviewFormProps {
  productId: string
  productSlug: string
}

export function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        Thank you for your review!
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" })
      return
    }
    startTransition(async () => {
      const result = await submitReviewAction({ productId, productSlug, rating, title, body })
      if (result.success) {
        setSubmitted(true)
        toast({ title: "Review submitted!", description: "Your review has been posted." })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
      <h4 className="font-semibold text-foreground">Write a Review</h4>

      {/* Star Rating */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                i < (hovered || rating)
                  ? "fill-secondary text-secondary"
                  : "fill-muted text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating} star${rating !== 1 ? "s" : ""}` : "Select rating"}
        </span>
      </div>

      <Input
        placeholder="Review title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />

      <Textarea
        placeholder="Share your experience with this product..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={4}
      />

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
