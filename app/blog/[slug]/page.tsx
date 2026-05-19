export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, ChevronRight, Calendar, User } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  return prisma.blogPost.findUnique({
    where: { slug, status: "published" },
    include: { author: { select: { name: true, image: true } } },
  })
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.imageUrl ? { images: [post.imageUrl] } : undefined,
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

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
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground line-clamp-1">{post.title}</span>
            </nav>
          </div>
        </div>

        <article className="py-8">
          <div className="container mx-auto max-w-3xl px-4">
            {/* Meta */}
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {post.author.name && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
              )}
            </div>

            <h1 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">{post.title}</h1>

            {post.imageUrl && (
              <div className="relative mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
                <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
              </div>
            )}

            <div className="prose prose-neutral max-w-none dark:prose-invert">
              {post.body.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4 text-foreground leading-7">
                    {paragraph}
                  </p>
                ) : (
                  <br key={i} />
                ),
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}
