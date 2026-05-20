import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF are allowed" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const filename = `${randomUUID()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads", "products")

  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/products/${filename}` })
}
