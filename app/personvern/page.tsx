import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PersonvernPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Personvernerklæring</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Innledning</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Språkhjelperen er utviklet av Vestland fylkeskommune for å hjelpe elever med å lære norsk. 
                Vi tar personvernet ditt på alvor og denne erklæringen forklarer hvordan vi samler inn, 
                bruker og beskytter dine personopplysninger.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Sist oppdatert:</strong> {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Behandlingsansvarlig</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p><strong>Vestland fylkeskommune</strong></p>
              <p>Organisasjonsnummer: 974 574 861</p>
              <p>Postadresse: Postboks 7900, 5020 Bergen</p>
              <p>E-post: <a href="mailto:post@vlfk.no" className="text-blue-600 hover:underline">post@vlfk.no</a></p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Hvilke opplysninger samler vi inn?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-4">
              <div>
                <h4 className="font-semibold">3.1 Brukeropplysninger</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>E-postadresse (for innlogging)</li>
                  <li>Navn (hvis oppgitt)</li>
                  <li>Innloggingsinformasjon (kryptert)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold">3.2 Tekstdata</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Tekster du skriver i språkhjelperen</li>
                  <li>Morsmål du oppgir</li>
                  <li>Tilbakemeldinger fra AI-systemet</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">3.3 Teknisk informasjon</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-adresse (anonymisert)</li>
                  <li>Nettlesertype og versjon</li>
                  <li>Tidspunkt for bruk</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Hvordan bruker vi opplysningene?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Levere tjenesten:</strong> For å analysere tekstene dine og gi tilbakemeldinger
                </li>
                <li>
                  <strong>Autentisering:</strong> For å sikre at bare du har tilgang til dine data
                </li>
                <li>
                  <strong>Forbedre tjenesten:</strong> For å utvikle og forbedre språkhjelperen
                </li>
                <li>
                  <strong>Sikkerhet:</strong> For å beskytte mot misbruk og angrep
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Deling av opplysninger</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none space-y-4">
              <div>
                <h4 className="font-semibold">5.1 Tredjepartstjenester</h4>
                <p>Vi bruker følgende tredjepartstjenester:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Supabase:</strong> For autentisering og datalagring (EU-servere)
                  </li>
                  <li>
                    <strong>Azure OpenAI / OpenAI:</strong> For AI-analyse av tekster
                  </li>
                  <li>
                    <strong>Vercel:</strong> For hosting av applikasjonen
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">5.2 Databehandleravtaler</h4>
                <p>
                  Vi har databehandleravtaler med alle tredjepartsleverandører som sikrer 
                  at dine data behandles i henhold til GDPR.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">5.3 Vi selger ALDRI dine data</h4>
                <p>
                  Dine personopplysninger selges aldri til tredjeparter for markedsføringsformål.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Dine rettigheter</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Du har følgende rettigheter etter GDPR:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Rett til innsyn:</strong> Du kan be om en kopi av dine personopplysninger
                </li>
                <li>
                  <strong>Rett til retting:</strong> Du kan be om at feil informasjon rettes
                </li>
                <li>
                  <strong>Rett til sletting:</strong> Du kan be om at dine data slettes
                </li>
                <li>
                  <strong>Rett til begrensning:</strong> Du kan be om at behandlingen begrenses
                </li>
                <li>
                  <strong>Rett til dataportabilitet:</strong> Du kan få dine data i et maskinlesbart format
                </li>
                <li>
                  <strong>Rett til å protestere:</strong> Du kan protestere mot behandling av dine data
                </li>
              </ul>
              <p className="mt-4">
                For å utøve dine rettigheter, kontakt oss på: <a href="mailto:post@vlfk.no" className="text-blue-600 hover:underline">post@vlfk.no</a>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Lagring og sletting</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Brukerdata:</strong> Lagres så lenge kontoen er aktiv
                </li>
                <li>
                  <strong>Tekstdata:</strong> Slettes automatisk etter 90 dager
                </li>
                <li>
                  <strong>Logger:</strong> Anonymiserte logger beholdes i 30 dager
                </li>
              </ul>
              <p className="mt-4">
                Du kan når som helst slette kontoen din og alle tilhørende data ved å kontakte oss.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Sikkerhet</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Vi bruker følgende sikkerhetstiltak:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>HTTPS-kryptering for all dataoverføring</li>
                <li>Krypterte passord (bcrypt)</li>
                <li>Rate limiting for å forhindre misbruk</li>
                <li>Regelmessige sikkerhetsoppdateringer</li>
                <li>Tilgangskontroll og autentisering</li>
                <li>Logging og overvåking av sikkerhetshendelser</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Vi bruker følgende cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Nødvendige cookies:</strong> For innlogging og autentisering (Supabase)
                </li>
                <li>
                  <strong>Funksjonelle cookies:</strong> For å huske dine preferanser
                </li>
              </ul>
              <p className="mt-4">
                Vi bruker IKKE cookies for markedsføring eller sporing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Endringer i personvernerklæringen</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Vi kan oppdatere denne personvernerklæringen fra tid til annen. 
                Vesentlige endringer vil bli kommunisert via e-post eller ved innlogging.
              </p>
              <p className="mt-4">
                Siste oppdatering: {new Date().toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>Har du spørsmål om personvern? Kontakt oss:</p>
              <div className="mt-4 space-y-2">
                <p><strong>E-post:</strong> <a href="mailto:post@vlfk.no" className="text-blue-600 hover:underline">post@vlfk.no</a></p>
                <p><strong>Telefon:</strong> 55 23 90 00</p>
                <p><strong>Postadresse:</strong> Vestland fylkeskommune, Postboks 7900, 5020 Bergen</p>
              </div>
              <p className="mt-4">
                <strong>Datatilsynet:</strong> Du har rett til å klage til Datatilsynet hvis du mener 
                vi ikke behandler dine personopplysninger i henhold til loven.
              </p>
              <p>
                Datatilsynet: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.datatilsynet.no</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

