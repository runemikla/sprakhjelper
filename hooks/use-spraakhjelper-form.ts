'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

interface SplitSentence {
    original: string
    corrected: string
}

interface SplitSentencesResult {
    success: boolean
    sentences: SplitSentence[]
    sentenceCount: number
    morsmaal: string
    originalText: string
    provider?: string
}

interface SentenceResult {
    bruker_setning: string
    riktig_setning: string
    forklaring: string
    forklaring_morsmaal: string
    setning_status?: 'riktig' | 'riktig_2' | 'feil'
    sentence_id?: string
}

interface SpraakhjelpperResult {
    success: boolean
    submissionId: string
    results: SentenceResult[]
    morsmaal: string
    originalText: string
    savedToDatabase?: boolean
    isLocal?: boolean
}

export function useSpraakhjelpperForm() {
    const [inputValue, setInputValue] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Split sentences state
    const [splitResult, setSplitResult] = useState<SplitSentencesResult | null>(null)
    const [showSplitOverview, setShowSplitOverview] = useState(false)
    const [editableSentences, setEditableSentences] = useState<string[]>([])

    // Analysis result
    const [result, setResult] = useState<SpraakhjelpperResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Step 1: Split text into sentences
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim() || !selectedLanguage) {
            toast.error('Fyll ut både tekst og morsmål')
            return
        }

        setIsSubmitting(true)
        setShowSplitOverview(false)
        setSplitResult(null)
        setResult(null)
        setError(null)

        try {
            const apiEndpoint = '/api/split-sentences-azure'

            const response = await fetchWithTimeout(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputValue.trim(),
                    morsmaal: selectedLanguage,
                }),
            }, 30000)

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            setSplitResult(data)
            setEditableSentences(data.sentences.map((s: SplitSentence) => s.corrected))
            setShowSplitOverview(true)
            toast.success('Teksten er delt inn i setninger!')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
            setError(errorMessage)
            toast.error(`Feil: ${errorMessage}`)
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

        try {
            const apiEndpoint = '/api/spraakhjelper-azure'

            // Use the editable sentences from user input
            const textToAnalyze = editableSentences.join(' ')

            const response = await fetchWithTimeout(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToAnalyze,
                    morsmaal: splitResult.morsmaal,
                }),
            }, 60000)

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
            setShowSplitOverview(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        // Clear all sessionStorage data
        sessionStorage.clear()
        // Refresh the page to reset everything
        globalThis.location.reload()
    }

    return {
        // Form state
        inputValue,
        setInputValue,
        selectedLanguage,
        setSelectedLanguage,
        isSubmitting,

        // Split state
        splitResult,
        showSplitOverview,
        setShowSplitOverview,
        editableSentences,
        setEditableSentences,

        // Result state
        result,
        setResult,
        error,

        // Actions
        handleSubmit,
        handleAnalyze,
        resetForm,
    }
}
