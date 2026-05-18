'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { brands } from '@/lib/data'

export function BrandsCarousel() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            Trusted Brands
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We partner with the best brands in agricultural industry
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/brand/${brand.slug}`}
                className="block rounded-lg bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex h-12 items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground transition-colors hover:text-foreground">
                    {brand.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
