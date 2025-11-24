import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/Logo_Vestland_fylkeskommune_SSF_06982.PNG"
                alt="Vestland fylkeskommune"
                width={200}
                height={45}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 max-w-md">
              En AI-drevet plattform for å lære norsk. 
              Personlig tilbakemelding på ditt morsmål.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Lenker</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/spraakhjelper" className="hover:text-blue-400 transition-colors">
                  Kom i gang
                </Link>
              </li>
              <li>
                <Link href="/om" className="hover:text-blue-400 transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link href="/lærerveiledning" className="hover:text-blue-400 transition-colors">
                  Lærerveiledning
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Støtte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Hjelp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Kontakt oss
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Personvern
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Språkhjelperen. Alle rettigheter reservert.</p>
        </div>
      </div>
    </footer>
  )
}

