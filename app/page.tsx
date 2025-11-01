'use client'

import { useState, useEffect } from 'react'
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

export default function SpraakhjelpperPage() {
  const [inputValue, setInputValue] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'azure'>('openai')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SpraakhjelpperResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [showNorwegianExplanation, setShowNorwegianExplanation] = useState(true)
  const [retryInput, setRetryInput] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [showForm, setShowForm] = useState(true)
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)
  const [activeTextView, setActiveTextView] = useState<'original' | 'user'>('user')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedLanguage) {
      toast.error('Fyll ut både tekst og morsmål')
      return
    }

    setIsSubmitting(true)
    setShowForm(false)
    setResult(null)
    setError(null)
    setCurrentSentenceIndex(0)
    setRetryInput('')
    setShowSummary(false)
    setActiveTextView('user')
    setShowCorrectAnswer(false)

    try {
      // Choose API endpoint based on selected provider
      const apiEndpoint = selectedProvider === 'azure' ? '/api/spraakhjelper-azure' : '/api/spraakhjelper';
      
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

      setResult(data)
      toast.success('Analyse fullført!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
      setError(errorMessage)
      toast.error(`Feil: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToNext = () => {
    if (result && currentSentenceIndex < result.results.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1)
      setRetryInput('')
      setShowCorrectAnswer(false)
    }
  }

  const goToPrevious = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1)
      setRetryInput('')
      setShowCorrectAnswer(false)
    }
  }

  const showInputForm = () => {
    setShowForm(true)
    setResult(null)
    setError(null)
    setCurrentSentenceIndex(0)
    setRetryInput('')
    setShowSummary(false)
    setActiveTextView('user')
    setShowCorrectAnswer(false)
    localStorage.removeItem('spraakhjelper-result')
  }

  const currentSentence = result?.results[currentSentenceIndex]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Tekst kopiert!')
    } catch (err) {
      toast.error('Kunne ikke kopiere teksten')
    }
  }

  const handleCheckAnswer = () => {
    if (!retryInput.trim() || !currentSentence) {
      toast.error('Skriv inn et svar først')
      return
    }

    setIsCheckingAnswer(true)

    const normalizedRetry = retryInput.trim().toLowerCase().replace(/[.,!?]/g, '')
    const normalizedCorrect = currentSentence.riktig_setning.toLowerCase().replace(/[.,!?]/g, '')
    const isCorrect = normalizedRetry === normalizedCorrect

    if (result) {
      const updatedResults = result.results.map((sentence, index) => {
        if (index === currentSentenceIndex) {
          return {
            ...sentence,
            bruker_setning: retryInput.trim(),
            setning_status: isCorrect ? ('riktig_2' as const) : ('feil' as const),
          }
        }
        return sentence
      })

      setResult({
        ...result,
        results: updatedResults
      })

      if (isCorrect) {
        toast.success('Riktig! Godt jobbet! 🎉')
        if (soundEnabled) {
          successSound.play().catch(error => console.error('Audio error:', error))
        }
      } else {
        toast.error('Ikke helt riktig ennå. Prøv igjen!')
        setShowCorrectAnswer(true)
      }

      setRetryInput('')
    }

    setIsCheckingAnswer(false)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Språkhjelperen</h1>
            </div>
            <p className="text-muted-foreground">
              Skriv inn teksten din og velg ditt morsmål for å få hjelp med norsk.
            </p>
          </div>
          {(result || error) && (
            <Button variant="outline" onClick={showInputForm}>
              Start på nytt
            </Button>
          )}
        </div>
      
      <div className="space-y-8">
        {showForm && (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="provider" className="text-lg font-semibold">Velg AI-leverandør</Label>
                  <Select value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as 'openai' | 'azure')}>
                    <SelectTrigger>
                      <SelectValue>
                        {selectedProvider === 'openai' ? '🤖 OpenAI (GPT-4o)' : '☁️ Azure OpenAI'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">
                        <span className="flex items-center gap-2">
                          <span>🤖</span>
                          <span>OpenAI (GPT-4o)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="azure">
                        <span className="flex items-center gap-2">
                          <span>☁️</span>
                          <span>Azure OpenAI</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                    <SelectContent>
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
                  {isSubmitting ? 'Analyserer...' : 'Analyser tekst'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        <LoadingAnimation isVisible={isSubmitting} />
        
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium text-red-600 mb-2">Feil</h2>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}
        
        {result && result.results && result.results.length > 0 && !showSummary && currentSentence && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tilbakemelding på teksten din</CardTitle>
                  <CardDescription>Bla gjennom setningene dine</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="h-8 w-8 p-0"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Badge variant="outline">
                    {currentSentenceIndex + 1} av {result.results.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-lg font-semibold mb-2">Din setning:</p>
                  <div className={`text-sm rounded-lg p-3 ${
                    currentSentence.setning_status === 'feil' 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    {currentSentence.bruker_setning}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Forslag til forbedringer:</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={showNorwegianExplanation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowNorwegianExplanation(true)}
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      Norsk
                    </Button>
                    <Button
                      variant={!showNorwegianExplanation ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowNorwegianExplanation(false)}
                    >
                      <Languages className="h-3 w-3 mr-1" />
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
                              components={{
                                p: ({ children }) => <span>{children}</span>,
                                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                              }}
                            >
                              {point.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                
                {currentSentence.setning_status === 'feil' && (
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">
                      Kan du prøve å skrive setningen på nytt?
                    </h4>
                    <div className="space-y-3">
                      <Input
                        placeholder="Skriv setningen din på nytt her..."
                        value={retryInput}
                        onChange={(e) => setRetryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && retryInput.trim() && !isCheckingAnswer) {
                            e.preventDefault()
                            handleCheckAnswer()
                          }
                        }}
                      />
                      
                      {showCorrectAnswer && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-800 mb-1">Riktig svar:</p>
                          <p className="text-sm text-green-700">{currentSentence.riktig_setning}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRetryInput('')
                            setShowCorrectAnswer(false)
                          }}
                          disabled={!retryInput.trim()}
                        >
                          Tøm
                        </Button>
                        <div className="flex gap-2">
                          {!showCorrectAnswer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCorrectAnswer(true)}
                            >
                              Vis riktig svar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={handleCheckAnswer}
                            disabled={!retryInput.trim() || isCheckingAnswer}
                          >
                            {isCheckingAnswer ? 'Sjekker...' : 'Sjekk svar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
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
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sammendrag av språkanalysen</CardTitle>
                  <CardDescription>Oversikt over resultatene</CardDescription>
                </div>
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
                    <h3 className="text-lg font-semibold mb-3">{getActiveTextData().title}</h3>
                    <div className={`border rounded-lg p-4 ${getActiveTextData().bgColor}`}>
                      <p className="text-sm leading-relaxed">{getActiveTextData().text}</p>
                    </div>
                    {getActiveTextData().description && (
                      <p className="text-xs text-gray-500 mt-2">{getActiveTextData().description}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                  
                  <div className="space-y-4">
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

