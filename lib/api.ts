import axios from 'axios'


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'


console.log('API Base URL:$$$$$$$$', API_BASE_URL);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * API Service Class
 * Centralized API endpoint management
 */
class ApiService {
    // ============================================
    // AUTHENTICATION ENDPOINTS
    // ============================================
    auth = {
        googleLogin: () => {
            window.location.href = `${API_BASE_URL}/api/auth/google`
        },

        getCurrentUser: async () => {
            try {
                const response = await apiClient.get('/api/auth/current-user')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        logout: async () => {
            try {
                const response = await apiClient.get('/api/auth/logout')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // DSA ENDPOINTS
    // ============================================
    dsa = {
        getAll: async (params?: any, config?: any) => {
            try {
                const response = await apiClient.get('/api/dsa', { params, ...config })
                return response.data
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log('Request canceled', error.message);
                    throw error; // Propagate cancel
                }
                throw this._handleError(error)
            }
        },

        getFilters: async () => {
            try {
                const response = await apiClient.get('/api/dsa/filters')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getById: async (id: string) => {
            try {
                const response = await apiClient.get(`/api/dsa/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        run: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/dsa/${id}/run`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        submit: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/dsa/${id}/submit`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getStats: async () => {
            try {
                const response = await apiClient.get('/api/dsa/stats')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        create: async (data: any) => {
            try {
                const response = await apiClient.post('/api/dsa', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        update: async (id: string, data: any) => {
            try {
                const response = await apiClient.put(`/api/dsa/${id}`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        delete: async (id: string) => {
            try {
                const response = await apiClient.delete(`/api/dsa/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // DEVELOPMENT ENDPOINTS
    // ============================================
    development = {
        getAll: async (params?: any) => {
            try {
                const response = await apiClient.get('/api/development', { params })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getById: async (id: string) => {
            try {
                const response = await apiClient.get(`/api/development/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        submit: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/development/${id}/submit`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getStats: async () => {
            try {
                const response = await apiClient.get('/api/development/stats')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        create: async (data: any) => {
            try {
                const response = await apiClient.post('/api/development', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        update: async (id: string, data: any) => {
            try {
                const response = await apiClient.put(`/api/development/${id}`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        delete: async (id: string) => {
            try {
                const response = await apiClient.delete(`/api/development/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // COMPANY ENDPOINTS
    // ============================================
    companies = {
        getAll: async (params?: any) => {
            try {
                const response = await apiClient.get('/api/companies', { params })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getById: async (id: string) => {
            try {
                const response = await apiClient.get(`/api/companies/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        apply: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/companies/${id}/apply`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getMyApplications: async () => {
            try {
                const response = await apiClient.get('/api/companies/applications/my')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        create: async (data: any) => {
            try {
                const response = await apiClient.post('/api/companies', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        update: async (id: string, data: any) => {
            try {
                const response = await apiClient.put(`/api/companies/${id}`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        linkDSA: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/companies/${id}/link-dsa`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        unlinkDSA: async (id: string, linkId: string) => {
            try {
                const response = await apiClient.delete(`/api/companies/${id}/link-dsa/${linkId}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        linkDev: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/companies/${id}/link-dev`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        unlinkDev: async (id: string, linkId: string) => {
            try {
                const response = await apiClient.delete(`/api/companies/${id}/link-dev/${linkId}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        addInterviewQuestion: async (id: string, data: any) => {
            try {
                const response = await apiClient.post(`/api/companies/${id}/interview-question`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        removeInterviewQuestion: async (id: string, questionId: string) => {
            try {
                const response = await apiClient.delete(`/api/companies/${id}/interview-question/${questionId}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        delete: async (id: string) => {
            try {
                const response = await apiClient.delete(`/api/companies/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // MOCK INTERVIEW ENDPOINTS
    // ============================================
    mockInterviews = {
        getQuestions: async (params?: any) => {
            try {
                const response = await apiClient.get('/api/mock-interviews/questions', { params })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        createSession: async (data: any) => {
            try {
                const response = await apiClient.post('/api/mock-interviews/sessions', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getSessions: async (params?: any) => {
            try {
                const response = await apiClient.get('/api/mock-interviews/sessions', { params })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        createQuestion: async (data: any) => {
            try {
                const response = await apiClient.post('/api/mock-interviews/questions', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        updateQuestion: async (id: string, data: any) => {
            try {
                const response = await apiClient.put(`/api/mock-interviews/questions/${id}`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // USER ENDPOINTS
    // ============================================
    user = {
        getProfile: async () => {
            try {
                const response = await apiClient.get('/api/users/profile')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        updateProfile: async (data: any) => {
            try {
                const response = await apiClient.put('/api/users/profile', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getStats: async () => {
            try {
                const response = await apiClient.get('/api/users/stats')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getLeaderboard: async (type = 'xp') => {
            try {
                const response = await apiClient.get('/api/users/leaderboard', { params: { type } })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================
    admin = {
        getDashboard: async () => {
            try {
                const response = await apiClient.get('/api/admin/dashboard')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getStats: async () => {
            try {
                const response = await apiClient.get('/api/admin/stats')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getDSAFilters: async () => {
            try {
                const response = await apiClient.get('/api/admin/filters/dsa')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getDevelopmentFilters: async () => {
            try {
                const response = await apiClient.get('/api/admin/filters/development')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getMockInterviewFilters: async () => {
            try {
                const response = await apiClient.get('/api/admin/filters/mock-interviews')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getCompanyFilters: async () => {
            try {
                const response = await apiClient.get('/api/admin/filters/companies')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getUsers: async (params?: any) => {
            try {
                const response = await apiClient.get('/api/admin/users', { params })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        updateUserRole: async (userId: string, role: string) => {
            try {
                const response = await apiClient.put(`/api/admin/users/${userId}/role`, { role })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        // Mock Interview Management
        mockInterviews: {
            getAll: async (params?: { codingType?: boolean; isActive?: boolean; page?: number; limit?: number }) => {
                try {
                    const response = await apiClient.get('/api/admin/mock-interviews', { params })
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },

            getById: async (id: string) => {
                try {
                    const response = await apiClient.get(`/api/admin/mock-interviews/${id}`)
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },

            create: async (data: any) => {
                try {
                    const response = await apiClient.post('/api/admin/mock-interviews', data)
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },

            update: async (id: string, data: any) => {
                try {
                    const response = await apiClient.put(`/api/admin/mock-interviews/${id}`, data)
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },

            delete: async (id: string) => {
                try {
                    const response = await apiClient.delete(`/api/admin/mock-interviews/${id}`)
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },

            toggleActive: async (id: string) => {
                try {
                    const response = await apiClient.patch(`/api/admin/mock-interviews/${id}/toggle-active`)
                    return response.data
                } catch (error) {
                    throw this._handleError(error)
                }
            },
        },
    }

    // ============================================
    // MOCK INTERVIEWS (PUBLIC)
    // ============================================
    mockInterviews = {
        getAll: async () => {
            try {
                const response = await apiClient.get('/api/mock-interviews')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getById: async (id: string) => {
            try {
                const response = await apiClient.get(`/api/mock-interviews/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // INTERVIEW SESSIONS
    // ============================================
    interviewSessions = {
        start: async (data: { interviewId: string; difficulty?: string; strictness?: number }) => {
            try {
                const response = await apiClient.post('/api/interview-sessions/start', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        updateScore: async (id: string, data: { stage: number; score: number; feedback?: string; transcript?: any }) => {
            try {
                const response = await apiClient.patch(`/api/interview-sessions/${id}/score`, data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        getById: async (id: string) => {
            try {
                const response = await apiClient.get(`/api/interview-sessions/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // ERROR HANDLER
    // ============================================
    _handleError(error: any) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data.message || 'An error occurred',
                status: error.response.status,
            }
        } else if (error.request) {
            return {
                success: false,
                message: 'No response from server. Please check your connection.',
            }
        } else {
            return {
                success: false,
                message: error.message || 'An unexpected error occurred',
            }
        }
    }

    resume = {
        upload: async (formData: FormData) => {
            try {
                const response = await apiClient.post('/api/resume/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        get: async () => {
            try {
                const response = await apiClient.get('/api/resume')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        update: async (id: string, parsedData: any) => {
            try {
                const response = await apiClient.put(`/api/resume/${id}`, { parsedData })
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        delete: async (id: string) => {
            try {
                const response = await apiClient.delete(`/api/resume/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }
}

// Export singleton instance
export const apiService = new ApiService()

// Export axios instance for custom requests
export { apiClient }
