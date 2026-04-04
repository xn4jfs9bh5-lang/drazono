import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronLeft, Share2 } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { BLOG_POSTS } from '@/lib/blog-data'
import { createAdminClient } from '@/lib/supabase-server'
import RelatedVehicles from '@/components/vehicles/RelatedVehicles'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function readingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.ceil(words / 200)
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#111827] mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#111827] mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-600">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-gray-600 leading-relaxed mb-4">')
    .replace(/^/, '<p class="text-gray-600 leading-relaxed mb-4">')
    .replace(/$/, '</p>')
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

async function getPost(slug: string): Promise<BlogPost | null> {
  // Try Supabase first
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (data) return data

  // Fallback to static posts
  const staticPost = BLOG_POSTS.find(p => p.slug === slug && p.published)
  return staticPost ?? null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)
  if (!post) return { title: 'Article introuvable — DRAZONO' }
  return {
    title: `${post.title} — DRAZONO`,
    description: post.content.replace(/[#*]/g, '').slice(0, 160),
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand-500 mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </FadeIn>

        {/* Hero image */}
        <FadeIn>
          {post.cover_image ? (
            <div className="w-full h-48 sm:h-64 rounded-2xl mb-8 overflow-hidden bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-brand-500/10 to-brand-500/5 rounded-2xl mb-8 flex items-center justify-center">
              <span className="text-gray-400 text-sm">DRAZONO</span>
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.1}>
          <article>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
              <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime(post.content)} min de lecture
              </span>
            </div>

            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {/* Share buttons */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-3">
              <span className="text-sm text-gray-600">Partager :</span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                Copier le lien
              </button>
            </div>
          </article>
        </FadeIn>

        {/* Related vehicles */}
        <FadeIn delay={0.2}>
          <div className="mt-16">
            <h2 className="text-xl font-bold text-[#111827] mb-6">Véhicules disponibles</h2>
            <RelatedVehicles limit={2} />
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
