'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Languages, Copy, BarChart3, Volume2, VolumeX, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { LoadingAnimation } from '@/components/ui/loading-animation'
import { Confetti } from '@/components/ui/confetti'
import { useAudio } from '@/hooks/use-audio'
import { Navbar } from '@/components/landing/navbar'

interface SentenceResult {
  bruker_setning: string;
  riktig_setning: string;
  forklaring: string;
  forklaring_morsmaal: string;
  setning_status?: 'riktig' | 'riktig_2' | 'feil';
  sentence_id?: string;
}

interface SpraakhjelpperResult {
  success: boolean;
  submissionId: string;
  results: SentenceResult[];
  morsmaal: string;
  originalText: string;
  savedToDatabase?: boolean;
  isLocal?: boolean;
}

interface SplitSentence {
  original: string;
  corrected: string;
}

interface SplitSentencesResult {
  success: boolean;
  sentences: SplitSentence[];
  sentenceCount: number;
  morsmaal: string;
  originalText: string;
  provider?: string;
}

interface TextAnalysis {
  hva_var_bra: string;
  hva_var_bra_morsmaal: string;
  hva_kan_bli_bedre: string;
  hva_kan_bli_bedre_morsmaal: string;
  ordliste: Array<{
    feil: string;
    riktig: string;
  }>;
}

interface AnalysisResult {
  success: boolean;
  analysis: TextAnalysis;
  provider: string;
}

const languages = [
  { code: 'arabisk', name: 'Arabisk', flag: '🇸🇦' },
  { code: 'dari', name: 'Dari', flag: '🇦🇫' },
  { code: 'farsi', name: 'Farsi/Persisk', flag: '🇮🇷' },
  { code: 'kurmandsji', name: 'Kurmandsji (Kurdisk)', flag: '🏴' },
  { code: 'mandarin', name: 'Mandarin (Kinesisk)', flag: '🇨🇳' },
  { code: 'polsk', name: 'Polsk', flag: '🇵🇱' },
  { code: 'portugisisk', name: 'Portugisisk', flag: '🇵🇹' },
  { code: 'russisk', name: 'Russisk', flag: '🇷🇺' },
  { code: 'ukrainsk', name: 'Ukrainsk', flag: '🇺🇦' },
  { code: 'somali', name: 'Somali', flag: '🇸🇴' },
  { code: 'swahili', name: 'Swahili', flag: '🇹🇿' },
  { code: 'thai', name: 'Thai', flag: '🇹🇭' },
  { code: 'tigrinja', name: 'Tigrinja', flag: '🇪🇷' },
  { code: 'tyrkisk', name: 'Tyrkisk', flag: '🇹🇷' },
  { code: 'vietnamesisk', name: 'Vietnamesisk', flag: '🇻🇳' },
];

interface SpraakhjelpperClientProps {
  user: {
    id: string
    email?: string
  }
}

