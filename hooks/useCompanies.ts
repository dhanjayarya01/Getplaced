import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/lib/api'
import { queryKeys } from '@/lib/queryClient'

/**
 * Hook to fetch all companies with filters
 */
export function useCompanies(filters?: any) {
    return useQuery({
        queryKey: queryKeys.companies.all(filters),
        queryFn: () => apiService.companies.getAll(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
    })
}

/**
 * Hook to fetch single company
 */
export function useCompany(id: string) {
    return useQuery({
        queryKey: queryKeys.companies.detail(id),
        queryFn: () => apiService.companies.getById(id),
        staleTime: 30 * 60 * 1000, // 30 minutes (company data is stable)
        gcTime: 60 * 60 * 1000,
        enabled: !!id,
    })
}

/**
 * Hook to create company (admin)
 */
export function useCreateCompany() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: any) => apiService.companies.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
        },
    })
}

/**
 * Hook to update company (admin)
 */
export function useUpdateCompany() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiService.companies.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: ['companies'] })
        },
    })
}

/**
 * Hook to delete company (admin)
 */
export function useDeleteCompany() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => apiService.companies.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
        },
    })
}

/**
 * Hook to link DSA problem to company
 */
export function useLinkDSA() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiService.companies.linkDSA(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(variables.id) })
        },
    })
}

/**
 * Hook to unlink DSA problem from company
 */
export function useUnlinkDSA() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, linkId }: { id: string; linkId: string }) =>
            apiService.companies.unlinkDSA(id, linkId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(variables.id) })
        },
    })
}
