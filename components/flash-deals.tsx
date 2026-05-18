import { ProductService, serializeProductCard } from "@/lib/services/product.service"
import { FlashDealsClient } from "./flash-deals-client"

export async function FlashDeals() {
  const raw = await ProductService.findFlashDeals()
  const products = raw.map(serializeProductCard)
  return <FlashDealsClient products={products} />
}
