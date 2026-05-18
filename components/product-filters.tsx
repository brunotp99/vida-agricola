'use client'

import { useState } from 'react'
import { ChevronDown, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { categories, brands } from '@/lib/data'

interface ProductFiltersProps {
  selectedCategory?: string
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  rating: number | null
  inStock: boolean
}

const initialFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 500],
  rating: null,
  inStock: false,
}

export function ProductFilters({ selectedCategory, onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFilterChange?.(updated)
  }

  const clearFilters = () => {
    setFilters(initialFilters)
    onFilterChange?.(initialFilters)
  }

  const activeFilterCount =
    filters.categories.length +
    filters.brands.length +
    (filters.rating ? 1 : 0) +
    (filters.inStock ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground">
          Categories
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={filters.categories.includes(category.id)}
                onCheckedChange={(checked) => {
                  updateFilters({
                    categories: checked
                      ? [...filters.categories, category.id]
                      : filters.categories.filter((c) => c !== category.id),
                  })
                }}
              />
              <Label
                htmlFor={`cat-${category.id}`}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground">
          Brands
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brands.includes(brand.id)}
                onCheckedChange={(checked) => {
                  updateFilters({
                    brands: checked
                      ? [...filters.brands, brand.id]
                      : filters.brands.filter((b) => b !== brand.id),
                  })
                }}
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground">
          Price Range
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <Slider
            value={filters.priceRange}
            min={0}
            max={500}
            step={10}
            onValueChange={(value) =>
              updateFilters({ priceRange: value as [number, number] })
            }
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground">
          Rating
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) => {
                  updateFilters({ rating: checked ? rating : null })
                }}
              />
              <Label
                htmlFor={`rating-${rating}`}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                {rating}+ Stars
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <div className="flex items-center gap-2 py-2">
        <Checkbox
          id="in-stock"
          checked={filters.inStock}
          onCheckedChange={(checked) => {
            updateFilters({ inStock: checked as boolean })
          }}
        />
        <Label
          htmlFor="in-stock"
          className="cursor-pointer text-sm font-semibold text-foreground"
        >
          In Stock Only
        </Label>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Filters</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function ProductSortAndView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="flex items-center gap-4">
      <Select defaultValue="featured">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="rating">Highest Rated</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
        </SelectContent>
      </Select>

      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('grid')}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setViewMode('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
