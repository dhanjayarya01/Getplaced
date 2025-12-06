"use client"

import { useEffect, useState } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const codeLines = [
  "function twoSum(nums: number[], target: number): number[] {",
  "  const map = new Map<number, number>();",
  "  ",
  "  for (let i = 0; i < nums.length; i++) {",
  "    const complement = target - nums[i];",
  "    ",
  "    if (map.has(complement)) {",
  "      return [map.get(complement)!, i];",
  "    }",
  "    ",
  "    map.set(nums[i], i);",
  "  }",
  "  ",
  "  return [];",
  "}"
]

function SyntaxHighlight({ line }: { line: string }) {
  const parts = line.split(/(\bfunction\b|\bconst\b|\blet\b|\bfor\b|\bif\b|\breturn\b|\bnew\b|\btwoSum\b|\bMap\b|\bnums\b|\btarget\b|\bmap\b|\bcomplement\b|\bnumber\b|\bget\b|\bhas\b|\bset\b|\blength\b|\d+)/g)
  
  return (
    <div>
      {parts.map((part, i) => {
        if (['function', 'const', 'let', 'for', 'if', 'return', 'new'].includes(part)) {
          return <span key={i} className="text-chart-3">{part}</span>
        }
        if (['twoSum', 'Map'].includes(part)) {
          return <span key={i} className="text-primary">{part}</span>
        }
        if (['nums', 'target', 'map', 'complement'].includes(part)) {
          return <span key={i} className="text-accent">{part}</span>
        }
        if (['number', 'get', 'has', 'set', 'length'].includes(part)) {
          return <span key={i} className="text-chart-5">{part}</span>
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} className="text-accent">{part}</span>
        }
        return <span key={i}>{part}</span>
      })}
    </div>
  )
}

export function CodePreview() {
  const { ref, isVisible } = useScrollAnimation(0.2)
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setVisibleLines(0)
      return
    }

    if (visibleLines < codeLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1)
      }, 200) // 150ms per line - slower and smoother

      return () => clearTimeout(timer)
    }
  }, [isVisible, visibleLines])

  return (
    <div 
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`mt-20 relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
      
      {/* Animated glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl transition-all duration-700 ${
        isVisible ? 'opacity-50 animate-pulse' : 'opacity-0'
      }`} />
      
      <div className="group relative bg-card rounded-2xl border border-border overflow-hidden shadow-2xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-500 hover:scale-105 hover:-translate-y-2">
        <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
          <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full bg-red-500/80 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-0'}`} style={{ transitionDelay: '200ms' }} />
            <div className={`w-3 h-3 rounded-full bg-yellow-500/80 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-0'}`} style={{ transitionDelay: '300ms' }} />
            <div className={`w-3 h-3 rounded-full bg-green-500/80 transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-0'}`} style={{ transitionDelay: '400ms' }} />
          </div>
          <div className={`flex-1 text-center text-sm text-muted-foreground font-mono transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
            two-sum.ts
          </div>
        </div>
        
        <div className="p-6 font-mono text-sm min-h-[320px]">
          <pre className="text-muted-foreground">
            <code>
              {codeLines.slice(0, visibleLines).map((line, i) => (
                <SyntaxHighlight key={i} line={line} />
              ))}
              {visibleLines < codeLines.length && (
                <span className="inline-block w-2 h-5 bg-primary animate-pulse" />
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}
