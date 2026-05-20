"use client"

import { useRouter } from "next/navigation"
import { useTransition, useEffect, useRef, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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
import { createProductAction, updateProductAction } from "@/lib/actions/admin/products"
import { Plus, Trash2, Upload, Eye, Pencil } from "lucide-react"
import Image from "next/image"

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
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().optional().nullable(),
  ),
  defaultStock: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
  flashDeal: z.boolean(),
  images: z.array(
    z.object({
      url: z
        .string()
        .min(1, "Image URL required")
        .refine((v) => v.startsWith("/") || /^https?:\/\//.test(v), "Must be a valid URL or uploaded path"),
      alt: z.string().optional(),
    }),
  ),
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

function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [tab, setTab] = useState<"write" | "preview">("write")

  return (
    <div className="rounded-md border border-input overflow-hidden">
      <div className="flex border-b border-input bg-muted/40">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "write"
              ? "bg-background text-foreground border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "preview"
              ? "bg-background text-foreground border-b-2 border-primary -mb-px"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>
      {tab === "write" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder={placeholder}
          className="rounded-none border-0 focus-visible:ring-0 resize-y"
        />
      ) : (
        <div className="min-h-[160px] p-4 prose prose-sm max-w-none text-foreground">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  )
}

function ImageUploadRow({
  index,
  url,
  alt,
  onUrlChange,
  onAltChange,
  onRemove,
}: {
  index: number
  url: string
  alt: string
  onUrlChange: (url: string) => void
  onAltChange: (alt: string) => void
  onRemove: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const json = await res.json()
      if (json.url) onUrlChange(json.url)
      else alert(json.error ?? "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex gap-3 items-start">
      {url && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border">
          <Image src={url} alt={alt || "Product image"} fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="shrink-0"
          >
            <Upload className="h-4 w-4 mr-1" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
              e.target.value = ""
            }}
          />
        </div>
        <Input value={alt} onChange={(e) => onAltChange(e.target.value)} placeholder="Alt text (optional)" />
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="shrink-0 mt-1">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
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
      defaultStock: 0,
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

  const { fields: imageFields, append: appendImage, remove: removeImage, update: updateImage } = useFieldArray({
    control,
    name: "images",
  })
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })
  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications",
  })

  const name = watch("name")
  const description = watch("description") ?? ""
  const variantCount = variantFields.length

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
            <p className="text-xs text-muted-foreground mb-1">Supports Markdown — **bold**, *italic*, lists, etc.</p>
            <MarkdownEditor
              value={description}
              onChange={(v) => setValue("description", v)}
              placeholder="Describe this product..."
            />
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

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; Stock</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Price (€) *</Label>
            <Input type="number" step="0.01" {...register("price")} />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Compare At Price (€)</Label>
            <Input type="number" step="0.01" {...register("compareAtPrice")} placeholder="Optional" />
            {errors.compareAtPrice && (
              <p className="text-xs text-red-500">{errors.compareAtPrice.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Stock</Label>
            <Input type="number" {...register("defaultStock")} placeholder="0" />
            {variantCount > 0 && (
              <p className="text-xs text-muted-foreground">Stock is managed per variant below.</p>
            )}
            {errors.defaultStock && (
              <p className="text-xs text-red-500">{errors.defaultStock.message}</p>
            )}
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
            <div>
              <CardTitle>Images</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Upload from your device or paste a URL.</p>
            </div>
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
        <CardContent className="space-y-4">
          {imageFields.map((field, idx) => (
            <ImageUploadRow
              key={field.id}
              index={idx}
              url={field.url}
              alt={field.alt ?? ""}
              onUrlChange={(url) => updateImage(idx, { ...field, url })}
              onAltChange={(alt) => updateImage(idx, { ...field, alt })}
              onRemove={() => removeImage(idx)}
            />
          ))}
          {imageFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No images added yet.</p>
          )}
          {errors.images && (
            <p className="text-xs text-red-500">One or more images have invalid URLs.</p>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Variants</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {variantCount === 0
                  ? "No variants — stock above applies to a single Standard variant."
                  : "Each variant has its own stock."}
              </p>
            </div>
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
          {variantFields.length > 0 && (
            <div className="grid grid-cols-4 gap-3 text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              <span>Name</span>
              <span>SKU</span>
              <span>Price (€)</span>
              <span>Stock</span>
            </div>
          )}
          {variantFields.map((field, idx) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-4 gap-3">
                <Input {...register(`variants.${idx}.name`)} placeholder="e.g. 10kg" />
                <Input {...register(`variants.${idx}.sku`)} placeholder="SKU" />
                <Input type="number" step="0.01" {...register(`variants.${idx}.price`)} placeholder="Price" />
                <Input type="number" {...register(`variants.${idx}.stock`)} placeholder="0" />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(idx)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
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
              <Input
                {...register(`specifications.${idx}.value`)}
                placeholder="Value (e.g. 25 kg)"
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSpec(idx)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {specFields.length === 0 && (
            <p className="text-sm text-muted-foreground">No specifications added yet.</p>
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
