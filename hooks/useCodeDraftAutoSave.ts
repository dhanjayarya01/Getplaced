import { useEffect, useRef } from 'react'
import { localCache } from '@/lib/localCache'

export function useCodeDraftAutoSave(
    problemId: string,
    code: string,
    language: string,
    enabled: boolean = true
) {
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!enabled || !problemId || !code) return

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
        }

        saveTimerRef.current = setTimeout(() => {
            localCache.codeDrafts.save(problemId, code, language)
            console.log(`💾 Auto-saved draft for ${problemId}`)
        }, 2000)

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
            }
        }
    }, [code, language, problemId, enabled])

    return {
        loadDraft: () => localCache.codeDrafts.get(problemId),
        deleteDraft: () => localCache.codeDrafts.delete(problemId),
    }
}
