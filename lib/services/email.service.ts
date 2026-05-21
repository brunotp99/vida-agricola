import { Resend } from "resend"

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.EMAIL_FROM ?? "noreply@vidaagricola.pt"

async function sendOrderConfirmation(order: {
  orderNumber: string
  total: unknown
  user?: { name?: string | null; email: string }
}) {
  const resend = getResend()
  if (!resend || !order.user?.email) return
  await resend.emails.send({
    from: FROM,
    to: order.user.email,
    subject: `Order Confirmed: ${order.orderNumber}`,
    html: `<p>Hi ${order.user.name ?? "there"},</p><p>Your order <strong>${order.orderNumber}</strong> has been confirmed. Total: €${order.total}</p>`,
  })
}

async function sendOrderShipped(
  order: {
    orderNumber: string
    user?: { name?: string | null; email: string }
  },
  trackingNumber: string,
) {
  const resend = getResend()
  if (!resend || !order.user?.email) return
  await resend.emails.send({
    from: FROM,
    to: order.user.email,
    subject: `Your order ${order.orderNumber} has shipped!`,
    html: `<p>Hi ${order.user.name ?? "there"},</p><p>Your order <strong>${order.orderNumber}</strong> is on its way. Tracking: ${trackingNumber}</p>`,
  })
}

async function sendPasswordReset(email: string, token: string) {
  const resend = getResend()
  if (!resend) return
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  const resetUrl = `${baseUrl}/reset-password?token=${token}`
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
  })
}

async function sendWelcome(user: { name?: string | null; email: string }) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: "Welcome to Vida Agrícola!",
    html: `<p>Hi ${user.name ?? "there"},</p><p>Welcome to Vida Agrícola! We're glad you're here.</p>`,
  })
}

export const EmailService = {
  sendOrderConfirmation,
  sendOrderShipped,
  sendPasswordReset,
  sendWelcome,
}
