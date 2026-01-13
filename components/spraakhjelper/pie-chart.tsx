'use client'

interface Statistics {
    totalSentences: number
    correctSentences: number
    correctedSentences: number
    correctPercentage: number
}

interface PieChartProps {
    statistics: Statistics
}

export function PieChart({ statistics }: Readonly<PieChartProps>) {
    const radius = 45
    const circumference = 2 * Math.PI * radius

    const originalCorrectPercentage = statistics.totalSentences > 0
        ? (statistics.correctSentences / statistics.totalSentences) * 100
        : 0
    const correctedPercentage = statistics.totalSentences > 0
        ? (statistics.correctedSentences / statistics.totalSentences) * 100
        : 0
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
