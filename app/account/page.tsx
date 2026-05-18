import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { OrderService } from "@/lib/services/order.service"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { AccountClient } from "@/components/account/account-client"

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login?redirect=/account")

  const { orders, total } = await OrderService.findByUser(session.user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <AccountClient
        userName={session.user.name ?? "User"}
        userEmail={session.user.email ?? ""}
        userImage={session.user.image ?? null}
        orders={orders}
        orderTotal={total}
      />
      <Footer />
    </div>
  )
}
