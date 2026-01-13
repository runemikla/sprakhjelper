'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }

    checkAuth()

    // Listen for auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleSpraakhjelperClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Clear sessionStorage
    if (globalThis.window !== undefined) {
      sessionStorage.clear()
    }
    // Navigate to spraakhjelper page
    router.push('/spraakhjelper')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/Logo_Vestland_fylkeskommune_SSF_06982.PNG"
              alt="Vestland fylkeskommune"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/spraakhjelper"
              onClick={handleSpraakhjelperClick}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium cursor-pointer"
            >
              Språkhjelperen
            </a>
            <Link
              href="/laererveiledning"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Lærerveiledning
            </Link>
            <Link
              href="/om"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Om språkhjelperen
            </Link>
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline">
                Logg ut
              </Button>
            ) : (
              <Button asChild>
                <Link href="/auth/login">
                  Logg inn
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logg ut
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">
                  Logg inn
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a
                href="/spraakhjelper"
                onClick={(e) => {
                  handleSpraakhjelperClick(e)
                  setMobileMenuOpen(false)
                }}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 cursor-pointer"
              >
                Språkhjelperen
              </a>
              <Link
                href="/laererveiledning"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Lærerveiledning
              </Link>
              <Link
                href="/om"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Om språkhjelperen
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

