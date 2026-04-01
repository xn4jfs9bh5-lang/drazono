'use client'

import Link from 'next/link'
import FadeIn from '@/components/motion/FadeIn'

const brands = [
  { name: 'BYD', slug: 'byd' },
  { name: 'Chery', slug: 'chery' },
  { name: 'Geely', slug: 'geely' },
  { name: 'Great Wall', slug: 'great-wall' },
  { name: 'Haval', slug: 'haval' },
  { name: 'JAC', slug: 'jac-motors' },
  { name: 'Dongfeng', slug: 'dongfeng' },
  { name: 'Changan', slug: 'changan' },
  { name: 'MG', slug: 'mg' },
  { name: 'NIO', slug: 'nio' },
]

export default function BrandsSection() {
  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight text-center mb-10">
            Marques disponibles
          </h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/catalogue?marque=${brand.slug}`}
                className="flex items-center justify-center py-6 px-4 bg-white rounded-xl border border-gray-100 hover:border-[#2563EB] hover:shadow-md transition-all group"
              >
                <span className="font-semibold text-gray-700 group-hover:text-[#2563EB] transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
