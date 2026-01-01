import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
            retry: 1,
            networkMode: 'online',
        },
        mutations: {
            retry: 1,
            networkMode: 'online',
        },
    },
})

export const queryKeys = {
    dsa: {
        all: (filters?: any) => ['dsa', 'problems', filters] as const,
        detail: (id: string) => ['dsa', 'problem', id] as const,
        stats: () => ['dsa', 'stats'] as const,
    },
    companies: {
        all: (filters?: any) => ['companies', filters] as const,
        detail: (id: string) => ['company', id] as const,
    },
    mockInterviews: {
        all: () => ['mockInterviews'] as const,
        detail: (id: string) => ['mockInterview', id] as const,
    },
    development: {
        all: (filters?: any) => ['development', 'problems', filters] as const,
        detail: (id: string) => ['development', 'problem', id] as const,
        stats: () => ['development', 'stats'] as const,
    },
    user: {
        profile: () => ['user', 'profile'] as const,
        stats: () => ['user', 'stats'] as const,
    },
}
