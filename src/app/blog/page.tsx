import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog & Guides — DRAZONO',
  description: 'Guides, comparatifs et conseils pour acheter votre véhicule chinois. Import Chine, meilleures marques, astuces.',
}
import { Clock } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { BLOG_POSTS } from '@/lib/blog-data'

function readingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.ceil(words / 200)
}

export default function BlogPage() {
  const posts = BLOG_POSTS.filter(p => p.published)

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight mb-4">
              Blog & Guides
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Guides, comparatifs et conseils pour acheter votre véhicule chinois.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <FadeIn key={post.id} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <article className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 rounded-2xl border border-gray-100 hover:border-[#2563EB]/20 hover:shadow-md transition-all bg-white">
                  <div className="w-full sm:w-48 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Image</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
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
