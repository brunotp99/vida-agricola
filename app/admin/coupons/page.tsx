import { prisma } from "@/lib/prisma"
import { CouponsClient } from "@/components/admin/coupons-client"

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  })

  const serialized = coupons.map((c) => ({
    ...c,
    value: Number(c.value),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">{coupons.length} coupons total</p>
      </div>
      <CouponsClient coupons={serialized} />
    </div>
  )
}
