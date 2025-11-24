'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Languages, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()

  const handleKomIGang = () => {
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
    }
    // Navigate to spraakhjelper page
    router.push('/spraakhjelper')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Aurlandsfjorden-blaa.jpg"
          alt="Aurlandsfjorden - Norwegian fjord background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-700/50" />
        {/* Photo credit */}
        <div className="absolute bottom-4 right-4 text-white/70 text-xs bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded">
          Foto: Silje Alvsaker / Vestland fylkeskommune
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Skriv bedre norsk med hjelp fra KI
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-blue-50 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            Språkhjelperen bruker kunstig intelligens for å gjøre skriving enklere. Den gir forklaringer og forslag på både norsk og ditt eget språk, slik at du forstår hvordan teksten kan forbedres. Du får også tips til videre arbeid og en oversiktlig rapport du kan dele med læreren din.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
            <Button 
              onClick={handleKomIGang}
              size="lg" 
              className="bg-transparent text-white border-2 border-white hover:bg-white/10 hover:text-white shadow-lg text-lg px-8 py-4 h-auto hover:scale-105 transition-all"
            >
              Kom i gang
            </Button>
            <Button 
              asChild 
              size="lg" 
              className="bg-transparent text-white border-2 border-white hover:bg-white/10 hover:text-white shadow-lg text-lg px-8 py-4 h-auto hover:scale-105 transition-all"
            >
              <Link href="/om">
                Les mer
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}

