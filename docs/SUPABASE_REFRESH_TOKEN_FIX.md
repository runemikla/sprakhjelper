# Supabase Refresh Token Error - Fix Guide

## Problem
**Error**: `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`

This error occurs when:
1. The Supabase session refresh token stored in the browser becomes invalid
2. The middleware is not properly refreshing user sessions
3. There's a mismatch between server and client session state

## Root Cause
The original middleware was missing Supabase session management, causing tokens to expire without being refreshed.

## Solution Applied

### 1. Updated Main Middleware (`/middleware.ts`)
- ✅ Added `updateSession()` call from Supabase middleware
- ✅ Changed function to `async` to handle session updates
- ✅ Session refresh now happens on every request BEFORE other logic

### 2. Enhanced Supabase Middleware (`/lib/supabase/middleware.ts`)
- ✅ Added public paths configuration (/, /api, /auth, /login)
- ✅ Improved authentication logic to not redirect on public routes
- ✅ Prevents unnecessary auth checks on API routes

### 3. Improved Browser Client (`/lib/supabase/client.ts`)
- ✅ Added explicit auth configuration:
  - `autoRefreshToken: true` - Automatically refresh tokens before expiry
  - `persistSession: true` - Keep sessions across page reloads
  - `detectSessionInUrl: true` - Handle OAuth redirects
- ✅ Added auth state change listener for debugging

### 4. Created Session Utilities (`/lib/supabase/session-utils.ts`)
- ✅ `clearInvalidSession()` - Clears corrupted sessions
- ✅ `isSessionValid()` - Checks if current session is valid

## How to Clear the Error Now

### Option 1: Clear Browser Storage (Quickest)
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all localStorage items starting with `sb-`
4. Refresh the page

### Option 2: Use the Utility Function
```typescript
import { clearInvalidSession } from '@/lib/supabase/session-utils'

// Call this when you encounter the error
await clearInvalidSession()
```

### Option 3: Sign Out and Back In
1. Navigate to your logout/sign-out functionality
2. Sign out completely
3. Sign back in with credentials

## Prevention

The fixes applied will prevent this error from happening again by:

1. **Automatic Token Refresh**: Middleware refreshes tokens on every request
2. **Proper Session Management**: Client and server stay in sync
3. **Error Recovery**: Auth state listeners detect and handle token issues
4. **Public Route Handling**: No auth required on public pages

## Testing

To verify the fix is working:

1. ✅ Check browser console - should see "Token refreshed successfully" periodically
2. ✅ Navigate between pages - no auth errors
3. ✅ Leave tab open for 1+ hour - session should auto-refresh
4. ✅ Refresh page - should maintain logged-in state

## Additional Notes

- The middleware now runs on ALL routes (except static assets)
- Session refresh happens server-side in middleware (more secure)
- Client-side auth state is synchronized automatically
- Public routes (/, /api/*) don't require authentication

## If Error Persists

1. Check environment variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

2. Verify Supabase project settings:
   - Auth settings → JWT expiry
   - Auth settings → Refresh token rotation

3. Clear all browser data and restart dev server:
   ```bash
   pnpm dev
   ```

## Files Modified

- ✅ `/middleware.ts` - Added Supabase session refresh
- ✅ `/lib/supabase/middleware.ts` - Improved public route handling
- ✅ `/lib/supabase/client.ts` - Enhanced auth configuration
- ✅ `/lib/supabase/session-utils.ts` - New utility functions
