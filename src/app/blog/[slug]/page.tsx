import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronLeft, Share2 } from 'lucide-react'
import FadeIn from '@/components/motion/FadeIn'
import { BLOG_POSTS } from '@/lib/blog-data'
import { MOCK_VEHICLES } from '@/lib/mock-data'
import VehicleCard from '@/components/vehicles/VehicleCard'

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

export function generateStaticParams() {
  return BLOG_POSTS.filter(p => p.published).map(p => ({ slug: p.slug }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug && p.published)

  if (!post) {
    notFound()
  }

  const relatedVehicles = MOCK_VEHICLES.filter(v => v.status === 'disponible').slice(0, 4)

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#2563EB] mb-8 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </FadeIn>

        {/* Hero image */}
        <FadeIn>
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 rounded-2xl mb-8 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Image de couverture</span>
          </div>
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
              <span className="text-sm text-gray-500">Partager :</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedVehicles.slice(0, 2).map(v => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
