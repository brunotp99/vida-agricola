import { CategoryService } from "@/lib/services/category.service"
import { Header } from "./header"

export async function HeaderServer() {
  const categories = await CategoryService.findWithSubcategories()
  return <Header categories={categories} />
}
