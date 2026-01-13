'use client'

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

interface Statistics {
    totalSentences: number
    correctSentences: number
    correctedSentences: number
    correctPercentage: number
}

interface TextViewData {
    text: string
    title: string
    description: string
    bgColor: string
    copyText: string
}

export function useTextStatistics(result: SpraakhjelpperResult | null) {
    const getStatistics = (): Statistics => {
        if (!result?.results) {
            return {
                totalSentences: 0,
                correctSentences: 0,
                correctPercentage: 0,
                correctedSentences: 0
            }
        }

        const totalSentences = result.results.length
        const correctSentences = result.results.filter(s => s.setning_status === 'riktig').length
        const correctedSentences = result.results.filter(s => s.setning_status === 'riktig_2').length
        const totalCorrect = correctSentences + correctedSentences
        const correctPercentage = totalSentences > 0 ? Math.round((totalCorrect / totalSentences) * 100) : 0

        return { totalSentences, correctSentences, correctedSentences, correctPercentage }
    }

    const getCorrectedText = (): string => {
        if (!result?.results) return ''
        return result.results.map(s => s.riktig_setning).join(' ')
    }

    const getUserCorrectedText = (): string => {
        if (!result?.results) return ''
        return result.results.map(s => s.bruker_setning).join(' ')
    }

    const getActiveTextData = (activeTextView: 'original' | 'user'): TextViewData => {
        if (!result) {
            return { text: '', title: '', description: '', bgColor: '', copyText: '' }
        }

        switch (activeTextView) {
            case 'original':
                return {
                    text: result.originalText,
                    title: 'Opprinnelig tekst',
                    description: 'Teksten slik du skrev den først',
                    bgColor: 'bg-gray-50 border-gray-200',
                    copyText: result.originalText
                }
            case 'user': {
                const userText = getUserCorrectedText()
                const hasCorrections = userText !== result.originalText
                return {
                    text: userText,
                    title: 'Din tekst (med dine korrigeringer)',
                    description: hasCorrections
                        ? '💡 Denne teksten oppdateres når du korrigerer setninger'
                        : 'Du har ikke gjort noen korrigeringer ennå',
                    bgColor: 'bg-blue-50 border-blue-200',
                    copyText: userText
                }
            }
            default:
                return { text: '', title: '', description: '', bgColor: '', copyText: '' }
        }
    }

    return {
        getStatistics,
        getCorrectedText,
        getUserCorrectedText,
        getActiveTextData,
    }
}
