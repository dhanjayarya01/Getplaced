/**
 * LocalStorage Cache Utility
 * For user preferences, code drafts, and small frequently-accessed data
 */

const STORAGE_KEYS = {
    USER_PREFS: 'getplaced:userPrefs',
    DSA_FILTERS: 'getplaced:dsaFilters',
    COMPANY_FILTERS: 'getplaced:companyFilters',
    CODE_DRAFTS: 'getplaced:codeDrafts',
    RECENT_SEARCHES: 'getplaced:recentSearches',
    THEME: 'getplaced:theme',
    LANGUAGE: 'getplaced:language',
}

/**
 * Safe JSON parse with fallback
 */
function safeParse<T>(value: string | null, fallback: T): T {
    if (!value) return fallback
    try {
        return JSON.parse(value)
    } catch {
        return fallback
    }
}

/**
 * User Preferences
 */
export const userPrefs = {
    set: (prefs: any) => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(prefs))
    },
    get: () => {
        return safeParse(localStorage.getItem(STORAGE_KEYS.USER_PREFS), {})
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.USER_PREFS)
    },
}

/**
 * DSA Filters (last used)
 */
export const dsaFilters = {
    set: (filters: any) => {
        localStorage.setItem(STORAGE_KEYS.DSA_FILTERS, JSON.stringify(filters))
    },
    get: () => {
        return safeParse(localStorage.getItem(STORAGE_KEYS.DSA_FILTERS), {})
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.DSA_FILTERS)
    },
}

/**
 * Company Filters (last used)
 */
export const companyFilters = {
    set: (filters: any) => {
        localStorage.setItem(STORAGE_KEYS.COMPANY_FILTERS, JSON.stringify(filters))
    },
    get: () => {
        return safeParse(localStorage.getItem(STORAGE_KEYS.COMPANY_FILTERS), {})
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.COMPANY_FILTERS)
    },
}

/**
 * Code Drafts (auto-save)
 */
export const codeDrafts = {
    save: (problemId: string, code: string, language: string) => {
        const drafts = safeParse<Record<string, any>>(
            localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS),
            {}
        )
        drafts[problemId] = {
            code,
            language,
            timestamp: Date.now(),
        }
        localStorage.setItem(STORAGE_KEYS.CODE_DRAFTS, JSON.stringify(drafts))
    },
    get: (problemId: string) => {
        const drafts = safeParse<Record<string, any>>(
            localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS),
            {}
        )
        return drafts[problemId]
    },
    delete: (problemId: string) => {
        const drafts = safeParse<Record<string, any>>(
            localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS),
            {}
        )
        delete drafts[problemId]
        localStorage.setItem(STORAGE_KEYS.CODE_DRAFTS, JSON.stringify(drafts))
    },
    getAll: () => {
        return safeParse<Record<string, any>>(
            localStorage.getItem(STORAGE_KEYS.CODE_DRAFTS),
            {}
        )
    },
    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.CODE_DRAFTS)
    },
}

/**
 * Recent Searches
 */
export const recentSearches = {
    add: (search: string, type: 'dsa' | 'company' = 'dsa') => {
        const searches = safeParse<Record<string, string[]>>(
            localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
            {}
        )
        if (!searches[type]) searches[type] = []

        // Remove if already exists
        searches[type] = searches[type].filter((s) => s !== search)

        // Add to beginning
        searches[type].unshift(search)

        // Keep only last 10
        searches[type] = searches[type].slice(0, 10)

        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches))
    },
    get: (type: 'dsa' | 'company' = 'dsa') => {
        const searches = safeParse<Record<string, string[]>>(
            localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
            {}
        )
        return searches[type] || []
    },
    clear: (type?: 'dsa' | 'company') => {
        if (type) {
            const searches = safeParse<Record<string, string[]>>(
                localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES),
                {}
            )
            delete searches[type]
            localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches))
        } else {
            localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES)
        }
    },
}

/**
 * Theme
 */
export const theme = {
    set: (theme: 'light' | 'dark' | 'system') => {
        localStorage.setItem(STORAGE_KEYS.THEME, theme)
    },
    get: (): 'light' | 'dark' | 'system' => {
        return (localStorage.getItem(STORAGE_KEYS.THEME) as any) || 'system'
    },
}

/**
 * Language
 */
export const language = {
    set: (lang: string) => {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang)
    },
    get: () => {
        return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en'
    },
}

/**
 * Clear all cache
 */
export const clearAll = () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key)
    })
}

export const localCache = {
    userPrefs,
    dsaFilters,
    companyFilters,
    codeDrafts,
    recentSearches,
    theme,
    language,
    clearAll,
}
