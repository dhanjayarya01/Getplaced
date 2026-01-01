import { useQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
    return useQuery({
        queryKey: queryKeys.user.profile(),
        queryFn: () => apiService.user.getProfile(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
    })
}

/**
 * Hook to fetch user stats
 */
export function useUserStats() {
    return useQuery({
        queryKey: queryKeys.user.stats(),
        queryFn: () => apiService.user.getStats(),
        staleTime: 3 * 60 * 1000, // 3 minutes (updates after activity)
        gcTime: 5 * 60 * 1000,
    })
}
