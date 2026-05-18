'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Heart, 
  MapPin, 
  Phone, 
  X,
  Home,
  ShoppingBag,
  Tag,
  BookOpen,
  Info,
  Mail,
  Leaf,
  Sprout,
  Bug,
  Droplets,
  Sun,
  Wheat,
  TreeDeciduous,
  Flower2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { categories } from '@/lib/data'

interface MobileMenuProps {
  onClose: () => void
}

const mainNavItems = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Products', href: '/products', icon: ShoppingBag, hasSubmenu: true },
  { label: 'Brands', href: '/brands', icon: Tag },
  { label: 'Deals', href: '/deals', icon: Tag, highlight: true },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Contact', href: '/contact', icon: Mail },
]

const categoryIcons: Record<string, React.ElementType> = {
  'seeds-plants': Sprout,
  'fertilizers': Leaf,
  'pest-control': Bug,
  'irrigation': Droplets,
  'tools-equipment': Sun,
  'animal-feed': Wheat,
  'organic': TreeDeciduous,
  'greenhouse': Flower2,
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [openSections, setOpenSections] = useState<string[]>(['products'])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo2-Hjpms2ad6drWedZDir5r0K0ruzWghG.png"
          alt="Vida Agrícola"
          width={140}
          height={40}
          className="h-10 w-auto"
        />
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Link
          href="/account"
          onClick={onClose}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <User className="h-4 w-4" />
          Sign In
        </Link>
        <Link
          href="/wishlist"
          onClick={onClose}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Heart className="h-4 w-4" />
          Wishlist
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Main Navigation */}
          <nav className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon

              if (item.hasSubmenu) {
                return (
                  <Collapsible
                    key={item.label}
                    open={openSections.includes('products')}
                    onOpenChange={() => toggleSection('products')}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-primary" />
                        {item.label}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          openSections.includes('products') ? 'rotate-180' : ''
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-1">
                      <div className="ml-3 space-y-1 border-l-2 border-border pl-4">
                        {/* View All Products */}
                        <Link
                          href="/products"
                          onClick={onClose}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary"
                        >
                          View All Products
                        </Link>

                        {/* Categories with subcategories */}
                        {categories.map((category) => {
                          const CategoryIcon = categoryIcons[category.slug] || Leaf
                          return (
                            <Collapsible
                              key={category.id}
                              open={expandedCategories.includes(category.id)}
                              onOpenChange={() => toggleCategory(category.id)}
                            >
                              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted">
                                <div className="flex items-center gap-2">
                                  <CategoryIcon className="h-3.5 w-3.5 text-primary/70" />
                                  {category.name}
                                </div>
                                <ChevronDown
                                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                                    expandedCategories.includes(category.id) ? 'rotate-180' : ''
                                  }`}
                                />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-3 space-y-0.5 border-l border-border/50 pl-3 py-1">
                                  {category.subcategories.map((sub) => (
                                    <Link
                                      key={sub.id}
                                      href={`/category/${category.slug}/${sub.slug}`}
                                      onClick={onClose}
                                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                      <ChevronRight className="h-3 w-3" />
                                      {sub.name}
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/category/${category.slug}`}
                                    onClick={onClose}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary"
                                  >
                                    View All {category.name}
                                  </Link>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted ${
                    item.highlight ? 'text-secondary' : 'text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${item.highlight ? 'text-secondary' : 'text-primary'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Promo Banner */}
          <div className="mt-6 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4">
            <p className="font-semibold text-primary-foreground">15% off your first order!</p>
            <p className="text-sm text-primary-foreground/80">Use code: WELCOME15</p>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="space-y-3 text-sm text-muted-foreground">
          <a href="tel:+18001234567" className="flex items-center gap-3 transition-colors hover:text-foreground">
            <Phone className="h-4 w-4" />
            <span>+1 (800) 123-4567</span>
          </a>
          <Link href="/stores" onClick={onClose} className="flex items-center gap-3 transition-colors hover:text-foreground">
            <MapPin className="h-4 w-4" />
            <span>Find a Store</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
