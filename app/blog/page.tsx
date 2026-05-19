import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, ChevronRight, BookOpen, Calendar } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const metadata = { title: "Blog" }

async function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Blog</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Blog</h1>
            <p className="text-muted-foreground">
              Farming tips, product news, and agricultural insights
            </p>
          </div>
        </div>

        {/* Posts */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                    <article className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
                      {post.imageUrl ? (
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-muted">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-5">
                        <h2 className="mb-2 text-lg font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : ""}
                          </span>
                          {post.author.name && (
                            <>
                              <span>·</span>
                              <span>{post.author.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-16 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">No posts yet</h2>
                <p className="text-muted-foreground">Check back soon for farming tips and news.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
