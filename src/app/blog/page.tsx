import { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { BLOG_POSTS } from '@/lib/blog-data'
import { createAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Blog & Guides — DRAZONO',
  description: 'Guides, comparatifs et conseils pour acheter votre véhicule chinois. Import Chine, meilleures marques, astuces.',
}

function readingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.ceil(words / 200)
}

interface BlogPost {
  id: string
  slug: string
  title: string
  content: string
  cover_image?: string
  published: boolean
  created_at: string
}

export default async function BlogPage() {
  // Fetch from Supabase
  const supabase = createAdminClient()
  const { data: dbPosts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, content, cover_image, published, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Merge with static posts (static as fallback)
  const staticPosts = BLOG_POSTS.filter(p => p.published)
  const dbSlugs = new Set((dbPosts ?? []).map(p => p.slug))
  const allPosts: BlogPost[] = [
    ...(dbPosts ?? []),
    ...staticPosts.filter(p => !dbSlugs.has(p.slug)),
  ]

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              Blog & Guides
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Guides, comparatifs et conseils pour acheter votre véhicule chinois.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {allPosts.map((post, i) => (
            <FadeIn key={post.id} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <article className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-brand-500/20 hover:shadow-md transition-all bg-white">
                  {post.cover_image ? (
                    <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full sm:w-48 h-32 bg-gradient-to-br from-brand-500/10 to-brand-500/5 rounded-xl shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-400">DRAZONO</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[#111827] group-hover:text-brand-500 transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.content.replace(/[#*]/g, '').slice(0, 150)}...
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime(post.content)} min de lecture
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  )
}
