import { CategoryService } from "@/lib/services/category.service"
import { CategoriesClient } from "@/components/admin/categories-client"

export default async function AdminCategoriesPage() {
  const categories = await CategoryService.findAll()

  // Build tree: parents first, children nested
  const parents = categories.filter((c) => !c.parentId)
  const childrenByParent: Record<string, typeof categories> = {}
  for (const cat of categories) {
    if (cat.parentId) {
      if (!childrenByParent[cat.parentId]) childrenByParent[cat.parentId] = []
      childrenByParent[cat.parentId].push(cat)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">{categories.length} categories total</p>
      </div>
      <CategoriesClient
        categories={categories}
        parents={parents}
        childrenByParent={childrenByParent}
      />
    </div>
  )
}
