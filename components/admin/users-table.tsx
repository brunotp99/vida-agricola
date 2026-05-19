"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUserRoleAction, toggleUserBanAction } from "@/lib/actions/admin/users"
import type { Role } from "@/lib/generated/prisma/client"

type User = {
  id: string
  name: string | null
  email: string
  role: Role
  banned: boolean
  createdAt: Date
  _count: { orders: number }
}

interface UsersTableProps {
  users: User[]
  total: number
  page: number
  pageSize: number
  currentUserId: string
}

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  staff: "secondary",
  customer: "outline",
}

function RoleDropdown({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [, startTransition] = useTransition()
  const router = useRouter()
  const isSelf = user.id === currentUserId

  function handleRoleChange(role: string) {
    startTransition(async () => {
      const result = await updateUserRoleAction(user.id, role as Role)
      if (result.success) router.refresh()
      else alert(result.error)
    })
  }

  if (isSelf) {
    return (
      <Badge variant={roleVariant[user.role] ?? "outline"} className="capitalize">
        {user.role}
      </Badge>
    )
  }

  return (
    <Select defaultValue={user.role} onValueChange={handleRoleChange}>
      <SelectTrigger className="h-7 text-xs w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="customer">Customer</SelectItem>
        <SelectItem value="staff">Staff</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

function BanButton({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [, startTransition] = useTransition()
  const router = useRouter()
  const isSelf = user.id === currentUserId

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleUserBanAction(user.id)
      if (result.success) router.refresh()
      else alert(result.error)
    })
  }

  if (isSelf) return null

  return (
    <Button
      variant={user.banned ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className={user.banned ? "text-xs" : "text-xs text-red-600 border-red-200 hover:bg-red-50"}
    >
      {user.banned ? "Unban" : "Ban"}
    </Button>
  )
}

export function UsersTable({ users, total, page, pageSize, currentUserId }: UsersTableProps) {
  const columns = [
    {
      key: "name",
      label: "User",
      render: (u: User) => (
        <div>
          <p className="font-medium text-gray-900">{u.name ?? "—"}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u: User) => <RoleDropdown user={u} currentUserId={currentUserId} />,
    },
    {
      key: "orders",
      label: "Orders",
      render: (u: User) => (
        <span className="text-sm text-gray-700">{u._count.orders}</span>
      ),
    },
    {
      key: "banned",
      label: "Status",
      render: (u: User) =>
        u.banned ? (
          <Badge variant="destructive" className="text-xs">Banned</Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-green-600 border-green-200">Active</Badge>
        ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u: User) => (
        <span className="text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-GB")}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (u: User) => <BanButton user={u} currentUserId={currentUserId} />,
    },
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      searchPlaceholder="Search by name or email..."
    />
  )
}
