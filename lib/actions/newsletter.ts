"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"

const emailSchema = z.string().email("Please enter a valid email address")

export async function subscribeAction(email: string) {
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message }
  }

  const normalised = result.data.toLowerCase()

  try {
    const existing = await prisma.newsletterSub.findUnique({ where: { email: normalised } })

    if (existing?.active) {
      return { success: true, message: "You're already subscribed!" }
    }

    await prisma.newsletterSub.upsert({
      where: { email: normalised },
      create: { email: normalised, active: true },
      update: { active: true },
    })

    return { success: true, message: "Thanks for subscribing!" }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." }
  }
}
