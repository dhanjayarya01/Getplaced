"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Check, RotateCcw, ChevronLeft, Lightbulb, BookOpen, MessageSquare } from "lucide-react"
import Link from "next/link"

interface DSAProblemViewProps {
  problemId: string
}

export function DSAProblemView({ problemId }: DSAProblemViewProps) {
  const [code, setCode] = useState(`function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  
  return [];
}`)
  const [activeTab, setActiveTab] = useState<"problem" | "solution" | "discussion">("problem")

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 border-r border-border overflow-y-auto">
        <div className="p-6">
          <Link
            href="/dsa"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Problems
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold">Two Sum</h1>
            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">Easy</span>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("problem")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "problem" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Problem
            </button>
            <button
              onClick={() => setActiveTab("solution")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "solution"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="w-4 h-4 inline mr-2" />
              Solution
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === "discussion"
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Discussion
            </button>
          </div>

          {activeTab === "problem" && (
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground">
                Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the
                two numbers such that they add up to <code>target</code>.
              </p>
              <p className="text-muted-foreground">
                You may assume that each input would have exactly one solution, and you may not use the same element
                twice.
              </p>
              <p className="text-muted-foreground">You can return the answer in any order.</p>

              <h3 className="text-lg font-semibold mt-6 mb-3">Example 1:</h3>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Input:</span> nums = [2,7,11,15], target = 9
                </div>
                <div>
                  <span className="text-muted-foreground">Output:</span> [0,1]
                </div>
                <div className="text-muted-foreground mt-2">
                  Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-3">Example 2:</h3>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Input:</span> nums = [3,2,4], target = 6
                </div>
                <div>
                  <span className="text-muted-foreground">Output:</span> [1,2]
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-3">Constraints:</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>2 ≤ nums.length ≤ 10⁴</li>
                <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>-10⁹ ≤ target ≤ 10⁹</li>
                <li>Only one valid answer exists.</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Arrays</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Hash Table</span>
              </div>
            </div>
          )}

          {activeTab === "solution" && (
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-muted-foreground mb-4">
                The optimal solution uses a hash map to achieve O(n) time complexity.
              </p>
              <pre className="font-mono text-sm overflow-x-auto">
                {`function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}`}
              </pre>
            </div>
          )}

          {activeTab === "discussion" && (
            <div className="text-muted-foreground">
              <p>Discussion section with community solutions and explanations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">TypeScript</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm overflow-auto">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-transparent resize-none outline-none text-foreground"
            spellCheck={false}
          />
        </div>

        <div className="px-4 py-3 bg-card border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-2" />
            Submit
          </Button>
        </div>

        {/* Test Results */}
        <div className="h-48 bg-card border-t border-border p-4 overflow-y-auto">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium mb-2">Test Results</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Test case 1 passed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Test case 2 passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
