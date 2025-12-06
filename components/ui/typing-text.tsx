"use client"

import { useEffect, useState } from "react"

export function TypingText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)

  useEffect(() => {
    const typingSpeed = isDeleting ? 75 : 150
    const pauseTime = 2000

    const handleType = () => {
      const fullText = text
      
      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), pauseTime)
        return
      }

      if (isDeleting && displayText === "") {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
        return
      }

      setDisplayText(
        isDeleting 
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
      )
    }

    const timer = setTimeout(handleType, typingSpeed)
    return () => clearTimeout(timer)
  }, [displayText, isDeleting, text, loopNum])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
