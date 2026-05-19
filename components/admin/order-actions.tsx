"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { updateOrderStatusAction, issueRefundAction } from "@/lib/actions/admin/orders"
import type { OrderStatus } from "@/lib/generated/prisma/client"

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]

interface OrderActionsProps {
  order: {
    id: string
    status: OrderStatus
    paymentIntentId: string | null
  }
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleStatusChange(status: string) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status as OrderStatus)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  function handleRefund() {
    startTransition(async () => {
      const result = await issueRefundAction(order.id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  const canRefund =
    order.paymentIntentId &&
    order.status !== "refunded" &&
    order.status !== "cancelled" &&
    order.status !== "pending"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Update Status</p>
          <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canRefund && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isPending}>
                Issue Refund
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Issue Refund</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a full refund in Stripe and update the order status to
                  "refunded". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRefund}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Issue Refund
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  )
}
