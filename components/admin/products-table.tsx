"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/admin/data-table"
import { deleteProductAction, updateProductStatusAction } from "@/lib/actions/admin/products"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"

type Product = {
  id: string
  name: string
  sku: string
  price: number
  status: "draft" | "active" | "archived"
  createdAt: Date
  totalStock: number
  images: { url: string; alt: string | null }[]
  category: { name: string } | null
}

interface ProductsTableProps {
  products: Product[]
  total: number
  page: number
  pageSize: number
  search: string
}

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  draft: "secondary",
  archived: "destructive",
}

function StatusDropdown({ product }: { product: Product }) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleStatusChange(status: "draft" | "active" | "archived") {
    startTransition(async () => {
      await updateProductStatusAction(product.id, status)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant={statusColors[product.status] ?? "secondary"}
          className="cursor-pointer capitalize"
        >
          {product.status}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {(["active", "draft", "archived"] as const).map((s) => (
          <DropdownMenuItem key={s} onClick={() => handleStatusChange(s)} className="capitalize">
            {s}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DeleteButton({ id }: { id: string }) {
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteProductAction(id)
      router.refresh()
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
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            This will archive the product and remove it from the storefront. This action can be
            reversed by changing its status back to active.
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

export function ProductsTable({
  products,
  total,
  page,
  pageSize,
  search,
}: ProductsTableProps) {
  const columns = [
    {
      key: "image",
      label: "",
      className: "w-16",
      render: (p: Product) =>
        p.images[0] ? (
          <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
            <Image src={p.images[0].url} alt={p.images[0].alt ?? p.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        ),
    },
    {
      key: "name",
      label: "Name",
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-500">{p.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p: Product) => (
        <span className="text-sm text-gray-600">{p.category?.name ?? "—"}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (p: Product) => <span className="text-sm font-medium">€{p.price.toFixed(2)}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (p: Product) => (
        <span
          className={
            p.totalStock <= 5
              ? "text-red-600 font-medium text-sm"
              : "text-sm text-gray-700"
          }
        >
          {p.totalStock}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p: Product) => <StatusDropdown product={p} />,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (p: Product) => (
        <span className="text-sm text-gray-500">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (p: Product) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/products/${p.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <DeleteButton id={p.id} />
        </div>
      ),
    },
  ]

  return (
    <DataTable
      data={products}
      columns={columns}
      total={total}
      page={page}
      pageSize={pageSize}
      searchPlaceholder="Search by name or SKU..."
    />
  )
}
