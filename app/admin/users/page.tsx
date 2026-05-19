import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/admin/users-table"

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const [{ page: pageParam = "1", search = "" }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ])

  const page = Math.max(1, parseInt(pageParam, 10))
  const pageSize = 20
  const skip = (page - 1) * pageSize

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{total} users total</p>
      </div>

      <UsersTable
        users={users}
        total={total}
        page={page}
        pageSize={pageSize}
        currentUserId={session?.user.id ?? ""}
      />
    </div>
  )
}
