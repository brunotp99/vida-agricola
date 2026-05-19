"use client"

import { useState, useTransition } from "react"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponActiveAction,
} from "@/lib/actions/admin/coupons"
import { Plus, Edit, Trash2 } from "lucide-react"

const FormSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(),
  minOrderAmount: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
})

type FormValues = z.infer<typeof FormSchema>

type Coupon = {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  active: boolean
  createdAt: Date
}

interface CouponFormDialogProps {
  coupon?: Coupon
  trigger: React.ReactNode
  title: string
}

function CouponFormDialog({ coupon, trigger, title }: CouponFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      type: coupon?.type ?? "fixed",
      value: coupon?.value ?? 0,
      minOrderAmount: coupon?.minOrderAmount ?? null,
      maxUses: coupon?.maxUses ?? null,
      expiresAt: coupon?.expiresAt ? coupon.expiresAt.toISOString().split("T")[0] : "",
      active: coupon?.active ?? true,
    },
  })

  const active = watch("active")

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = coupon
        ? await updateCouponAction(coupon.id, data)
        : await createCouponAction(data)
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Code *</Label>
              <Input {...register("code")} placeholder="SUMMER25" className="uppercase" />
              {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                defaultValue={coupon?.type ?? "fixed"}
                onValueChange={(v) => setValue("type", v as "percentage" | "fixed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed (€)</SelectItem>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Value *</Label>
              <Input type="number" step="0.01" {...register("value")} />
              {errors.value && <p className="text-xs text-red-500">{errors.value.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Min Order (€)</Label>
              <Input type="number" step="0.01" {...register("minOrderAmount")} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Max Uses</Label>
              <Input type="number" {...register("maxUses")} placeholder="Unlimited" />
            </div>
            <div className="space-y-1">
              <Label>Expires At</Label>
              <Input type="date" {...register("expiresAt")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={active}
              onCheckedChange={(v) => setValue("active", v)}
            />
            <Label className="font-normal">Active</Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{coupon ? "Save Changes" : "Create Coupon"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteCouponButton({ id, code }: { id: string; code: string }) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete coupon "{code}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the coupon. Existing usages will remain in the records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(async () => {
              await deleteCouponAction(id)
              router.refresh()
            })}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ActiveToggle({ coupon }: { coupon: Coupon }) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Switch
      checked={coupon.active}
      onCheckedChange={() => startTransition(async () => {
        await toggleCouponActiveAction(coupon.id)
        router.refresh()
      })}
    />
  )
}

interface CouponsClientProps {
  coupons: Coupon[]
}

export function CouponsClient({ coupons }: CouponsClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CouponFormDialog
          title="Create Coupon"
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Button>
          }
        />
      </div>

      <div className="rounded-md border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Code</th>
              <th className="text-left p-4 font-medium text-gray-600">Type</th>
              <th className="text-left p-4 font-medium text-gray-600">Value</th>
              <th className="text-left p-4 font-medium text-gray-600">Min Order</th>
              <th className="text-left p-4 font-medium text-gray-600">Uses</th>
              <th className="text-left p-4 font-medium text-gray-600">Expires</th>
              <th className="text-left p-4 font-medium text-gray-600">Active</th>
              <th className="text-right p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-medium">{coupon.code}</td>
                <td className="p-4">
                  <Badge variant="outline" className="capitalize">{coupon.type}</Badge>
                </td>
                <td className="p-4">
                  {coupon.type === "percentage"
                    ? `${coupon.value}%`
                    : formatPrice(coupon.value)}
                </td>
                <td className="p-4 text-gray-500">
                  {coupon.minOrderAmount ? formatPrice(coupon.minOrderAmount) : "—"}
                </td>
                <td className="p-4 text-gray-500">
                  {coupon.usedCount}
                  {coupon.maxUses ? `/${coupon.maxUses}` : ""}
                </td>
                <td className="p-4 text-gray-500">
                  {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-GB") : "Never"}
                </td>
                <td className="p-4">
                  <ActiveToggle coupon={coupon} />
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <CouponFormDialog
                      coupon={coupon}
                      title={`Edit: ${coupon.code}`}
                      trigger={
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteCouponButton id={coupon.id} code={coupon.code} />
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No coupons yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
