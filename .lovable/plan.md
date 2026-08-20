# Fix Google OAuth for Loner Leather Admin Panel

The goal is to fix the Google OAuth integration for the admin panel while ensuring the owner (`valaverde05@gmail.com`) is correctly identified and redirected. I will also improve error handling for OAuth failures.

## User Review Required

> [!IMPORTANT]
> Because Google OAuth requires a **Client ID** and **Client Secret** which are sensitive, you must enter them in the Lovable Cloud Auth Settings if you haven't already.

1.  Go to the **Backend** view.
2.  Navigate to **Authentication** > **Sign In Methods** > **Google**.
3.  Ensure **Enable Google** is turned on.
4.  Paste your **Google Client ID** and **Google Client Secret**.
5.  Copy the **Redirect URL** provided by Supabase and add it to your Google Cloud Console's "Authorized redirect URIs".

## Proposed Changes

### 1. Frontend: Error Handling & UX
- Update `src/routes/admin/login.tsx` to handle OAuth errors gracefully.
- Add a state to capture error messages from URL parameters (Supabase appends errors to the URL after a failed OAuth callback).
- Show the message "Google sign-in is temporarily unavailable. Please use email and password or try again later." if a validation or secret error is detected.

### 2. Backend Logic: Owner Enforcement
- Review `src/lib/admin/session.ts` to ensure it correctly identifies `valaverde05@gmail.com` even when signing in via Google.
- Ensure the `profiles` and `user_roles` tables are updated immediately upon first login for the owner.
- The existing logic in `getAdminSession` already handles this, but I will double-check for edge cases.

### 3. Verification
- Use Playwright to simulate the login flow (as much as possible without real Google credentials) and verify that error parameters in the URL trigger the correct user-facing message.

## Technical Details

### `src/routes/admin/login.tsx`
- Add `useEffect` to check for `error` and `error_description` in the URL search params.
- If `error_code=validation_failed` or `error=unsupported_provider`, set a local error state.
- Render the alert message above the login form.

### `src/lib/admin/session.ts`
- The `OWNER_EMAIL` constant is already set to `valaverde05@gmail.com`.
- The `check` function uses `supabase.auth.getSession()` which works for both Email and OAuth sessions.
- The profile sync logic will ensure `is_owner: true` and `role: super_admin` for the owner.