export default function SpraakhjelpperClient({ user }: SpraakhjelpperClientProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'azure'>('azure')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // New: Split sentences state
  const [splitResult, setSplitResult] = useState<SplitSentencesResult | null>(null)
  const [showSplitOverview, setShowSplitOverview] = useState(false)
  
  const [result, setResult] = useState<SpraakhjelpperResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [showNorwegianExplanation, setShowNorwegianExplanation] = useState(true)
  
  // Teacher selection - randomly chosen on component mount, persists through session
  const [teacherVersion, setTeacherVersion] = useState<1 | 2>(() => {
    // Randomly select teacher 1 or 2 on first load
    return Math.random() < 0.5 ? 1 : 2
  })
  const [retryInput, setRetryInput] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [activeTextView, setActiveTextView] = useState<'original' | 'user'>('user')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Text analysis state
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysis | null>(null)
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false)
  const [showAnalysisInNorwegian, setShowAnalysisInNorwegian] = useState(true)
  
  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const successSound = useAudio('/audio/success-fanfare.mp3', {
    volume: 0.7,
    preload: true
  })

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('spraakhjelper-result')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setResult(parsed)
        setShowForm(false)
      } catch (e) {
        console.error('Failed to parse saved result:', e)
        localStorage.removeItem('spraakhjelper-result')
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (result) {
      localStorage.setItem('spraakhjelper-result', JSON.stringify(result))
    }
  }, [result])

  // Step 1: Split text into sentences
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedLanguage) {
      toast.error('Fyll ut både tekst og morsmål')
      return
    }

    setIsSubmitting(true)
    setShowForm(false)
    setSplitResult(null)
    setResult(null)
    setError(null)

    try {
      // Choose API endpoint based on selected provider
      const apiEndpoint = selectedProvider === 'azure' ? '/api/split-sentences-azure' : '/api/split-sentences';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputValue.trim(),
          morsmaal: selectedLanguage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      setSplitResult(data)
      setShowSplitOverview(true)
      toast.success('Teksten er delt inn i setninger!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
      setError(errorMessage)
      toast.error(`Feil: ${errorMessage}`)
      setShowForm(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Analyze sentences
  const handleAnalyze = async () => {
    if (!splitResult) return

    setIsSubmitting(true)
    setShowSplitOverview(false)
    setResult(null)
    setError(null)
    setCurrentSentenceIndex(0)
    setShowSummary(false)
    setActiveTextView('user')

    try {
      // Choose API endpoint based on selected provider
      const apiEndpoint = selectedProvider === 'azure' ? '/api/spraakhjelper-azure' : '/api/spraakhjelper';
      
      // Use the corrected text from split result
      const textToAnalyze = splitResult.sentences.map(s => s.corrected).join(' ')
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToAnalyze,
          morsmaal: splitResult.morsmaal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      setResult(data)
      // Initialize retryInput with the first sentence
      if (data.results && data.results.length > 0) {
        setRetryInput(data.results[0].bruker_setning)
      }
      toast.success('Analyse fullført!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
      setError(errorMessage)
      toast.error(`Feil: ${errorMessage}`)
      setShowSplitOverview(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNext = () => {
    if (result && currentSentenceIndex < result.results.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1)
      const nextSentence = result.results[currentSentenceIndex + 1]
      setRetryInput(nextSentence.bruker_setning)
    }
  }

  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1)
      const prevSentence = result.results[currentSentenceIndex - 1]
      setRetryInput(prevSentence.bruker_setning)
    }
  }

  const showInputForm = () => {
    // Clear all localStorage data
    localStorage.clear()
    // Refresh the page to reset everything
    window.location.reload()
  }

  const currentSentence = result?.results[currentSentenceIndex]

  // Sync retryInput with currentSentence.bruker_setning when it changes
  useEffect(() => {
    if (currentSentence && currentSentence.setning_status === 'feil') {
      console.log('useEffect: Syncing retryInput with currentSentence.bruker_setning:', currentSentence.bruker_setning)
      setRetryInput(currentSentence.bruker_setning)
    }
  }, [currentSentence?.bruker_setning, currentSentence?.setning_status])

  // Get teacher image based on sentence status
  const getTeacherImage = (status: 'riktig' | 'riktig_2' | 'feil' | undefined) => {
    // Add version parameter to bust cache for updated images
    const version = 'v2'
    if (status === 'riktig' || status === 'riktig_2') {
      return `/images/riktig_${teacherVersion}.png?${version}`
    } else if (status === 'feil') {
      return `/images/feil_${teacherVersion}.png?${version}`
    }
    return `/images/JP_positiv.png?${version}` // Default fallback
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Tekst kopiert!')
    } catch (err) {
      toast.error('Kunne ikke kopiere teksten')
    }
  }

  const handleCheckAnswer = async () => {
    if (!retryInput.trim() || !currentSentence || !result) {
      toast.error('Skriv inn et svar først')
      return
    }

    setIsCheckingAnswer(true)

    try {
      // Choose API endpoint based on selected provider
      const apiEndpoint = selectedProvider === 'azure' ? '/api/check-sentence-azure' : '/api/check-sentence';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence: retryInput.trim(),
          correctSentence: currentSentence.riktig_setning,
          morsmaal: result.morsmaal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Kunne ikke sjekke svaret')
      }

      // Debug: Log the API response
      console.log('API Response:', data)
      console.log('Current retryInput before update:', retryInput)
      
      // Get the updated sentence from API response
      const updatedSentence = data.bruker_setning || retryInput.trim()
      console.log('Updated sentence:', updatedSentence)
      
      // Update the current sentence with new explanation from AI
      const updatedResults = result.results.map((sentence, index) => {
        if (index === currentSentenceIndex) {
          return {
            ...sentence,
            bruker_setning: updatedSentence,
            setning_status: data.er_riktig ? ('riktig_2' as const) : ('feil' as const),
            forklaring: data.forklaring,
            forklaring_morsmaal: data.forklaring_morsmaal,
          }
        }
        return sentence
      })

      console.log('Setting result with updated results')
      setResult({
        ...result,
        results: updatedResults
      })
      
      // Update retryInput to reflect the new bruker_setning
      // This ensures the input box shows the corrected sentence
      console.log('Setting retryInput to:', updatedSentence)
      setRetryInput(updatedSentence)
      console.log('retryInput should now be:', updatedSentence)

      if (data.er_riktig) {
        toast.success('Riktig! Godt jobbet! 🎉')
        if (soundEnabled) {
          successSound.play().catch(error => console.error('Audio error:', error))
        }
      } else {
        toast.info('Se forklaringen for tips!')
      }

      setRetryInput('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
      toast.error(`Feil: ${errorMessage}`)
    } finally {
      setIsCheckingAnswer(false)
    }
  }

  const getStatistics = () => {
    if (!result?.results) return { totalSentences: 0, correctSentences: 0, correctPercentage: 0, correctedSentences: 0 }
    
    const totalSentences = result.results.length
    const correctSentences = result.results.filter(s => s.setning_status === 'riktig').length
    const correctedSentences = result.results.filter(s => s.setning_status === 'riktig_2').length
    const totalCorrect = correctSentences + correctedSentences
    const correctPercentage = totalSentences > 0 ? Math.round((totalCorrect / totalSentences) * 100) : 0
    
    return { totalSentences, correctSentences, correctedSentences, correctPercentage }
  }

  const getCorrectedText = () => {
    if (!result?.results) return ''
    return result.results.map(s => s.riktig_setning).join(' ')
  }

  const getUserCorrectedText = () => {
    if (!result?.results) return ''
    return result.results.map(s => s.bruker_setning).join(' ')
  }

  const getActiveTextData = () => {
    if (!result) return { text: '', title: '', description: '', bgColor: '', copyText: '' }

    switch (activeTextView) {
      case 'original':
        return {
          text: result.originalText,
          title: 'Opprinnelig tekst',
          description: 'Teksten slik du skrev den først',
          bgColor: 'bg-gray-50 border-gray-200',
          copyText: result.originalText
        }
      case 'user':
        return {
          text: getUserCorrectedText(),
          title: 'Din tekst (med dine korrigeringer)',
          description: getUserCorrectedText() !== result.originalText 
            ? '💡 Denne teksten oppdateres når du korrigerer setninger'
            : 'Du har ikke gjort noen korrigeringer ennå',
          bgColor: 'bg-blue-50 border-blue-200',
          copyText: getUserCorrectedText()
        }
      default:
        return { text: '', title: '', description: '', bgColor: '', copyText: '' }
    }
  }

  const PieChart = () => {
    const stats = getStatistics()
    const radius = 45
    const circumference = 2 * Math.PI * radius
    
    const originalCorrectPercentage = stats.totalSentences > 0 ? (stats.correctSentences / stats.totalSentences) * 100 : 0
    const correctedPercentage = stats.totalSentences > 0 ? (stats.correctedSentences / stats.totalSentences) * 100 : 0
    const totalCorrectPercentage = originalCorrectPercentage + correctedPercentage
    
    const originalStrokeDasharray = circumference
    const originalStrokeDashoffset = circumference - (originalCorrectPercentage / 100) * circumference
    
    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none" stroke="#10b981" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={originalStrokeDasharray}
            strokeDashoffset={originalStrokeDashoffset}
            className="transition-all duration-500"
          />
          {correctedPercentage > 0 && (
            <circle
              cx="50" cy="50" r={radius} fill="none" stroke="#3b82f6" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(correctedPercentage / 100) * circumference} ${circumference}`}
              className="transition-all duration-500"
              style={{
                transform: `rotate(${(originalCorrectPercentage / 100) * 360}deg)`,
                transformOrigin: '50% 50%'
              }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700">{Math.round(totalCorrectPercentage)}%</span>
        </div>
      </div>
    )
  }

  const formatExplanation = (text: string | undefined | null) => {
    if (!text || typeof text !== 'string') {
      return [{ number: '1.', content: 'Ingen forklaring tilgjengelig' }]
    }

    const normalizedText = text.replace(/\/n/g, '\n').replace(/\\n/g, '\n')
    const parts = normalizedText.split(/(?=\d+\.\s)/).filter(part => part.trim().length > 0)
    const formattedPoints = []
    
    for (const part of parts) {
      const trimmedPart = part.trim()
      const match = trimmedPart.match(/^(\d+\.\s*)(.*)$/)
      if (match) {
        const [, number, content] = match
        formattedPoints.push({ number: number.trim(), content: content.trim() })
      }
    }
    
    if (formattedPoints.length === 0) {
      return [{ number: '1.', content: text.trim() }]
    }
    
    return formattedPoints
  }

  // Generate and download PDF
  const downloadPDF = async () => {
    if (!result || !result.originalText || !result.results) {
      toast.error('Ingen data å laste ned')
      return
    }

    setIsGeneratingPDF(true)

    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - (margin * 2)
      let yPos = margin

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        
        const lines = doc.splitTextToSize(text, maxWidth)
        
        // Check if we need a new page
        if (yPos + (lines.length * fontSize * 0.35) > pageHeight - margin) {
          doc.addPage()
          yPos = margin
        }
        
        doc.text(lines, margin, yPos)
        yPos += lines.length * fontSize * 0.35 + 5
      }

      // Helper function to add section spacing
      const addSpace = (space: number = 10) => {
        yPos += space
      }

      // Title
      addText('Språkhjelperen - Sammendrag', 20, true, [59, 130, 246])
      addSpace(5)
      
      // Date
      const date = new Date().toLocaleDateString('no-NO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      addText(date, 10, false, [107, 114, 128])
      addSpace(15)

      // Statistics
      const statistics = getStatistics()
      addText('Statistikk', 16, true, [31, 41, 55])
      addSpace(5)
      
      doc.setDrawColor(229, 231, 235)
      doc.setFillColor(239, 246, 255)
      doc.rect(margin, yPos, maxWidth, 40, 'F')
      
      yPos += 8
      addText(`Antall setninger: ${statistics.totalSentences}`, 11)
      addText(`Riktige fra start: ${statistics.correctSentences}`, 11)
      addText(`Korrigert av deg: ${statistics.correctedSentences}`, 11)
      addText(`Nøyaktighet: ${statistics.correctPercentage}%`, 11, true, [22, 163, 74])
      
      addSpace(10)

      // Original Text
      addText('Din opprinnelige tekst', 16, true, [31, 41, 55])
      addSpace(5)
      addText(result.originalText, 10, false)
      addSpace(15)

      // Corrected Text
      const correctedText = result.results.map(r => r.riktig_setning).join(' ')
      addText('Korrigert versjon', 16, true, [31, 41, 55])
      addSpace(5)
      addText(correctedText, 10, false)
      addSpace(15)

      // Analysis (if available)
      if (textAnalysis) {
        addText('Detaljert analyse', 16, true, [31, 41, 55])
        addSpace(10)
        
        // What was good
        addText('Hva var bra', 14, true, [22, 163, 74])
        addSpace(5)
        addText(textAnalysis.hva_var_bra, 10)
        addSpace(10)
        
        // What can be improved
        addText('Hva kan bli bedre', 14, true, [234, 88, 12])
        addSpace(5)
        addText(textAnalysis.hva_kan_bli_bedre, 10)
        addSpace(10)
        
        // Word list
        if (textAnalysis.ordliste && textAnalysis.ordliste.length > 0) {
          addText('Stavefeil', 14, true, [59, 130, 246])
          addSpace(5)
          
          textAnalysis.ordliste.forEach(word => {
            addText(`${word.feil} → ${word.riktig}`, 10)
          })
        } else {
          addText('Ingen stavefeil funnet!', 12, false, [22, 163, 74])
        }
      }

      // Footer
      yPos = pageHeight - margin
      addText('Fortsett å øve!', 10, false, [107, 114, 128])

      // Generate filename with date
      const filename = `spraakhjelperen_sammendrag_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Save PDF
      doc.save(filename)
      
      toast.success('📄 PDF lastet ned!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Kunne ikke generere PDF. Prøv igjen.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Generate text analysis
  const generateTextAnalysis = async () => {
    if (!result || !result.originalText || !result.morsmaal) {
      toast.error('Ingen tekst å analysere')
      return
    }

    setIsGeneratingAnalysis(true)
    
    try {
      // Choose API endpoint based on provider
      const apiEndpoint = selectedProvider === 'azure' ? '/api/generate-summary-azure' : '/api/generate-summary'
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: result.originalText,
          morsmaal: result.morsmaal,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate analysis')
      }

      const data: AnalysisResult = await response.json()
      
      if (data.success && data.analysis) {
        setTextAnalysis(data.analysis)
        toast.success('Analyse generert!')
      } else {
        throw new Error('Invalid response from API')
      }
      
    } catch (error) {
      console.error('Error generating analysis:', error)
      toast.error('Kunne ikke generere analyse. Prøv igjen.')
    } finally {
      setIsGeneratingAnalysis(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/Aurlandsfjorden-blaa.jpg"
          alt="Aurlandsfjorden - Norwegian fjord background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-cyan-700/50" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="relative z-10 container mx-auto py-8 px-4 max-w-4xl mt-16">
      <div className="space-y-8">
        {showForm && (
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            {/* Mini Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={showInputForm}>
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Språkhjelperen</h2>
                  <p className="text-sm text-gray-600">
                    Få tilbakemeldinger fra KI på teksten din.
                  </p>
                </div>
              </div>
            </div>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* AI-leverandør dropdown - skjult for nå, kan aktiveres senere ved å fjerne kommentarene */}
                {/* <div>
                  <Label htmlFor="provider" className="text-lg font-semibold">Velg AI-leverandør</Label>
                  <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as 'openai' | 'azure')} disabled>
                    <SelectTrigger>
                      <SelectValue>
                        {selectedProvider === 'openai' ? '🤖 OpenAI (GPT-5)' : '☁️ Azure OpenAI'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azure">
                        <span className="flex items-center gap-2">
                          <span>☁️</span>
                          <span>Azure OpenAI</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}

                <div>
                  <Label htmlFor="morsmaal" className="text-lg font-semibold">Hva er ditt morsmål?</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      {selectedLanguage ? (
                        <span className="flex items-center gap-2">
                          <span>{languages.find(lang => lang.code === selectedLanguage)?.flag}</span>
                          <span>{languages.find(lang => lang.code === selectedLanguage)?.name}</span>
                        </span>
                      ) : (
                        <SelectValue placeholder="Velg ditt morsmål" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="input" className="text-lg font-semibold">Lim inn teksten din her:</Label>
                  <Textarea
                    id="input"
                    placeholder="Skriv eller lim inn teksten din her..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="min-h-[200px]"
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!inputValue.trim() || !selectedLanguage || isSubmitting}
                >
                  {isSubmitting ? 'Deler inn setninger...' : 'Del inn i setninger'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        <LoadingAnimation isVisible={isSubmitting} />
        
        {/* Step 1 Result: Overview of split sentences */}
        {showSplitOverview && splitResult && (
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            {/* Mini Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={showInputForm}>
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Språkhjelperen</h2>
                  <p className="text-sm text-gray-600">
                    Få tilbakemeldinger fra KI på teksten din.
                  </p>
                </div>
              </div>
            </div>
            
            <CardHeader>
              <div>
                <CardTitle>Oversikt over teksten din</CardTitle>
                <CardDescription>
                  Teksten er delt inn i {splitResult.sentenceCount} {splitResult.sentenceCount === 1 ? 'setning' : 'setninger'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 text-blue-900">Setninger funnet:</h3>
                  <ol className="space-y-2">
                    {splitResult.sentences.map((sentence, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="font-semibold text-blue-700 mt-0.5">{index + 1}.</span>
                        <span className="flex-1">{sentence.corrected}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                
                <div className="flex justify-end items-center pt-4 border-t">
                  <Button 
                     onClick={handleAnalyze}
                     disabled={isSubmitting}
                     size="lg"
                     className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                   >
                     {isSubmitting ? 'Analyserer...' : 'Analyser setninger'}
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {error && (
          <Card className="border-red-300 bg-red-50/95 backdrop-blur-sm shadow-xl">
            {/* Mini Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={showInputForm}>
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Språkhjelperen</h2>
                  <p className="text-sm text-gray-600">
                    Få tilbakemeldinger fra KI på teksten din.
                  </p>
                </div>
              </div>
            </div>
            
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium text-red-600 mb-2">Feil</h2>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
        
        {result && result.results && result.results.length > 0 && !showSummary && currentSentence && (
          <Card className="flex flex-col h-[calc(100vh-12rem)] bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            {/* Mini Header */}
            <div className="px-6 pt-4 pb-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={showInputForm}>
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Språkhjelperen</h2>
                  <p className="text-sm text-gray-600">
                    Få tilbakemeldinger fra KI på teksten din.
                  </p>
                </div>
              </div>
            </div>
            
            <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="space-y-6 flex-1 overflow-y-auto">
                {/* Din setning section with teacher image */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-lg font-semibold mb-3">Din setning:</p>
                    <div className={`rounded-lg p-4 border-2 ${
                      currentSentence.setning_status === 'feil' 
                        ? 'bg-red-50 border-red-300' 
                        : 'bg-green-50 border-green-300'
                    }`}>
                      {currentSentence.setning_status === 'feil' ? (
                        <div className="space-y-3">
                          <Input
                            value={retryInput}
                            onChange={(e) => setRetryInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && retryInput.trim() && !isCheckingAnswer) {
                                e.preventDefault()
                                handleCheckAnswer()
                              }
                            }}
                            className="bg-white border-red-300 focus:border-red-500 text-base"
                            placeholder="Skriv setningen din på nytt her..."
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              Kan du prøve å rette setningen din?
                            </p>
                            <Button
                              size="sm"
                              onClick={handleCheckAnswer}
                              disabled={!retryInput.trim() || isCheckingAnswer}
                              className="whitespace-nowrap"
                            >
                              {isCheckingAnswer ? 'Sjekker...' : 'Sjekk svar'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{currentSentence.bruker_setning}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Teacher image */}
                  <div className="flex-shrink-0">
                    <Image 
                      src={getTeacherImage(currentSentence.setning_status)} 
                      alt="Lærer"
                      width={96}
                      height={96}
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                {/* Header section with language buttons */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Forslag til forbedringer:</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={showNorwegianExplanation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowNorwegianExplanation(true)}
                    >
                        <span className="mr-1">🇳🇴</span>
                      Norsk
                    </Button>
                    <Button
                      variant={!showNorwegianExplanation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowNorwegianExplanation(false)}
                    >
                        <span className="mr-1">{result.morsmaal ? languages.find(lang => lang.code === result.morsmaal)?.flag : '🌐'}</span>
                      {result.morsmaal ? languages.find(lang => lang.code === result.morsmaal)?.name : 'Morsmål'}
                    </Button>
                  </div>
                </div>
                
                <div className={`text-sm rounded-lg p-4 ${
                  showNorwegianExplanation ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
                }`}>
                  <div className="space-y-2">
                    {formatExplanation(showNorwegianExplanation ? currentSentence.forklaring : currentSentence.forklaring_morsmaal)
                      .map((point, index) => (
                        <div key={index} className="flex gap-2">
                          <span className={`font-medium flex-shrink-0 ${
                            showNorwegianExplanation ? 'text-blue-700' : 'text-purple-700'
                          }`}>
                            {point.number}
                          </span>
                          <div className="flex-1">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              disallowedElements={['script', 'iframe', 'object', 'embed', 'form', 'input']}
                              unwrapDisallowed={true}
                              components={{
                                p: ({ children }) => <span>{children}</span>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                a: ({ children, href }) => (
                                  <a 
                                    href={href?.startsWith('http') ? href : '#'} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {point.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                  </div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar and navigation - fixed at bottom */}
              <div className="mt-6 space-y-4">
                {/* Progress bar */}
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${((currentSentenceIndex + 1) / result.results.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPrevious}
                    disabled={currentSentenceIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Forrige
                  </Button>
                  
                  <span className="text-sm text-gray-500">
                    Setning {currentSentenceIndex + 1} av {result.results.length}
                  </span>
                  
                  <div className="flex gap-4">
                    {currentSentenceIndex === result.results.length - 1 ? (
                      <Button
                        onClick={() => {
                          setShowSummary(true)
                          setShowConfetti(true)
                          // Generate analysis if not already generated
                          if (!textAnalysis && !isGeneratingAnalysis) {
                            generateTextAnalysis()
                          }
                        }}
                         className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                       >
                         <BarChart3 className="h-4 w-4 mr-2" />
                         Vis sammendrag
                       </Button>
                    ) : (
                      <Button variant="outline" onClick={goToNext}>
                        Neste
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Summary View */}
        {showSummary && result && (
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            {/* Mini Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={showInputForm}>
                <GraduationCap className="h-7 w-7 text-gray-900" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Språkhjelperen</h2>
                  <p className="text-sm text-gray-600">
                    Få tilbakemeldinger fra KI på teksten din.
                  </p>
                </div>
              </div>
            </div>
            
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Sammendrag</h2>
                <Button variant="outline" onClick={() => setShowSummary(false)}>
                  Tilbake til setninger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <Button
                        variant={activeTextView === 'original' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTextView('original')}
                      >
                        Opprinnelig
                      </Button>
                      <Button
                        variant={activeTextView === 'user' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTextView('user')}
                      >
                        Din versjon
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getActiveTextData().copyText)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Kopier
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-1">{getActiveTextData().title}</h3>
                    <div className={`border rounded-lg p-4 ${getActiveTextData().bgColor}`}>
                      <p className="text-sm leading-relaxed">{getActiveTextData().text}</p>
                    </div>
                    {getActiveTextData().description && (
                      <p className="text-xs text-gray-500 mt-2">{getActiveTextData().description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Statistikk</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">Antall setninger:</span>
                        <span className="text-sm font-semibold">{getStatistics().totalSentences}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">Riktige fra start:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {getStatistics().correctSentences} av {getStatistics().totalSentences}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">Korrigerte av deg:</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {getStatistics().correctedSentences} av {getStatistics().totalSentences}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">Nøyaktighet:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {getStatistics().correctPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Resultat</h3>
                    <div className="bg-gray-50 border rounded-lg p-4 flex flex-col items-center">
                      <PieChart />
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        {getStatistics().correctPercentage >= 80 ? '🎉 Flott jobbet!' : 
                         getStatistics().correctPercentage >= 60 ? '👍 Bra arbeid!' : 
                         '💪 Fortsett å øve!'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Analysis Section */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold mb-4">Tilbakemelding på teksten din</h3>
                  
                  {isGeneratingAnalysis && (
                    <LoadingAnimation isVisible={true} />
                  )}

                  {!isGeneratingAnalysis && !textAnalysis && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Få en detaljert analyse av hva du gjorde bra og hva du kan forbedre.
                      </p>
                      <Button onClick={generateTextAnalysis} className="bg-blue-600 hover:bg-blue-700">
                        Generer analyse
                      </Button>
                    </div>
                  )}

                  {textAnalysis && !isGeneratingAnalysis && (
                    <div className="space-y-6">
                      {/* Language toggle for analysis */}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant={showAnalysisInNorwegian ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowAnalysisInNorwegian(true)}
                        >
                          <span className="mr-1">🇳🇴</span>
                          Norsk
                        </Button>
                        <Button
                          variant={!showAnalysisInNorwegian ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowAnalysisInNorwegian(false)}
                        >
                          <span className="mr-1">{result.morsmaal ? languages.find(lang => lang.code === result.morsmaal)?.flag : '🌐'}</span>
                          {result.morsmaal ? languages.find(lang => lang.code === result.morsmaal)?.name : 'Morsmål'}
                        </Button>
                      </div>

                      {/* What was good */}
                      <div>
                        <h4 className="text-md font-semibold mb-2">Hva var bra med teksten</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {showAnalysisInNorwegian ? textAnalysis.hva_var_bra : textAnalysis.hva_var_bra_morsmaal}
                          </p>
                        </div>
                      </div>

                      {/* What can be improved */}
                      <div>
                        <h4 className="text-md font-semibold mb-2">Hva kan bli bedre</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => {
                                  const href = props.href || '';
                                  if (href.startsWith('http://') || href.startsWith('https://')) {
                                    return <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />;
                                  }
                                  return <span>{props.children}</span>;
                                },
                              }}
                              disallowedElements={['script', 'iframe', 'object', 'embed', 'form', 'input']}
                              unwrapDisallowed={true}
                            >
                              {showAnalysisInNorwegian ? textAnalysis.hva_kan_bli_bedre : textAnalysis.hva_kan_bli_bedre_morsmaal}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      {/* Word list */}
                      {textAnalysis.ordliste && textAnalysis.ordliste.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold mb-2">Stavefeil</h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-blue-300">
                                    <th className="text-left py-2 px-3 font-semibold text-red-700">Feil</th>
                                    <th className="text-left py-2 px-3 font-semibold text-green-700">Riktig</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {textAnalysis.ordliste.map((ord, index) => (
                                    <tr key={index} className="border-b border-blue-200 last:border-b-0">
                                      <td className="py-2 px-3 text-red-600 font-medium">{ord.feil}</td>
                                      <td className="py-2 px-3 text-green-600 font-medium">{ord.riktig}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {textAnalysis.ordliste && textAnalysis.ordliste.length === 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-700">🎉 Ingen stavefeil funnet!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PDF Download Section */}
                <div className="border-t pt-8 mt-8">
                  <Button
                     onClick={downloadPDF}
                     disabled={isGeneratingPDF}
                     className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 py-6 text-lg"
                   >
                     {isGeneratingPDF ? (
                      <>
                        <span className="animate-spin mr-3">⏳</span>
                        Genererer PDF...
                      </>
                    ) : (
                      <>
                        <span className="mr-3">📄</span>
                        Last ned sammendrag (PDF)
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Confetti isVisible={showConfetti} onComplete={() => setShowConfetti(false)} />
      </div>
    </div>
  )
}

