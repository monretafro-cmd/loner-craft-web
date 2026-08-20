# Admin Panel Implementation Plan

Rebuild the Loner Leather Admin Panel as a secure, luxury-branded management system.

## 1. Security & Auth Flow
- **Ownership**: `valaverde05@gmail.com` is hardcoded as the permanent Super Admin/Owner.
- **Route Guard**: Mandatory authentication for all `/admin` sub-routes via `src/routes/admin/_shell.tsx` and `requireAdminAuth`.
- **Status Redirection**: 
  - Unauthenticated -> `/admin/login`
  - Pending -> `/admin/pending`
  - Blocked -> Access Denied (Logout)
  - Approved Admin/Owner -> Dashboard
- **Login Methods**: Supabase Auth (Email/Password + Google OAuth).

## 2. Dedicated UI/UX
- **Isolated Layout**: Removed storefront header/footer/floaters for all `/admin` routes.
- **Visual Identity**: Dark brown sidebar (#241812), leather accents (#8A4D25), warm cream background (#F7F3EF).
- **Responsive Workspace**: Sidebar for desktop, drawer for mobile, high-density data tables.

## 3. Core Modules
- **Dashboard**: Real-time sales stats, order summaries, and stock alerts.
- **Products**: Full inventory management with unlimited products and detailed specs.
- **Orders**: Cash on Delivery (COD) workflow with status tracking (New to Delivered).
- **Customers**: Contact info, order history, and relationship tracking.
- **Access Control**: Owner-only interface to approve, block, or promote admin users.
- **Audit Log**: Transparent tracking of all sensitive admin actions.

## Technical Details
- **Framework**: TanStack Start v1 (React 19).
- **Database**: Supabase with Row Level Security (RLS).
- **State**: TanStack Query for efficient data fetching and cache invalidation.
- **Feedback**: Sonner for toast notifications and Lucide for iconography.

