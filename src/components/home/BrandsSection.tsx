'use client'

import Link from 'next/link'
import FadeIn from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'

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
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-[-0.02em] text-center">
            Marques disponibles
          </h2>
          <span className="section-title-line" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-10">
            {brands.map((brand) => (
              <motion.div
                key={brand.slug}
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`/catalogue?marque=${brand.slug}`}
                  className="flex items-center justify-center py-7 px-4 bg-white rounded-xl border border-gray-100 hover:border-brand-500/30 hover:shadow-md transition-all group"
                >
                  <span className="font-bold text-lg text-gray-700 group-hover:text-brand-500 transition-colors tracking-tight">
                    {brand.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
