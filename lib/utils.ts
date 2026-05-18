import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | { toNumber(): number }): string {
  const num = typeof price === "number" ? price : price.toNumber()
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

export function calculateDiscount(price: number, compareAtPrice: number): number {
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
