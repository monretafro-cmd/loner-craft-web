# Rebuild Admin Panel

Rebuild the Loner Leather Admin Panel to fix stability issues, simplify the authentication flow, and ensure a premium, dedicated administration interface.

## User Review Required

> [!IMPORTANT]
> This rebuild will replace the existing admin application logic and interface but **strictly preserve all existing data** (products, orders, customers, etc.) in your database.

- **Authentication Logic**: Do you have any additional email addresses that should be auto-promoted to Super Admin besides `valaverde05@gmail.com`?
- **Dashboard Widgets**: Are there any specific analytics or metrics you want prioritized on the main dashboard view?

## Proposed Changes

### 1. Robust Authentication & Session Management
- **Routes**: `/admin/login`, `/admin`, `/admin/pending`.
- **Logic**: Implement a unified session resolver with an 8-second timeout to prevent infinite spinners.
- **Roles**: 
  - `super_admin`: Full access, manages other admins.
  - `admin`: Standard management access.
  - `pending`: Waiting for approval.
  - `blocked/rejected`: Signed out immediately.
- **Auto-Approval**: Maintain `valaverde05@gmail.com` as the auto-promoted Super Admin.

### 2. Dedicated Admin Layout
- **Cleanup**: Remove all public storefront elements (Header, Announcement Bar, Footer, WhatsApp button) from `/admin/*` routes.
- **Desktop**: Fixed 250px dark brown sidebar (`#241812`) with primary navigation.
- **Mobile**: Sliding drawer with a compact top bar.
- **Typography**: Inter for UI controls, Cormorant Garamond for brand headings.

### 3. New Dashboard & Management Interfaces
- **Dashboard**: High-level stats (Revenue, Orders, Customers) + Recent Activity + Stock Alerts.
- **Product Editor**: Unified multi-tab or single-scroll editor for all localized fields, images, and specifications.
- **Order Management**: Detailed order view with status timeline and customer contact actions.
- **Admin Access**: Dedicated management for Super Admins to approve/reject/block team members.

### 4. Technical Improvements
- **Performance**: Skeleton loaders, paginated tables, and optimized database queries.
- **Security**: Strict server-side role validation and RLS enforcement.
- **Reliability**: Explicit error boundaries with "Retry" buttons for all failed requests.

## Technical Details
- **Framework**: TanStack Start v1.
- **Auth**: Supabase Auth (Google & Email/Password).
- **Backend**: Supabase Database & Storage.
- **UI**: Tailwind CSS, Shadcn/UI primitives.
- **State**: React Query for caching and realtime updates.
