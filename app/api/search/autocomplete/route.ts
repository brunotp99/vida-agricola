import { NextRequest, NextResponse } from "next/server"
import { SearchService } from "@/lib/services/search.service"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""

  if (!q.trim()) {
    return NextResponse.json([])
  }

  const suggestions = await SearchService.autocomplete(q)

  return NextResponse.json(suggestions, {
    headers: { "Cache-Control": "public, max-age=60" },
  })
}
