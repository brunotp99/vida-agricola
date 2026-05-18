"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { products, formatPrice } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { authClient } from "@/lib/auth-client"
import { updateProfileAction, changePasswordAction } from "@/lib/actions/users"
import { z } from "zod"

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})
const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-03-15",
    status: "Delivered",
    total: 156.97,
    items: [products[0], products[3]],
  },
  {
    id: "ORD-2024-002",
    date: "2024-03-10",
    status: "In Transit",
    total: 89.99,
    items: [products[8]],
  },
  {
    id: "ORD-2024-003",
    date: "2024-02-28",
    status: "Delivered",
    total: 234.5,
    items: [products[4], products[6], products[10]],
  },
]

const addresses = [
  {
    id: "1",
    name: "Home",
    address: "123 Farm Road, Agricultural City, AC 12345",
    default: true,
  },
  {
    id: "2",
    name: "Farm",
    address: "456 Country Lane, Rural Town, RT 67890",
    default: false,
  },
]

const wishlistProducts = products.slice(2, 6)
const recentlyViewed = products.slice(6, 10)

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: User },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
]

export default function AccountPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [activeTab, setActiveTab] = useState("dashboard")

  const profileForm = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    values: { name: session?.user?.name ?? "" },
  })

  const passwordForm = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  async function handleUpdateProfile(data: z.infer<typeof UpdateProfileSchema>) {
    const result = await updateProfileAction(data)
    if (result.success) {
      toast.success("Profile updated")
    } else {
      toast.error(result.error || "Failed to update profile")
    }
  }

  async function handleChangePassword(data: z.infer<typeof ChangePasswordSchema>) {
    const result = await changePasswordAction({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    if (result.success) {
      toast.success("Password changed")
      passwordForm.reset()
    } else {
      toast.error(result.error || "Failed to change password")
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
  }

  function getInitials(name?: string | null) {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const currentUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? null,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">My Account</span>
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
                      <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name} />
                      <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">{currentUser.name}</h2>
                      <p className="text-sm text-muted-foreground">{currentUser.email}</p>
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
                    Sign Out
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
                    Welcome back, {currentUser.name.split(" ")[0]}!
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
                            <p className="text-2xl font-bold text-foreground">12</p>
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
                            <p className="text-2xl font-bold text-foreground">
                              {wishlistProducts.length}
                            </p>
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
                            <p className="text-2xl font-bold text-foreground">2</p>
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
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {orders.slice(0, 2).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-lg border border-border p-4"
                          >
                            <div>
                              <p className="font-medium text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.date}</p>
                            </div>
                            <Badge
                              variant={order.status === "Delivered" ? "default" : "secondary"}
                              className={
                                order.status === "Delivered"
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              }
                            >
                              {order.status}
                            </Badge>
                            <p className="font-semibold text-foreground">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recently Viewed */}
                  <div>
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Recently Viewed</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {recentlyViewed.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Orders */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border-border">
                        <CardContent className="p-6">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Placed on {order.date}
                              </p>
                            </div>
                            <Badge
                              className={
                                order.status === "Delivered"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4">
                                <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                                  <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                                </div>
                                <p className="font-medium text-foreground">
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Separator className="my-4" />
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-foreground">
                              Total: {formatPrice(order.total)}
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Button>
                              {order.status === "Delivered" && (
                                <Button variant="outline" size="sm">
                                  Reorder
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlistProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses */}
              {activeTab === "addresses" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
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
                            <h3 className="font-semibold text-foreground">{address.name}</h3>
                            {address.default && (
                              <Badge className="bg-primary text-primary-foreground">Default</Badge>
                            )}
                          </div>
                          <p className="mb-4 text-sm text-muted-foreground">{address.address}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit className="h-3 w-3" />
                              Edit
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
                  <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your account details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
                        className="space-y-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" {...profileForm.register("name")} />
                            {profileForm.formState.errors.name && (
                              <p className="text-xs text-destructive">
                                {profileForm.formState.errors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={currentUser.email}
                              disabled
                              className="opacity-60"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground"
                          disabled={profileForm.formState.isSubmitting}
                        >
                          {profileForm.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save Changes
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Password</CardTitle>
                      <CardDescription>Change your password</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="current">Current Password</Label>
                          <Input
                            id="current"
                            type="password"
                            {...passwordForm.register("currentPassword")}
                          />
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-xs text-destructive">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input
                              id="new"
                              type="password"
                              {...passwordForm.register("newPassword")}
                            />
                            {passwordForm.formState.errors.newPassword && (
                              <p className="text-xs text-destructive">
                                {passwordForm.formState.errors.newPassword.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm Password</Label>
                            <Input
                              id="confirm"
                              type="password"
                              {...passwordForm.register("confirmPassword")}
                            />
                            {passwordForm.formState.errors.confirmPassword && (
                              <p className="text-xs text-destructive">
                                {passwordForm.formState.errors.confirmPassword.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="bg-primary text-primary-foreground"
                          disabled={passwordForm.formState.isSubmitting}
                        >
                          {passwordForm.formState.isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Password
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
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
      <Footer />
    </div>
  )
}
