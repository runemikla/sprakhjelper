import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Sparkles, Users, Target } from 'lucide-react'

export default function OmPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Om Språkhjelperen
            </h1>
            <p className="text-xl text-gray-600">
              En AI-drevet plattform for å lære norsk
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                Vårt Oppdrag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Språkhjelperen er utviklet for å gjøre norskopplæring mer tilgjengelig og effektiv 
                ved hjelp av kunstig intelligens. Vi gir personlig tilbakemelding på elevenes morsmål, 
                noe som gjør læringen mer inkluderende og forståelig.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI-Teknologi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Vi bruker avansert AI for å analysere tekster og gi øyeblikkelig, 
                  skreddersydd tilbakemelding til hver elev.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  For Lærere
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Verktøyet støtter lærere i klasserommet ved å gi rask og konsistent 
                  tilbakemelding til alle elever.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                Hvordan Det Fungerer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="text-gray-900">Skriv eller lim inn tekst</strong>
                    <p className="text-gray-600">Eleven skriver eller limer inn sin norske tekst</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    2
                  </span>
                  <div>
                    <strong className="text-gray-900">AI-analyse</strong>
                    <p className="text-gray-600">Teksten analyseres automatisk for grammatikk og språkbruk</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="text-gray-900">Personlig tilbakemelding</strong>
                    <p className="text-gray-600">Få forklaringer på både norsk og ditt morsmål</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
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
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

