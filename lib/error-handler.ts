
import { toast } from '@/components/ui/use-toast'

// Error message mappings
const ERROR_MESSAGES: Record<string, string> = {
    // Auth errors
    'AUTH_REQUIRED': 'Please sign in to continue',
    'SESSION_EXPIRED': 'Your session expired. Please sign in again',
    'INVALID_CREDENTIALS': 'Invalid email or password',
    'ACCOUNT_LOCKED': 'Account temporarily locked. Try again later',

    // Resource errors
    'NOT_FOUND': 'The requested resource was not found',
    'INTERVIEW_NOT_FOUND': 'Interview not found',
    'PROBLEM_NOT_FOUND': 'Problem not found',
    'SESSION_NOT_FOUND': 'Interview session not found',

    // Permission errors
    'FORBIDDEN': 'You don\'t have permission to perform this action',
    'ADMIN_ONLY': 'This action requires admin privileges',

    // Network errors
    'NETWORK_ERROR': 'Network error. Please check your connection',
    'TIMEOUT': 'Request timed out. Please try again',
    'SERVER_ERROR': 'Server error. Please try again later',

    // Validation errors
    'VALIDATION_ERROR': 'Please check your input and try again',
    'MISSING_FIELDS': 'Please fill in all required fields',
    'INVALID_FORMAT': 'Invalid format. Please check your input',

    // Interview errors
    'VAPI_ERROR': 'Voice interview error. Please refresh and try again',
    'CODE_EXECUTION_ERROR': 'Failed to run code. Please check your syntax',
    'SUBMISSION_ERROR': 'Failed to submit. Please try again',

    // Default
    'UNKNOWN': 'Something went wrong. Please try again'
}

interface ErrorConfig {
    title?: string
    message: string
    variant: 'default' | 'destructive'
    duration?: number
}

class ErrorHandler {
    /**
     * Main error handling function
     * Automatically logs error and shows user-friendly toast
     */
    static handle(error: unknown, context?: string): void {
        const config = this.parseError(error)

        // Log to console with context
        this.logError(error, context)

        // Show toast to user
        toast({
            variant: config.variant,
            title: config.title || '❌ Error',
            description: config.message,
            duration: config.duration || 5000,
        })
    }

    /**
     * Parse error into user-friendly config
     */
    private static parseError(error: unknown): ErrorConfig {
        // Network/Axios errors
        if (this.isAxiosError(error)) {
            return this.handleAxiosError(error)
        }

        // Standard Error objects
        if (error instanceof Error) {
            return {
                message: this.getMessageFromError(error),
                variant: 'destructive',
            }
        }

        // String errors
        if (typeof error === 'string') {
            return {
                message: ERROR_MESSAGES[error] || error,
                variant: 'destructive',
            }
        }

        // Unknown error type
        return {
            message: ERROR_MESSAGES.UNKNOWN,
            variant: 'destructive',
        }
    }

    /**
     * Handle Axios/API errors
     */
    private static handleAxiosError(error: any): ErrorConfig {
        const status = error.response?.status
        const data = error.response?.data
        const message = data?.message || data?.error

        // Map status codes to messages
        switch (status) {
            case 400:
                return {
                    title: 'Invalid Request',
                    message: message || ERROR_MESSAGES.VALIDATION_ERROR,
                    variant: 'destructive',
                }

            case 401:
                return {
                    title: 'Authentication Required',
                    message: ERROR_MESSAGES.AUTH_REQUIRED,
                    variant: 'destructive',
                }

            case 403:
                return {
                    title: 'Access Denied',
                    message: ERROR_MESSAGES.FORBIDDEN,
                    variant: 'destructive',
                }

            case 404:
                return {
                    title: 'Not Found',
                    message: message || ERROR_MESSAGES.NOT_FOUND,
                    variant: 'destructive',
                }

            case 500:
            case 502:
            case 503:
                return {
                    title: 'Server Error',
                    message: ERROR_MESSAGES.SERVER_ERROR,
                    variant: 'destructive',
                }

            default:
                if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
                    return {
                        title: 'Connection Error',
                        message: ERROR_MESSAGES.NETWORK_ERROR,
                        variant: 'destructive',
                    }
                }

                return {
                    message: message || ERROR_MESSAGES.UNKNOWN,
                    variant: 'destructive',
                }
        }
    }

    /**
     * Extract message from Error object
     */
    private static getMessageFromError(error: Error): string {
        // Check if error message matches our predefined messages
        for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.message.includes(key) || error.message.includes(message)) {
                return message
            }
        }

        // Return original message if it's user-friendly
        if (error.message.length < 100 && !error.message.includes('Error:')) {
            return error.message
        }

        return ERROR_MESSAGES.UNKNOWN
    }

    /**
     * Log error to console with context
     */
    private static logError(error: unknown, context?: string): void {
        const prefix = context ? `[${context}]` : '[Error]'

        if (error instanceof Error) {
            console.error(prefix, {
                message: error.message,
                stack: error.stack,
                name: error.name,
            })
        } else {
            console.error(prefix, error)
        }
    }

    /**
     * Check if error is an Axios error
     */
    private static isAxiosError(error: any): boolean {
        return error?.isAxiosError === true || error?.response !== undefined
    }
}

// Export main function
export const handleError = ErrorHandler.handle.bind(ErrorHandler)

// Export for direct use
export default ErrorHandler
