import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, CheckCircle, Lightbulb, Users } from 'lucide-react'

export default function LærerveiledningPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Lærerveiledning
            </h1>
            <p className="text-xl text-gray-600">
              Hvordan bruke Språkhjelperen i klasserommet
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Introduksjon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                Språkhjelperen er et pedagogisk verktøy som støtter norskopplæring ved å gi 
                elevene øyeblikkelig og personlig tilbakemelding på deres skriftlige arbeid.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Verktøyet er spesielt nyttig for elever med ulike morsmål, da tilbakemeldingene 
                gis på både norsk og elevens eget språk.
              </p>
            </CardContent>
          </Card>

          {/* How to use */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Bruk i Klasserommet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">1. Forberedelse</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Introduser verktøyet for elevene</li>
                    <li>Forklar hvordan de skal velge sitt morsmål</li>
                    <li>Vis hvordan de limer inn eller skriver tekst</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">2. Gjennomføring</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>La elevene arbeide selvstendig med sine tekster</li>
                    <li>Oppmuntre dem til å lese tilbakemeldingene nøye</li>
                    <li>Be dem prøve å skrive setningene på nytt</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">3. Oppfølging</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Diskuter vanlige feil i plenum</li>
                    <li>Bruk sammendraget som utgangspunkt for videre læring</li>
                    <li>Følg opp individuelle utfordringer</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best practices */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Beste Praksis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Bruk verktøyet som supplement til, ikke erstatning for, lærerens tilbakemelding
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Oppmuntre elevene til å reflektere over tilbakemeldingene
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    Bruk sammendraget for å identifisere læringsbehov
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span className="text-gray-700">
                    La elevene arbeide i eget tempo
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-blue-600" />
                Tips og Triks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-gray-700">
                  <strong>💡 Tips:</strong> Start med kortere tekster (2-3 setninger) for å gjøre elevene kjent med verktøyet.
                </p>
                <p className="text-gray-700">
                  <strong>💡 Tips:</strong> Bruk funksjonen for å bytte mellom norsk og morsmål aktivt i undervisningen.
                </p>
                <p className="text-gray-700">
                  <strong>💡 Tips:</strong> Last ned PDF-sammendrag for dokumentasjon av elevenes progresjon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}

