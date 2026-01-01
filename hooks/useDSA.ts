import { useInfiniteQuery } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

/**
 * Hook for infinite scroll DSA problems with filters
 */
export function useInfiniteDSAProblems(filters?: any, searchQuery?: string) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.dsa.all(filters), 'infinite', searchQuery],
        queryFn: async ({ pageParam = 1 }) => {
            const params: any = {
                page: pageParam,
                limit: 20,
                isActive: true,
                search: searchQuery || undefined,
            }

            if (filters?.dataStructures?.length > 0) {
                params.dataStructure = filters.dataStructures.join(',')
            }
            if (filters?.patterns?.length > 0) {
                params.pattern = filters.patterns.join(',')
            }
            if (filters?.difficulties?.length > 0) {
                params.difficulty = filters.difficulties.join(',')
            }
            if (filters?.companies?.length > 0) {
                params.company = filters.companies.join(',')
            }

            const response = await apiService.dsa.getAll(params)
            return response
        },
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination
            if (!pagination) return undefined
            return pagination.page < pagination.pages ? pagination.page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000,
    })
}
