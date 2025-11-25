import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'
import Image from 'next/image'

export default function OmPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-4">
              <Image 
                src="/images/sprakhjelper_logo_1.png" 
                alt="Om Språkhjelperen" 
                width={400} 
                height={80} 
                className="object-contain"
              />
            </div>
            <p className="text-xl text-gray-600">
              Et KI-verktøy som hjelper deg å skrive bedre norsk.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                Språkhjelperen er basert på en systeminstruks utviklet av Ine Jørvum og Jan Erik Paulsen. Rune Mikal Birkeland har utviklet denne prototypen.
              </p>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-[#9ADBE8]" />
                Hvordan den fungerer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#9ADBE8] text-gray-900 rounded-full flex items-center justify-center font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="text-gray-900">Skriv eller lim inn tekst</strong>
                    <p className="text-gray-600">Eleven skriver eller limer inn sin norske tekst</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#9ADBE8] text-gray-900 rounded-full flex items-center justify-center font-semibold">
                    2
                  </span>
                  <div>
                    <strong className="text-gray-900">KI-analyse</strong>
                    <p className="text-gray-600">Teksten analyseres automatisk for grammatikk og språkbruk</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#9ADBE8] text-gray-900 rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="text-gray-900">Personlig tilbakemelding</strong>
                    <p className="text-gray-600">Få forklaringer på både norsk og ditt morsmål</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#9ADBE8] text-gray-900 rounded-full flex items-center justify-center font-semibold">
                    4
                  </span>
                  <div>
                    <strong className="text-gray-900">Øv og forbedre</strong>
                    <p className="text-gray-600">Prøv å skrive setningene på nytt og få ny tilbakemelding</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Mascots */}
          <div className="flex justify-center mt-12">
            <Image 
              src="/images/glemmen_riktig-bakgrunn fjernet.png" 
              alt="Språkhjelperen maskotter" 
              width={500} 
              height={500} 
              className="object-contain"
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

