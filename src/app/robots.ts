import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/espace-client'],
    },
    sitemap: 'https://drazono.vercel.app/sitemap.xml',
  }
}
