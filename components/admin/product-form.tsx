"use client"

import { useRouter } from "next/navigation"
import { useTransition, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createProductAction, updateProductAction } from "@/lib/actions/admin/products"
import { Plus, Trash2 } from "lucide-react"

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const FormSchema = z.object({
  name: z.string().min(2, "Name required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  description: z.string().optional(),
  sku: z.string().min(3, "SKU required"),
  price: z.coerce.number().positive("Price must be positive"),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
  flashDeal: z.boolean(),
  images: z.array(z.object({ url: z.string().url("Valid URL required"), alt: z.string().optional() })),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      price: z.coerce.number().positive(),
      stock: z.coerce.number().int().min(0),
    }),
  ),
  specifications: z.array(z.object({ key: z.string().min(1), value: z.string().min(1) })),
  tags: z.string(),
})

type FormValues = z.infer<typeof FormSchema>

interface Category {
  id: string
  name: string
  parentId: string | null
}

interface Brand {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  brands: Brand[]
  defaultValues?: Partial<FormValues & { id?: string }>
  mode: "create" | "edit"
  productId?: string
}

export function ProductForm({ categories, brands, defaultValues, mode, productId }: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sku: "",
      price: 0,
      compareAtPrice: null,
      categoryId: null,
      brandId: null,
      status: "draft",
      featured: false,
      newArrival: false,
      bestSeller: false,
      flashDeal: false,
      images: [],
      variants: [],
      specifications: [],
      tags: "",
      ...defaultValues,
    },
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: "images" })
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: "variants" })
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control, name: "specifications" })

  const name = watch("name")
  useEffect(() => {
    if (mode === "create") {
      setValue("slug", slugify(name))
    }
  }, [name, mode, setValue])

  function onSubmit(data: FormValues) {
    const input = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }

    startTransition(async () => {
      const result =
        mode === "edit" && productId
          ? await updateProductAction(productId, input)
          : await createProductAction(input)

      if (result.success) {
        router.push("/admin/products")
        router.refresh()
      } else {
        alert(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register("name")} placeholder="Product name" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Slug *</Label>
              <Input {...register("slug")} placeholder="product-slug" />
              {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={4} placeholder="Product description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>SKU *</Label>
              <Input {...register("sku")} placeholder="SKU-001" />
              {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                defaultValue={defaultValues?.status ?? "draft"}
                onValueChange={(v) => setValue("status", v as "draft" | "active" | "archived")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Price (€) *</Label>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Compare At Price (€)</Label>
            <Input type="number" step="0.01" {...register("compareAtPrice")} />
          </div>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                defaultValue={defaultValues?.categoryId ?? "none"}
                onValueChange={(v) => setValue("categoryId", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.parentId ? `  └ ${cat.name}` : cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Brand</Label>
              <Select
                defaultValue={defaultValues?.brandId ?? "none"}
                onValueChange={(v) => setValue("brandId", v === "none" ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No brand</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Tags (comma-separated)</Label>
            <Input {...register("tags")} placeholder="organic, fertilizer, seeds" />
          </div>

          <div>
            <Label className="mb-3 block">Flags</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["featured", "newArrival", "bestSeller", "flashDeal"] as const).map((flag) => (
                <div key={flag} className="flex items-center gap-2">
                  <Checkbox
                    id={flag}
                    defaultChecked={!!defaultValues?.[flag]}
                    onCheckedChange={(checked) => setValue(flag, !!checked)}
                  />
                  <Label htmlFor={flag} className="capitalize font-normal cursor-pointer">
                    {flag.replace(/([A-Z])/g, " $1")}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Images</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendImage({ url: "", alt: "" })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {imageFields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input {...register(`images.${idx}.url`)} placeholder="https://example.com/image.jpg" />
                <Input {...register(`images.${idx}.alt`)} placeholder="Alt text" />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(idx)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {imageFields.length === 0 && (
            <p className="text-sm text-gray-400">No images added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variants</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendVariant({ name: "", sku: "", price: 0, stock: 0 })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variant
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {variantFields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-4 gap-3">
                <Input {...register(`variants.${idx}.name`)} placeholder="Size / Color" />
                <Input {...register(`variants.${idx}.sku`)} placeholder="SKU" />
                <Input type="number" step="0.01" {...register(`variants.${idx}.price`)} placeholder="Price" />
                <Input type="number" {...register(`variants.${idx}.stock`)} placeholder="Stock" />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {variantFields.length === 0 && (
            <p className="text-sm text-gray-400">No variants. Product will use base price and no stock tracking.</p>
          )}
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Specifications</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendSpec({ key: "", value: "" })}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Spec
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {specFields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-center">
              <Input {...register(`specifications.${idx}.key`)} placeholder="Key (e.g. Weight)" className="flex-1" />
              <Input {...register(`specifications.${idx}.value`)} placeholder="Value (e.g. 25 kg)" className="flex-1" />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(idx)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {specFields.length === 0 && (
            <p className="text-sm text-gray-400">No specifications added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
