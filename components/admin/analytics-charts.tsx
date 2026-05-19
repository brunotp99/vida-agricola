"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

const COLORS = ["#16a34a", "#4ade80", "#86efac", "#bbf7d0", "#f0fdf4", "#166534", "#15803d", "#22c55e"]

interface TopProduct {
  name: string
  unitsSold: number
  revenue: number
}

interface CategoryData {
  name: string
  revenue: number
}

interface FunnelStage {
  stage: string
  count: number
}

interface AnalyticsChartsProps {
  topProducts: TopProduct[]
  categoryData: CategoryData[]
  funnelData: FunnelStage[]
}

export function AnalyticsCharts({ topProducts, categoryData, funnelData }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No sales data available</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left pb-2 font-medium">Product</th>
                  <th className="text-right pb-2 font-medium">Units</th>
                  <th className="text-right pb-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2 text-gray-700 max-w-[180px] truncate">{p.name}</td>
                    <td className="py-2 text-right text-gray-500">{p.unitsSold}</td>
                    <td className="py-2 text-right font-medium">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Category Revenue Pie */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatPrice(value)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {funnelData.every((f) => f.count === 0) ? (
            <p className="text-sm text-gray-400 py-4">No analytics events recorded yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 12 }}
                  width={130}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
