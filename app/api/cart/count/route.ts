import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user.id ?? null

    let identity: { userId?: string | null; sessionId?: string | null }
    if (userId) {
      identity = { userId }
    } else {
      const cookieStore = await cookies()
      const sessionId = cookieStore.get("guest-session-id")?.value ?? null
      identity = { sessionId }
    }

    if (!identity.userId && !identity.sessionId) {
      return NextResponse.json({ count: 0 })
    }

    const count = await CartService.getItemCount(identity)
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
