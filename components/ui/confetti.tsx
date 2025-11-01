'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  isVisible: boolean
  onComplete?: () => void
}

interface ConfettiPiece {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  rotation: number
  rotationSpeed: number
  size: number
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

export function Confetti({ isVisible, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    let isMounted = true
    let animationId: number | null = null

    if (isVisible) {
      // Create confetti pieces - doubled amount (100)
      const newPieces: ConfettiPiece[] = []
      for (let i = 0; i < 100; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          vx: (Math.random() - 0.5) * 2.5, // Slower horizontal movement (was 4)
          vy: Math.random() * 2 + 1.5, // Slower vertical movement (was 3 + 2)
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 6, // Slower rotation (was 10)
          size: Math.random() * 8 + 4
        })
      }
      
      setPieces(newPieces)

      // Start animation
      const animate = () => {
        if (!isMounted) return

        setPieces(prevPieces => {
          const updatedPieces = prevPieces.map(piece => ({
            ...piece,
            x: piece.x + piece.vx,
            y: piece.y + piece.vy,
            rotation: piece.rotation + piece.rotationSpeed,
            vy: piece.vy + 0.06 // Weaker gravity for slower fall (was 0.1)
          })).filter(piece => piece.y < window.innerHeight + 20)

          if (updatedPieces.length === 0 && isMounted) {
            // Call onComplete after a short delay to ensure state updates are done
            setTimeout(() => {
              if (isMounted) {
                onComplete?.()
              }
            }, 100)
            return []
          }

          return updatedPieces
        })

        if (isMounted) {
          animationId = requestAnimationFrame(animate)
        }
      }

      animate()
    } else {
      // Clear pieces when not visible
      setPieces([])
    }

    return () => {
      isMounted = false
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isVisible, onComplete])

  if (!isVisible || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: '2px'
          }}
        />
      ))}
    </div>
  )
}
