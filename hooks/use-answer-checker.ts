'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { fetchWithTimeout } from '@/lib/fetch-with-timeout'

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

interface UseAnswerCheckerProps {
    result: SpraakhjelpperResult | null
    setResult: (result: SpraakhjelpperResult) => void
    currentSentenceIndex: number
    soundEnabled: boolean
    onSuccess?: () => void
}

export function useAnswerChecker({
    result,
    setResult,
    currentSentenceIndex,
    soundEnabled,
    onSuccess,
}: UseAnswerCheckerProps) {
    const [retryInput, setRetryInput] = useState('')
    const [isCheckingAnswer, setIsCheckingAnswer] = useState(false)

    const currentSentence = result?.results[currentSentenceIndex]

    const handleCheckAnswer = async () => {
        if (!retryInput.trim() || !currentSentence || !result) {
            toast.error('Skriv inn et svar først')
            return
        }

        setIsCheckingAnswer(true)

        try {
            const apiEndpoint = '/api/check-sentence-azure'

            const response = await fetchWithTimeout(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sentence: retryInput.trim(),
                    correctSentence: currentSentence.riktig_setning,
                    morsmaal: result.morsmaal,
                }),
            }, 30000)

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Kunne ikke sjekke svaret')
            }

            // Get the updated sentence from API response
            const updatedSentence = data.bruker_setning || retryInput.trim()

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

            setResult({
                ...result,
                results: updatedResults
            })

            // Update retryInput to reflect the new bruker_setning
            setRetryInput(updatedSentence)

            if (data.er_riktig) {
                toast.success('Riktig! Godt jobbet! 🎉')
                if (soundEnabled && onSuccess) {
                    onSuccess()
                }
            } else {
                toast.info('Se forklaringen for tips!')
            }

            setRetryInput('')
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'En feil oppstod'
            toast.error(`Feil: ${errorMessage}`)
            console.error('Answer check error:', err)
        } finally {
            setIsCheckingAnswer(false)
        }
    }

    return {
        retryInput,
        setRetryInput,
        isCheckingAnswer,
        handleCheckAnswer,
    }
}
