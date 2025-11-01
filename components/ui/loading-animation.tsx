'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingAnimationProps {
  isVisible: boolean
}

const loadingSteps = [
  'Analyserer tekst...',
  'Deler opp teksten i setninger...',
  'Hjelper med forbedringer av språket...',
  'Skriver tilbakemeldinger på setningene...'
]

export function LoadingAnimation({ isVisible }: LoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setDots('')
      return
    }

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length)
    }, 2000)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(stepInterval)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Spinner Animation */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animation-delay-75"></div>
          </div>
          
          {/* Current Step Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Språkhjelperen arbeider
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-base font-medium">
              {loadingSteps[currentStep]}{dots}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}