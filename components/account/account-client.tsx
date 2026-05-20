"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Bell,
  Clock,
  ChevronRight,
  Home,
  LogOut,
  Edit,
  Plus,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import { authClient } from "@/lib/auth-client"
import { formatPrice } from "@/lib/utils"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"

type OrderItem = {
  name: string
  imageUrl: string | null
  quantity: number
}

type Order = {
  id: string
  orderNumber: string
  status: string
  total: unknown
  createdAt: Date
  items: OrderItem[]
  _count: { items: number }
}

const addresses = [
  {
    id: "1",
    nameKey: "home" as const,
    address: "123 Farm Road, Agricultural City, AC 12345",
    default: true,
  },
  {
    id: "2",
    nameKey: "farm" as const,
    address: "456 Country Lane, Rural Town, RT 67890",
    default: false,
  },
]

interface AccountClientProps {
  userName: string
  userEmail: string
  userImage: string | null
  orders: Order[]
  orderTotal: number
}

export function AccountClient({
  userName,
  userEmail,
  userImage,
  orders,
  orderTotal,
}: AccountClientProps) {
  const t = useTranslations("account")
  const tCommon = useTranslations("common")
  const tHeader = useTranslations("header")
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")

  const sidebarItems = [
    { id: "dashboard", label: t("dashboard"), icon: User },
    { id: "orders", label: t("orders"), icon: Package },
    { id: "wishlist", label: t("wishlist"), icon: Heart },
    { id: "addresses", label: t("addresses"), icon: MapPin },
    { id: "settings", label: t("settings"), icon: Settings },
    { id: "notifications", label: t("notifications"), icon: Bell },
  ]

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing",
  ).length

  function formatOrderTotal(total: unknown) {
    if (typeof total === "number") return formatPrice(total)
    if (typeof total === "string") return formatPrice(parseFloat(total))
    if (total != null && typeof (total as { toNumber?: unknown }).toNumber === "function") {
      return formatPrice((total as { toNumber(): number }).toNumber())
    }
    return formatPrice(Number(total))
  }

  function formatOrderDate(date: Date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/30">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                {tCommon("home")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{tHeader("myAccount")}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="border-border">
                <CardContent className="p-6">
                  {/* Profile Summary */}
                  <div className="mb-6 flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userImage ?? undefined} alt={userName} />
                      <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">{userName}</h2>
                      <p className="text-sm text-muted-foreground">{userEmail}</p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Navigation */}
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          activeTab === item.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <Separator className="my-4" />

                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {tHeader("signOut")}
                  </button>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Dashboard */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, {userName.split(" ")[0]}!
                  </h1>

                  {/* Stats Cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-primary/10 p-3">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{orderTotal}</p>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-secondary/10 p-3">
                            <Heart className="h-6 w-6 text-secondary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">—</p>
                            <p className="text-sm text-muted-foreground">Wishlist Items</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="rounded-full bg-accent/10 p-3">
                            <Clock className="h-6 w-6 text-accent" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
                            <p className="text-sm text-muted-foreground">Pending Orders</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders */}
                  <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Orders</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                        {tCommon("viewAll")}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.slice(0, 2).map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between rounded-lg border border-border p-4"
                            >
                              <div>
                                <p className="font-medium text-foreground">{order.orderNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatOrderDate(order.createdAt)}
                                </p>
                              </div>
                              <Badge
                                variant={order.status === "delivered" ? "default" : "secondary"}
                                className={
                                  order.status === "delivered"
                                    ? "bg-primary text-primary-foreground"
                                    : ""
                                }
                              >
                                {order.status}
                              </Badge>
                              <p className="font-semibold text-foreground">
                                {formatOrderTotal(order.total)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{t("noOrders")}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">{t("orders")}</h1>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="border-border">
                          <CardContent className="p-6">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="font-semibold text-foreground">{order.orderNumber}</p>
                                <p className="text-sm text-muted-foreground">
                                  Placed on {formatOrderDate(order.createdAt)}
                                </p>
                              </div>
                              <Badge
                                className={
                                  order.status === "delivered"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-secondary-foreground"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                  {item.imageUrl && (
                                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                                      <Image
                                        src={item.imageUrl}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              {order._count.items > order.items.length && (
                                <p className="text-sm text-muted-foreground">
                                  +{order._count.items - order.items.length} more items
                                </p>
                              )}
                            </div>
                            <Separator className="my-4" />
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-foreground">
                                Total: {formatOrderTotal(order.total)}
                              </p>
                              <div className="flex gap-2">
                                <Link href={`/account/orders/${order.id}`}>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    {t("viewOrder")}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("noOrders")}</p>
                  )}
                </div>
              )}

              {/* Wishlist */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">{t("wishlist")}</h1>
                  <p className="text-muted-foreground">
                    <Link href="/wishlist" className="text-primary hover:underline">
                      View your full wishlist
                    </Link>
                  </p>
                </div>
              )}

              {/* Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">{t("addresses")}</h1>
                    <Button className="gap-2 bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <Card
                        key={address.id}
                        className={`border-border ${address.default ? "ring-2 ring-primary" : ""}`}
                      >
                        <CardContent className="p-6">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{t(address.nameKey)}</h3>
                            {address.default && (
                              <Badge className="bg-primary text-primary-foreground">Default</Badge>
                            )}
                          </div>
                          <p className="mb-4 text-sm text-muted-foreground">{address.address}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-3 w-3" />
                              {tCommon("edit")}
                            </Button>
                            {!address.default && (
                              <Button variant="outline" size="sm">
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
                  <ProfileForm name={userName} email={userEmail} />
                  <PasswordForm />
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">{t("notifications")}</h1>
                  <Card className="border-border">
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Order Updates</p>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about your orders
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Promotional Emails</p>
                            <p className="text-sm text-muted-foreground">
                              Receive deals and promotional offers
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Price Drop Alerts</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified when wishlist items go on sale
                            </p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">Newsletter</p>
                            <p className="text-sm text-muted-foreground">
                              Weekly farming tips and product updates
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
