"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderService } from "@/lib/services/order.service"
import { EmailService } from "@/lib/services/email.service"
import { getStripe } from "@/lib/stripe"
import type { OrderStatus } from "@/lib/generated/prisma/client"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return session
}

// Valid state machine transitions
const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (!order) return { success: false as const, error: "Order not found" }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? []
    if (!allowed.includes(status)) {
      return {
        success: false as const,
        error: `Cannot transition from ${order.status} to ${status}`,
      }
    }

    await OrderService.updateStatus(orderId, status)

    if (status === "shipped") {
      await EmailService.sendOrderShipped(
        { orderNumber: order.orderNumber, user: order.user ?? undefined },
        "TRACK-000",
      )
    }

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to update order" }
  }
}

export async function issueRefundAction(orderId: string) {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return { success: false as const, error: "Order not found" }
    if (!order.paymentIntentId) return { success: false as const, error: "No payment intent on this order" }
    if (order.status === "refunded") return { success: false as const, error: "Order is already refunded" }

    const stripe = getStripe()
    await stripe.refunds.create({ payment_intent: order.paymentIntentId })

    await OrderService.updateStatus(orderId, "refunded")

    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true as const }
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : "Failed to issue refund" }
  }
}
