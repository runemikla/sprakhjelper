import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import Image from 'next/image'

export default function LærerveiledningPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-64 h-64">
              <Image
                src="/images/feil_2.png"
                alt="Under konstruksjon"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Under konstruksjon
          </h1>

          {/* Message */}
          <p className="text-xl text-gray-600 mb-8">
            Her kommer det snart en lærerveiledning.
          </p>

          {/* Optional decorative element */}
          <div className="flex justify-center gap-2 mt-12">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
