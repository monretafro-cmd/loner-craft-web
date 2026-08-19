---
name: Security Posture
description: Overview of the database security architecture and RLS implementation.
type: feature
---
# Security Posture

## Schema Isolation
Sensitive functions are located in the `private` schema to prevent unauthorized execution by public roles.
- `private.has_role`
- `private.is_admin`
- `private.handle_new_user`

## RLS & Policies
- All public tables have RLS enabled.
- `UPDATE` policies include `WITH CHECK` clauses to prevent unauthorized data modification.
- `anon` access is strictly limited to public content (products, categories, homepage content).
- Sensitive tables (`profiles`, `user_roles`, `admin_invitations`) are restricted to `authenticated` and `service_role`.

## Grants
- Explicit `GRANT` statements are included in migrations to ensure PostgREST access.
- `anon` role has `REVOKE` applied to all sensitive internal tables.
