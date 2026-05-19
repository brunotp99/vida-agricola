"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={session.user.name ?? session.user.email}
        userEmail={session.user.email}
        userImage={session.user.image ?? null}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
