// Toast Utility Helpers
// Convenient wrappers for common toast patterns

import { toast } from '@/components/ui/use-toast'

/**
 * Show success toast
 */
export function toastSuccess(message: string, title: string = '✅ Success') {
    toast({
        title,
        description: message,
        variant: 'default',
        duration: 3000,
    })
}

/**
 * Show error toast
 */
export function toastError(message: string, title: string = '❌ Error') {
    toast({
        title,
        description: message,
        variant: 'destructive',
        duration: 5000,
    })
}

/**
 * Show warning toast
 */
export function toastWarning(message: string, title: string = '⚠️ Warning') {
    toast({
        title,
        description: message,
        variant: 'default',
        duration: 4000,
    })
}

/**
 * Show info toast
 */
export function toastInfo(message: string, title: string = 'ℹ️ Info') {
    toast({
        title,
        description: message,
        variant: 'default',
        duration: 3000,
    })
}

/**
 * Show loading toast (returns ID for dismissing later)
 */
export function toastLoading(message: string = 'Loading...') {
    return toast({
        title: '⏳ Loading',
        description: message,
        variant: 'default',
        duration: Infinity, // Won't auto-dismiss
    })
}

/**
 * Promise-based toast - shows loading, then success/error
 */
export async function toastPromise<T>(
    promise: Promise<T>,
    messages: {
        loading?: string
        success?: string | ((data: T) => string)
        error?: string | ((error: any) => string)
    }
): Promise<T> {
    const loadingToast = toastLoading(messages.loading || 'Processing...')

    try {
        const data = await promise

        // Dismiss loading toast
        loadingToast.dismiss()

        // Show success
        const successMsg = typeof messages.success === 'function'
            ? messages.success(data)
            : messages.success || 'Success!'
        toastSuccess(successMsg)

        return data
    } catch (error) {
        // Dismiss loading toast
        loadingToast.dismiss()

        // Show error
        const errorMsg = typeof messages.error === 'function'
            ? messages.error(error)
            : messages.error || 'Something went wrong'
        toastError(errorMsg)

        throw error
    }
}

/**
 * Validation error toast - for form errors
 */
export function toastValidation(errors: string[]) {
    toast({
        title: '❌ Validation Error',
        description: (
            <ul className= "list-disc pl-4 space-y-1" >
            {
                errors.map((error, i) => (
                    <li key= { i } > { error } </li>
                ))
}
</ul>
    ),
variant: 'destructive',
    duration: 6000,
  })
}
