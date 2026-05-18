"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { ChevronDown, SlidersHorizontal, Grid3X3, List, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

function useFilterState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const priceMin = Number(searchParams.get("priceMin") ?? "0")
  const priceMax = Number(searchParams.get("priceMax") ?? "500")
  const inStock = searchParams.get("inStock") === "true"
  const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : null

  const activeFilterCount =
    (inStock ? 1 : 0) +
    (rating ? 1 : 0) +
    (searchParams.has("priceMin") || searchParams.has("priceMax") ? 1 : 0)

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === "") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    router.push(pathname)
  }

  return { priceMin, priceMax, inStock, rating, activeFilterCount, updateFilter, clearFilters }
}

interface FilterContentProps {
  priceMin: number
  priceMax: number
  inStock: boolean
  rating: number | null
  activeFilterCount: number
  updateFilter: (key: string, value: string | null) => void
  clearFilters: () => void
}

function FilterContent({
  priceMin,
  priceMax,
  inStock,
  rating,
  activeFilterCount,
  updateFilter,
  clearFilters,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full gap-2">
          <X className="h-4 w-4" />
          Clear All Filters ({activeFilterCount})
        </Button>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground">
          Price Range
          <ChevronDown className="h-4 w-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <Slider
            value={[priceMin, priceMax]}
            min={0}
            max={500}
            step={10}
            onValueChange={(value) => {
              updateFilter("priceMin", String(value[0]))
              updateFilter("priceMax", String(value[1]))
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceMin}</span>
            <span>${priceMax}</span>
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
          {[4, 3, 2, 1].map((r) => (
            <div key={r} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${r}`}
                checked={rating === r}
                onCheckedChange={(checked) => {
                  updateFilter("rating", checked ? String(r) : null)
                }}
              />
              <Label
                htmlFor={`rating-${r}`}
                className="cursor-pointer text-sm text-muted-foreground"
              >
                {r}+ Stars
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Availability */}
      <div className="flex items-center gap-2 py-2">
        <Checkbox
          id="in-stock"
          checked={inStock}
          onCheckedChange={(checked) => {
            updateFilter("inStock", checked ? "true" : null)
          }}
        />
        <Label htmlFor="in-stock" className="cursor-pointer text-sm font-semibold text-foreground">
          In Stock Only
        </Label>
      </div>
    </div>
  )
}

export function ProductFilters() {
  const { priceMin, priceMax, inStock, rating, activeFilterCount, updateFilter, clearFilters } =
    useFilterState()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Filters</h2>
          <FilterContent
            priceMin={priceMin}
            priceMax={priceMax}
            inStock={inStock}
            rating={rating}
            activeFilterCount={activeFilterCount}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
          />
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 bg-primary text-primary-foreground">{activeFilterCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent
              priceMin={priceMin}
              priceMax={priceMax}
              inStock={inStock}
              rating={rating}
              activeFilterCount={activeFilterCount}
              updateFilter={updateFilter}
              clearFilters={clearFilters}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function ProductSortAndView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const currentSort = searchParams.get("sort") ?? "newest"

  return (
    <div className="flex items-center gap-4">
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
        </SelectContent>
      </Select>

      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("grid")}
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
