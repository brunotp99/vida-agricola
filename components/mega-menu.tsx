'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf, Sprout, Bug, Droplets, Sun, Wheat, TreeDeciduous, Flower2 } from 'lucide-react'
import { categories, brands, products } from '@/lib/data'

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

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || '')
  const currentCategory = categories.find((cat) => cat.id === activeCategory)
  const featuredProducts = products.filter((p) => p.featured).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute left-0 top-full z-50 w-[min(1000px,calc(100vw-2rem))] pt-2"
    >
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl shadow-black/10">
        <div className="grid grid-cols-7 lg:grid-cols-12">
          {/* Categories Sidebar */}
          <div className="col-span-3 border-r border-border/50 bg-muted/30 py-4">
            <div className="px-4 pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
            </div>
            <nav className="space-y-0.5 px-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category.slug] || Leaf
                return (
                  <button
                    key={category.id}
                    onMouseEnter={() => setActiveCategory(category.id)}
                    onClick={() => setActiveCategory(category.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                      activeCategory === category.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${
                      activeCategory === category.id ? 'text-primary-foreground' : 'text-primary'
                    }`} />
                    <span className="flex-1 font-medium">{category.name}</span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform ${
                      activeCategory === category.id 
                        ? 'translate-x-0 opacity-100' 
                        : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'
                    }`} />
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Subcategories */}
          <div className="col-span-4 p-6">
            {currentCategory && (
              <motion.div
                key={currentCategory.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    {currentCategory.name}
                  </h3>
                  <Link
                    href={`/category/${currentCategory.slug}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {currentCategory.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${currentCategory.slug}/${sub.slug}`}
                      className="group flex items-center gap-2 rounded-md py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-current opacity-50 transition-all group-hover:h-1.5 group-hover:w-1.5 group-hover:opacity-100" />
                      {sub.name}
                    </Link>
                  ))}
                </div>

                {/* Category Image */}
                <div className="mt-6 overflow-hidden rounded-lg">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={currentCategory.image}
                      alt={currentCategory.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-medium text-white/90">
                        {currentCategory.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Featured & Brands - Hidden on smaller screens */}
          <div className="col-span-5 hidden border-l border-border/50 bg-muted/20 p-6 lg:block">
            {/* Featured Products */}
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured Products
                </h3>
                <Link href="/products?featured=true" className="text-xs font-medium text-primary hover:underline">
                  See All
                </Link>
              </div>
              <div className="space-y-3">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group flex items-center gap-3 rounded-lg bg-background p-2 transition-all hover:shadow-md"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          ${product.salePrice?.toFixed(2) || product.price.toFixed(2)}
                        </span>
                        {product.salePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Brands */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Popular Brands
                </h3>
                <Link href="/brands" className="text-xs font-medium text-primary hover:underline">
                  All Brands
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {brands.slice(0, 6).map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary hover:text-primary"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Promo Banner */}
            <div className="mt-6 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary-foreground">15% off your first order</p>
                  <p className="text-sm text-primary-foreground/80">
                    Use code: WELCOME15
                  </p>
                </div>
                <Link
                  href="/deals"
                  className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary transition-transform hover:scale-105"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
