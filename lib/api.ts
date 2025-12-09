import axios from 'axios'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * API Service Class
 * Centralized API endpoint management
 * Usage: import { apiService } from '@/lib/api'
 *        const user = await apiService.auth.getCurrentUser()
 */
class ApiService {
    // ============================================
    // AUTHENTICATION ENDPOINTS
    // ============================================
    auth = {
        /**
         * Initiate Google OAuth login
         * Redirects to backend OAuth endpoint
         */
        googleLogin: () => {
            window.location.href = `${API_BASE_URL}/api/auth/google`
        },

        /**
         * Get current authenticated user
         * @returns {Promise<{success: boolean, user: Object}>}
         */
        getCurrentUser: async () => {
            try {
                const response = await apiClient.get('/api/auth/current-user')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        /**
         * Check authentication status
         * @returns {Promise<{success: boolean, isAuthenticated: boolean}>}
         */
        checkAuth: async () => {
            try {
                const response = await apiClient.get('/api/auth/check')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        /**
         * Logout current user
         * @returns {Promise<{success: boolean, message: string}>}
         */
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
    // DSA ENDPOINTS (Example - Add your own)
    // ============================================
    dsa = {
        /**
         * Get all DSA problems
         * @returns {Promise<Array>}
         */
        getAllProblems: async () => {
            try {
                const response = await apiClient.get('/api/dsa/problems')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        /**
         * Get single DSA problem by ID
         * @param {string} id - Problem ID
         * @returns {Promise<Object>}
         */
        getProblemById: async (id) => {
            try {
                const response = await apiClient.get(`/api/dsa/problems/${id}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        /**
         * Submit solution for a problem
         * @param {string} id - Problem ID
         * @param {Object} solution - Solution data
         * @returns {Promise<Object>}
         */
        submitSolution: async (id, solution) => {
            try {
                const response = await apiClient.post(`/api/dsa/problems/${id}/submit`, solution)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // INTERVIEW ENDPOINTS (Example - Add your own)
    // ============================================
    interviews = {
        /**
         * Get all interview questions
         * @param {string} type - Interview type (technical, behavioral, etc.)
         * @returns {Promise<Array>}
         */
        getQuestions: async (type) => {
            try {
                const response = await apiClient.get(`/api/interviews/${type}`)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // USER ENDPOINTS (Example - Add your own)
    // ============================================
    user = {
        /**
         * Get user profile
         * @returns {Promise<Object>}
         */
        getProfile: async () => {
            try {
                const response = await apiClient.get('/api/user/profile')
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },

        /**
         * Update user profile
         * @param {Object} data - Profile data
         * @returns {Promise<Object>}
         */
        updateProfile: async (data) => {
            try {
                const response = await apiClient.put('/api/user/profile', data)
                return response.data
            } catch (error) {
                throw this._handleError(error)
            }
        },
    }

    // ============================================
    // ERROR HANDLER
    // ============================================
    _handleError(error) {
        if (error.response) {
            // Server responded with error
            return {
                success: false,
                message: error.response.data.message || 'An error occurred',
                status: error.response.status,
            }
        } else if (error.request) {
            // Request made but no response
            return {
                success: false,
                message: 'No response from server. Please check your connection.',
            }
        } else {
            // Something else happened
            return {
                success: false,
                message: error.message || 'An unexpected error occurred',
            }
        }
    }
}

// Export singleton instance
export const apiService = new ApiService()

// Export axios instance for custom requests
export { apiClient }
