'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Clears the current Supabase session and redirects to login
 * Use this when encountering refresh token errors
 */
export async function clearInvalidSession() {
    const supabase = createClient()

    try {
        // Sign out to clear the invalid session
        await supabase.auth.signOut()

        // Clear any stored auth data
        if (typeof window !== 'undefined') {
            // Clear localStorage items related to Supabase
            const keysToRemove: string[] = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key?.startsWith('sb-')) {
                    keysToRemove.push(key)
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key))
        }

        console.log('Invalid session cleared successfully')
    } catch (error) {
        console.error('Error clearing session:', error)
    }
}

/**
 * Check if the current session is valid
 * Returns true if valid, false if invalid or expired
 */
export async function isSessionValid(): Promise<boolean> {
    const supabase = createClient()

    try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Session validation error:', error.message)
            return false
        }

        return !!session
    } catch (error) {
        console.error('Error checking session:', error)
        return false
    }
}
