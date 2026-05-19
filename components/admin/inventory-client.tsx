"use client"

import Image from "next/image"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { adjustStockAction } from "@/lib/actions/admin/inventory"
import { cn } from "@/lib/utils"

type InventoryLog = {
  id: string
  delta: number
  reason: string
  createdAt: Date
}

type Variant = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  productId: string
  product: {
    id: string
    name: string
    images: { url: string; alt: string | null }[]
  }
  recentLogs: InventoryLog[]
}

interface AdjustDialogProps {
  variant: Variant
}

const FormSchema = z.object({
  newStockCount: z.coerce.number().int().min(0),
  reason: z.string().min(1, "Reason required"),
})

function AdjustStockDialog({ variant }: AdjustDialogProps) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { newStockCount: variant.stock, reason: "" },
  })

  function onSubmit(data: { newStockCount: number; reason: string }) {
    startTransition(async () => {
      const result = await adjustStockAction({
        variantId: variant.id,
        productId: variant.productId,
        newStockCount: data.newStockCount,
        reason: data.reason,
      })
      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Adjust</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock — {variant.name}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-500 mb-4">
          Product: {variant.product.name} · SKU: {variant.sku} · Current: {variant.stock}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>New Stock Count</Label>
            <Input type="number" {...register("newStockCount")} />
            {errors.newStockCount && (
              <p className="text-xs text-red-500">{errors.newStockCount.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Reason</Label>
            <Input {...register("reason")} placeholder="e.g. Received new shipment" />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
          </div>

          {variant.recentLogs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Recent Movements</p>
              <div className="space-y-1">
                {variant.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs text-gray-500">
                    <span>{log.reason}</span>
                    <span className={log.delta > 0 ? "text-green-600" : "text-red-600"}>
                      {log.delta > 0 ? "+" : ""}{log.delta}
                    </span>
                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Update Stock</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface InventoryClientProps {
  variants: Variant[]
  total: number
  page: number
  pageSize: number
}

export function InventoryClient({ variants, total, page, pageSize }: InventoryClientProps) {
  const columns = [
    {
      key: "product",
      label: "Product",
      render: (v: Variant) => (
        <div className="flex items-center gap-3">
          {v.product.images[0] ? (
            <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <Image src={v.product.images[0].url} alt={v.product.images[0].alt ?? v.product.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm">{v.product.name}</p>
            <p className="text-xs text-gray-500">{v.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      render: (v: Variant) => <span className="font-mono text-xs">{v.sku}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (v: Variant) => (
        <span
          className={cn(
            "font-semibold text-sm",
            v.stock === 0
              ? "text-red-600"
              : v.stock <= 5
              ? "text-orange-500"
              : "text-gray-700",
          )}
        >
          {v.stock}
          {v.stock <= 5 && (
            <Badge variant="destructive" className="ml-2 text-xs">Low</Badge>
          )}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (v: Variant) => <span className="text-sm">€{v.price.toFixed(2)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (v: Variant) => <AdjustStockDialog variant={v} />,
    },
  ]

  return (
    <DataTable
      data={variants}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      searchPlaceholder="Search by product name or SKU..."
    />
  )
}
