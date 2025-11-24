import { Navbar } from '@/components/landing/navbar'
import { Hero } from '@/components/landing/hero'
import { Footer } from '@/components/landing/footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  )
}

