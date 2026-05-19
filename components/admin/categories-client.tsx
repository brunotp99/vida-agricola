"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions/admin/categories"
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const FormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().default(0),
  featured: z.boolean().default(false),
})

type FormValues = z.infer<typeof FormSchema>

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  featured: boolean
  sortOrder: number
  parentId: string | null
  children?: Category[]
}

interface CategoryFormDialogProps {
  categories: Category[]
  defaultValues?: Partial<FormValues>
  categoryId?: string
  trigger: React.ReactNode
  title: string
}

function CategoryFormDialog({ categories, defaultValues, categoryId, trigger, title }: CategoryFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      parentId: null,
      sortOrder: 0,
      featured: false,
      ...defaultValues,
    },
  })

  const name = watch("name")

  function onSubmit(data: FormValues) {
    startTransition(async () => {
      const result = categoryId
        ? await updateCategoryAction(categoryId, data)
        : await createCategoryAction(data)
      if (result.success) {
        setOpen(false)
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input
                {...register("name")}
                onChange={(e) => {
                  register("name").onChange(e)
                  if (!categoryId) setValue("slug", slugify(e.target.value))
                }}
                placeholder="Category name"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input {...register("slug")} placeholder="category-slug" />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input {...register("description")} placeholder="Optional description" />
          </div>

          <div className="space-y-1">
            <Label>Image URL</Label>
            <Input {...register("imageUrl")} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Parent Category</Label>
              <Select
                defaultValue={defaultValues?.parentId ?? "none"}
                onValueChange={(v) => setValue("parentId", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (top level)</SelectItem>
                  {categories
                    .filter((c) => c.id !== categoryId && !c.parentId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sort Order</Label>
              <Input type="number" {...register("sortOrder")} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              defaultChecked={!!defaultValues?.featured}
              onCheckedChange={(v) => setValue("featured", !!v)}
            />
            <Label htmlFor="featured" className="font-normal cursor-pointer">Featured</Label>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{categoryId ? "Save Changes" : "Create Category"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the category. Products assigned to it will not be deleted
            but will lose their category. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface CategoriesClientProps {
  categories: Category[]
  parents: Category[]
  childrenByParent: Record<string, Category[]>
}

export function CategoriesClient({ categories, parents, childrenByParent }: CategoriesClientProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryFormDialog
          categories={categories}
          title="Add Category"
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          }
        />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Slug</th>
              <th className="text-left p-4 font-medium text-gray-600">Featured</th>
              <th className="text-left p-4 font-medium text-gray-600">Sort</th>
              <th className="text-right p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {parents.map((parent) => (
              <>
                <tr key={parent.id} className="hover:bg-gray-50 font-medium">
                  <td className="p-4 text-gray-900">{parent.name}</td>
                  <td className="p-4 font-mono text-xs text-gray-500">{parent.slug}</td>
                  <td className="p-4">
                    {parent.featured ? (
                      <span className="text-green-600 text-xs font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{parent.sortOrder}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <CategoryFormDialog
                        categories={categories}
                        categoryId={parent.id}
                        title={`Edit: ${parent.name}`}
                        defaultValues={{
                          name: parent.name,
                          slug: parent.slug,
                          description: parent.description ?? "",
                          imageUrl: parent.imageUrl ?? "",
                          parentId: parent.parentId ?? null,
                          sortOrder: parent.sortOrder,
                          featured: parent.featured,
                        }}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteCategoryButton id={parent.id} name={parent.name} />
                    </div>
                  </td>
                </tr>
                {(childrenByParent[parent.id] ?? []).map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50 bg-gray-50/40">
                    <td className="p-4 text-gray-700">
                      <span className="flex items-center gap-1 ml-6">
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        {child.name}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-500">{child.slug}</td>
                    <td className="p-4">
                      {child.featured ? (
                        <span className="text-green-600 text-xs font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400 text-xs">No</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">{child.sortOrder}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <CategoryFormDialog
                          categories={categories}
                          categoryId={child.id}
                          title={`Edit: ${child.name}`}
                          defaultValues={{
                            name: child.name,
                            slug: child.slug,
                            description: child.description ?? "",
                            imageUrl: child.imageUrl ?? "",
                            parentId: child.parentId ?? null,
                            sortOrder: child.sortOrder,
                            featured: child.featured,
                          }}
                          trigger={
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DeleteCategoryButton id={child.id} name={child.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No categories yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
