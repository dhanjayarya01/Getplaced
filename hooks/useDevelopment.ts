import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

/**
 * Hook to fetch all development problems with filters
 */
export function useDevelopmentProblems(filters?: any) {
    return useQuery({
        queryKey: queryKeys.development.all(filters),
        queryFn: () => apiService.development.getAll(filters),
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,
    })
}

/**
 * Hook to fetch single development problem
 */
export function useDevelopmentProblem(id: string) {
    return useQuery({
        queryKey: queryKeys.development.detail(id),
        queryFn: () => apiService.development.getById(id),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000,
        enabled: !!id,
    })
}

/**
 * Hook to fetch development stats
 */
export function useDevelopmentStats() {
    return useQuery({
        queryKey: queryKeys.development.stats(),
        queryFn: () => apiService.development.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
    })
}

/**
 * Hook to submit development solution
 */
export function useSubmitDevelopmentSolution() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiService.development.submit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.development.stats() })
        },
    })
}
