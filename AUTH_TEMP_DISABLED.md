# Stack Auth Temporarily Disabled

## Current Status

Stack Auth has been temporarily disabled to allow testing while waiting for proper auth keys.

**Mock User ID:** `43ded5e3-7c58-4219-b4cb-380f5adab974` (phillip)

## Files Modified

### 1. `/middleware.ts`

- **Status:** Entire file commented out
- **Action:** Auth middleware disabled - no redirect to login

### 2. `/app/layout.tsx`

- **Removed:** `StackProvider` and `StackTheme` wrappers
- **Commented imports:** `@stackframe/stack` and `stackClientApp`

### 3. `/app/page.tsx`

- **Mock user:** Using hardcoded user ID instead of `stackServerApp.getUser()`

### 4. `/app/api/user/interests/route.ts`

- **Mock user:** Both GET and POST endpoints use hardcoded user ID

### 5. `/app/api/updateAttempts/route.ts`

- **Mock user:** Using hardcoded user ID instead of Stack Auth

### 6. `/components/UserMenu.tsx`

- **Mock user:** Using hardcoded display name and email
- **Sign out:** Redirects to "/" instead of calling `user.signOut()`

## How to Re-enable Stack Auth

When you receive the proper Stack Auth keys:

1. **Update `.env` file** with real keys:

    ```env
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="<your-key>"
    STACK_SECRET_SERVER_KEY="<your-key>"
    ```

2. **Search for comments** containing "TEMPORARILY DISABLED" across all files:
    - Uncomment the original auth code
    - Remove or comment out the mock user code

3. **Files to update:**
    - Uncomment entire `/middleware.ts`
    - Restore `StackProvider` in `/app/layout.tsx`
    - Restore `stackServerApp.getUser()` in `/app/page.tsx`
    - Restore auth checks in API routes
    - Restore `useUser()` in `/components/UserMenu.tsx`

## Quick Search Commands

```bash
# Find all temporary auth bypasses
grep -r "TEMPORARILY DISABLED" .

# Find all mock user references
grep -r "43ded5e3-7c58-4219-b4cb-380f5adab974" .
```

## Testing Notes

- All routes are now accessible without authentication
- User data will be associated with the mock user ID
- UserMenu displays hardcoded user info
- Sign out just redirects to homepage (no actual sign out)
