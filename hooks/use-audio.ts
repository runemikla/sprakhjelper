'use client'

import { useCallback, useRef, useState } from 'react'

interface UseAudioOptions {
  volume?: number
  loop?: boolean
  preload?: boolean
}

export function useAudio(src: string, options: UseAudioOptions = {}) {
  const { volume = 1, loop = false, preload = true } = options
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize audio element
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      try {
        audioRef.current = new Audio(src)
        audioRef.current.volume = volume
        audioRef.current.loop = loop
        if (preload) {
          audioRef.current.preload = 'auto'
        }

        // Event listeners
        audioRef.current.addEventListener('canplaythrough', () => {
          setIsLoaded(true)
          setError(null)
        })

        audioRef.current.addEventListener('play', () => {
          setIsPlaying(true)
        })

        audioRef.current.addEventListener('pause', () => {
          setIsPlaying(false)
        })

        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false)
        })

        audioRef.current.addEventListener('error', (e) => {
          setError('Failed to load audio')
          setIsLoaded(false)
          console.error('Audio error:', e)
        })
      } catch (err) {
        setError('Failed to create audio element')
        console.error('Audio creation error:', err)
      }
    }
  }, [src, volume, loop, preload])

  const play = useCallback(async () => {
    try {
      if (!audioRef.current) {
        initAudio()
      }

      if (audioRef.current) {
        // Reset to beginning if it has ended
        if (audioRef.current.ended) {
          audioRef.current.currentTime = 0
        }
        
        await audioRef.current.play()
      }
    } catch (err) {
      console.error('Error playing audio:', err)
      setError('Failed to play audio')
    }
  }, [initAudio])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume))
    }
  }, [])

  return {
    play,
    pause,
    stop,
    setVolume,
    isPlaying,
    isLoaded,
    error
  }
}

