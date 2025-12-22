"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TypingTextProps {
  text: string
  className?: string
  speed?: number
}

export function TypingText({ text, className, speed = 100 }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed])

  return (
    <span className={cn("inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent", className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
