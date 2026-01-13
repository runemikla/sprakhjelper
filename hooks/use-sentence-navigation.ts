'use client'

import { useState } from 'react'

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

export function useSentenceNavigation(result: SpraakhjelpperResult | null) {
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)

    const goToNext = () => {
        if (result && currentSentenceIndex < result.results.length - 1) {
            setCurrentSentenceIndex(currentSentenceIndex + 1)
        }
    }

    const goToPrevious = () => {
        if (result && currentSentenceIndex > 0) {
            setCurrentSentenceIndex(currentSentenceIndex - 1)
        }
    }

    const currentSentence = result?.results[currentSentenceIndex]

    const canGoNext = result ? currentSentenceIndex < result.results.length - 1 : false
    const canGoPrevious = currentSentenceIndex > 0

    return {
        currentSentenceIndex,
        setCurrentSentenceIndex,
        currentSentence,
        goToNext,
        goToPrevious,
        canGoNext,
        canGoPrevious,
    }
}
