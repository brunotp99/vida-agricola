'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const heroSlides = [
  {
    id: 1,
    title: 'Quality Feed for Healthy Livestock',
    subtitle: 'Premium Nutrition',
    description: 'Discover our range of scientifically formulated animal feeds designed for optimal growth and health.',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920',
    cta: 'Shop Animal Feed',
    href: '/category/animal-feed',
    color: 'from-primary/90',
  },
  {
    id: 2,
    title: 'Professional Farm Equipment',
    subtitle: 'Built to Last',
    description: 'Equip your farm with durable, efficient tools and machinery from leading brands.',
    image: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=1920',
    cta: 'Explore Equipment',
    href: '/category/farm-equipment',
    color: 'from-accent/90',
  },
  {
    id: 3,
    title: 'Veterinary Care Products',
    subtitle: 'Animal Wellness',
    description: 'Keep your animals healthy with our complete range of veterinary supplies and supplements.',
    image: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=1920',
    cta: 'Shop Healthcare',
    href: '/category/veterinary-health',
    color: 'from-primary/90',
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <section className="relative h-[500px] overflow-hidden md:h-[600px]">
      <AnimatePresence mode="wait">
        {heroSlides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent`} />
                
                <div className="container relative mx-auto flex h-full items-center px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="max-w-xl text-white"
                  >
                    <span className="mb-2 inline-block rounded-full bg-secondary px-4 py-1 text-sm font-medium text-secondary-foreground">
                      {slide.subtitle}
                    </span>
                    <h1 className="mb-4 text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mb-8 text-lg text-white/90">
                      {slide.description}
                    </p>
                    <Link href={slide.href}>
                      <Button size="lg" className="gap-2 bg-card text-foreground hover:bg-card/90">
                        {slide.cta}
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
