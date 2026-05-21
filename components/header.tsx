"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Menu,
  Phone,
  MapPin,
  Truck,
  LogOut,
  Settings,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MegaMenu } from "./mega-menu"
import { MobileMenu } from "./mobile-menu"
import { AutocompleteDropdown } from "./search/autocomplete-dropdown"
import { LanguageSwitcher } from "./language-switcher"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import type { CategoryTree } from "@/lib/services/category.service"

interface HeaderProps {
  categories?: CategoryTree[]
}

export function Header({ categories = [] }: HeaderProps) {
  const t = useTranslations("header")
  const tNav = useTranslations("navigation")
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const { data: session, isPending } = authClient.useSession()

  const mainNavItems = [
    { labelKey: "home", href: "/" },
    { labelKey: "products", href: "/products", hasMegaMenu: true },
    { labelKey: "brands", href: "/brands" },
    { labelKey: "deals", href: "/deals", highlight: true },
    { labelKey: "blog", href: "/blog" },
    { labelKey: "about", href: "/about" },
    { labelKey: "contact", href: "/contact" },
  ]

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([])
      return
    }
    try {
      const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data.slice(0, 8))
    } catch {
      setSuggestions([])
    }
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchQuery(q)
    setShowDropdown(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(q), 200)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowDropdown(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
    if (e.key === "Escape") setShowDropdown(false)
  }

  function handleSelectSuggestion(suggestion: string) {
    setSearchQuery(suggestion)
    setShowDropdown(false)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const pathname = usePathname()

  const [cartItemCount, setCartItemCount] = useState(0)
  const wishlistCount = 0

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart/count")
      const data = await res.json()
      setCartItemCount(data.count ?? 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchCartCount()
  }, [fetchCartCount, pathname])

  useEffect(() => {
    window.addEventListener("cart-updated", fetchCartCount)
    return () => window.removeEventListener("cart-updated", fetchCartCount)
  }, [fetchCartCount])

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setMegaMenuOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setMegaMenuOpen(false), 150)
  }

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  function getInitials(name?: string | null): string {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      {/* Top Bar */}
      <div className="bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2 text-sm">
            <div className="hidden items-center gap-6 md:flex">
              <a
                href="tel:+18001234567"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{t("phone")}</span>
              </a>
              <Link
                href="/stores"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{t("findStore")}</span>
              </Link>
            </div>
            <div className="flex w-full items-center justify-center gap-2 md:w-auto md:justify-end">
              <Truck className="h-3.5 w-3.5" />
              <span>{t("freeShippingBanner")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-border/50 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{tNav("openMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0">
                <SheetTitle className="sr-only">{tNav("menu")}</SheetTitle>
                <MobileMenu onClose={() => setMobileMenuOpen(false)} categories={categories} />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-GpwpwSRanjgVXt8ByFMWwyHcFTNx7O.png"
                alt="Vida Agrícola"
                width={36}
                height={36}
                style={{ height: 36, width: "auto" }}
                priority
              />
              <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">
                Vida Agrícola
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden flex-1 max-w-xl lg:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  className="h-11 w-full rounded-full border-2 border-muted bg-muted/30 pl-11 pr-4 text-sm transition-all focus:border-primary focus:bg-background"
                />
                {showDropdown && (
                  <AutocompleteDropdown
                    suggestions={suggestions}
                    onSelect={handleSelectSuggestion}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Mobile Search */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-expanded={mobileSearchOpen}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t("searchButton")}</span>
              </Button>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Account */}
              {mounted && !isPending && (
                <>
                  {session ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={session.user.image ?? undefined}
                              alt={session.user.name ?? "User"}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(session.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-medium">{session.user.name}</p>
                          <p className="text-xs text-muted-foreground">{session.user.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t("myAccount")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/orders" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {t("orders")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            {t("settings")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="flex items-center gap-2 text-destructive focus:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("signOut")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link href="/login" className="hidden sm:block">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="h-4 w-4" />
                        {t("signIn")}
                      </Button>
                    </Link>
                  )}
                </>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="relative hidden sm:block">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">{t("wishlist")}</span>
                </Button>
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-secondary p-0 text-[10px] font-semibold text-secondary-foreground">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">{t("cart")}</span>
                </Button>
                {cartItemCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-primary p-0 text-[10px] font-semibold text-primary-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                handleSearchKeyDown(e)
                if (e.key === "Enter") setMobileSearchOpen(false)
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              autoFocus
              className="h-11 w-full rounded-full border-2 border-muted bg-muted/30 pl-11 pr-4 text-sm transition-all focus:border-primary focus:bg-background"
            />
            {showDropdown && (
              <AutocompleteDropdown
                suggestions={suggestions}
                onSelect={(s) => {
                  handleSelectSuggestion(s)
                  setMobileSearchOpen(false)
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="hidden border-b border-border/50 bg-card lg:block">
        <div className="container relative mx-auto px-4" onMouseLeave={handleMouseLeave}>
          <ul className="flex items-center">
            {mainNavItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <li key={item.labelKey} className="group" onMouseEnter={item.hasMegaMenu ? handleMouseEnter : undefined}>
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-5 py-4 text-sm font-medium transition-colors ${
                      item.highlight
                        ? "text-secondary hover:text-secondary/80"
                        : isActive
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {tNav(item.labelKey as Parameters<typeof tNav>[0])}
                    {item.hasMegaMenu && (
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    <span className={`absolute bottom-0 left-5 right-5 h-0.5 origin-left bg-primary transition-transform duration-200 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </Link>
                </li>
              )
            })}
          </ul>

          <AnimatePresence>
            {megaMenuOpen && (
              <div onMouseEnter={handleMouseEnter}>
                <MegaMenu categories={categories} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  )
}
