# Plan: Re-implement Loner Leather Admin Panel

Restore the administrative capabilities for the Loner Leather brand, enabling control over orders, products, images, and site settings.

## 1. Authentication & Security
- Implement `src/lib/admin/session.ts` with Supabase auth and an 8-second timeout guard.
- Create `src/routes/admin/login.tsx` for secure entry.
- Implement `src/routes/admin/_shell.tsx` as the main admin route guard (Super Admin check).
- Create `src/routes/admin/pending.tsx` for users awaiting approval.

## 2. Admin UI Components
- **AdminShell**: Layout with responsive sidebar (Desktop) and drawer (Mobile).
- **AdminSidebar**: Dark brown (#241812) theme with links to Dashboard, Orders, Inventory, and Settings.
- **AdminUI**: Shared primitive components for tables, stats cards, and forms.

## 3. Core Admin Routes
- **Dashboard (`/admin`)**: Real-time sales stats, order summaries, and stock alerts.
- **Orders (`/admin/orders`)**: CRUD for customer orders (COD status tracking).
- **Inventory (`/admin/products`)**: Full product management including multi-image uploads and localized descriptions.
- **Site Settings (`/admin/settings`)**: Controls for site-wide content and featured products.
- **Audit Logs (`/admin/logs`)**: Record of all administrative actions.

## 4. Integration
- Connect existing Supabase tables (`products`, `orders`, `profiles`, `audit_logs`) to the new UI.
- Ensure Super Admin role is correctly handled for `valaverde05@gmail.com`.

## Technical Details
- **Theme**: Primary #241812 (Dark Brown), Accents #8A4D25 (Leather Brown), Background #F7F3EF (Warm Cream).
- **Framework**: TanStack Start v1 (React 19).
- **Security**: Supabase RLS policies enforced; admin functions isolated in `private` schema.
