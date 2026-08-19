# Plan: Fix Super Admin Account Access and Route Guards

The goal is to ensure the official Super Admin account (`valaverde05@gmail.com`) can access the admin dashboard directly without being redirected to the "Pending" page. This involves database correction, server-side synchronization logic updates, and frontend route guard hardening.

## User Review Required

> [!IMPORTANT]
> I will be updating the database records for `valaverde05@gmail.com` to ensure it has the `super_admin` role and `approved` status. I will also be modifying the route guards and session logic.

## Proposed Changes

### Database Corrections
- Ensure the profile for `872f1e78-7cc4-434a-b8e5-e9265a688047` (`valaverde05@gmail.com`) has `status = 'approved'`.
- Ensure there is a record in `user_roles` for this UID with `role = 'super_admin'`.
- Remove any duplicate or stale pending profiles if they exist.

### Server-Side Logic (`src/lib/admin/access.functions.ts`)
- Harden `syncAdminAccess` to ensure the initial owner always gets the `super_admin` role and `approved` status on every successful login.
- Add debug logging (temporary) to verify UID and email matches during synchronization.

### Session Management (`src/lib/admin/session.ts`)
- Improve `loadAdminSession` to be more resilient and ensure the role is correctly mapped for the initial owner even during the first few seconds of a session.

### Route Guards (`src/routes/admin/_shell.tsx`)
- Refactor `beforeLoad` to strictly enforce the redirect logic:
  - `approved` + `role` -> Allow access.
  - `pending` -> `/admin/pending`.
  - Otherwise -> `/admin/login`.
- Ensure session verification completes before making redirect decisions.

### Verification
- I will use `lovable auth-session` to sign in as the user in the sandbox.
- I will run a Playwright script to verify that navigating to `/admin` lands on the dashboard and not the pending page.

## Technical Details

### Database Migration
```sql
-- Ensure super_admin role for owner
INSERT INTO public.user_roles (user_id, role)
SELECT '872f1e78-7cc4-434a-b8e5-e9265a688047', 'super_admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure approved status for owner profile
UPDATE public.profiles
SET status = 'approved',
    updated_at = now()
WHERE id = '872f1e78-7cc4-434a-b8e5-e9265a688047';
```

### Route Guard Logic
```typescript
if (!session) throw redirect({ to: "/admin/login" });
if (session.status === "approved" && session.role) return { session };
if (session.status === "pending") throw redirect({ to: "/admin/pending" });
throw redirect({ to: "/admin/login" });
```
