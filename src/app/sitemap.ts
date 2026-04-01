import { MetadataRoute } from 'next'
import { MOCK_VEHICLES } from '@/lib/mock-data'
import { BLOG_POSTS } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://drazono.vercel.app'

  const staticPages = [
    '', '/catalogue', '/comment-ca-marche', '/tarifs', '/a-propos',
    '/contact', '/blog', '/login', '/register',
    '/cgv', '/mentions-legales', '/politique-confidentialite',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const vehiclePages = MOCK_VEHICLES
    .filter(v => v.status !== 'brouillon')
    .map((v) => ({
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
