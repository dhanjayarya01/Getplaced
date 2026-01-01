import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

/**
 * Hook to fetch all mock interviews
 */
export function useMockInterviews() {
    return useQuery({
        queryKey: queryKeys.mockInterviews.all(),
        queryFn: () => apiService.mockInterviews.getAll(),
        staleTime: 15 * 60 * 1000, // 15 minutes (very stable)
        gcTime: 30 * 60 * 1000,
    })
}

/**
 * Hook to fetch single mock interview
 */
export function useMockInterview(id: string) {
    return useQuery({
        queryKey: queryKeys.mockInterviews.detail(id),
        queryFn: () => apiService.mockInterviews.getById(id),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000,
        enabled: !!id,
    })
}

/**
 * Hook to create mock interview session
 */
export function useCreateMockSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: any) => apiService.mockInterviews.createSession(data),
        onSuccess: () => {
            // Sessions are user-specific, might want to invalidate user stats
            queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() })
        },
    })
}
