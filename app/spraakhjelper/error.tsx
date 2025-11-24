'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Spraakhjelper error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <CardTitle>Noe gikk galt med språkhjelperen</CardTitle>
          </div>
          <CardDescription>
            En uventet feil oppstod under analysen. Prøv igjen eller start på nytt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-mono">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Prøv igjen
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/spraakhjelper'
              }}
              className="flex-1"
            >
              Start på nytt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
