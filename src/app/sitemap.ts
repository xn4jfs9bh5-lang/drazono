import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { BLOG_POSTS } from '@/lib/blog-data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.drazono.com'

  const staticPages = [
    '', '/catalogue', '/comparer', '/demande', '/comment-ca-marche',
    '/tarifs', '/a-propos', '/contact', '/blog', '/login', '/register',
    '/cgv', '/mentions-legales', '/politique-confidentialite',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, updated_at, status')
    .neq('status', 'brouillon')

  const vehiclePages = (vehicles ?? []).map((v) => ({
    url: `${baseUrl}/vehicule/${v.id}`,
    lastModified: new Date(v.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  const blogPages = BLOG_POSTS
    .filter(p => p.published)
    .map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...vehiclePages, ...blogPages]
}
