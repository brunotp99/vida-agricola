'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Flame } from 'lucide-react'
import { ProductCard } from './product-card'
import { products } from '@/lib/data'

export function FlashDeals() {
  const flashProducts = products.filter((p) => p.flashDeal || p.originalPrice)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 59,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
        }
        if (minutes < 0) {
          minutes = 59
          hours--
        }
        if (hours < 0) {
          hours = 23
          minutes = 59
          seconds = 59
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-gradient-to-r from-primary to-accent py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3 text-white">
            <Flame className="h-8 w-8" />
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Flash Deals</h2>
              <p className="text-white/80">Limited time offers - Don&apos;t miss out!</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-white" />
            <div className="flex gap-2">
              <div className="rounded-lg bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <p className="text-xs text-white/80">Hours</p>
              </div>
              <span className="text-2xl font-bold text-white">:</span>
              <div className="rounded-lg bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <p className="text-xs text-white/80">Mins</p>
              </div>
              <span className="text-2xl font-bold text-white">:</span>
              <div className="rounded-lg bg-white/20 px-4 py-2 text-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <p className="text-xs text-white/80">Secs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flashProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
