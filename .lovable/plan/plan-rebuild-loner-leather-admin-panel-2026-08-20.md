# Plan - Rebuild Loner Leather Admin Panel

Rebuild the Admin Panel as a secure, standalone ecommerce management system with dedicated layouts, robust authentication (Google/Email), and specialized workflows for Cash on Delivery (COD) and inventory management.

## User Review Required

> [!IMPORTANT]
> The admin panel will be completely separate from the public storefront. The owner account `valaverde05@gmail.com` will be hardcoded as the permanent Super Admin.

- **Authentication**: Users must log in via `/admin/login`. Unauthorized access to `/admin` routes will redirect to login.
- **Workflow**: New admins start as "Pending" and must be approved by the Owner.
- **Features**: Complete management for Products, Orders (COD focus), Customers, and Site Content.

## Proposed Changes

### Database & Security
- Ensure `profiles` table has `is_owner`, `status` (pending, approved, blocked), and `role` fields.
- Hardcode logic for `valaverde05@gmail.com` to always be `approved`, `super_admin`, and `is_owner`.
- Implement RLS policies to restrict admin data (Orders, Customers, Audit Logs) to approved admin/super_admin roles only.

### Admin Infrastructure
- **Layout**: Create `AdminLayout.tsx` and `AdminSidebar.tsx` with a dark leather theme (#241812).
- **Navigation**: Remove all public site headers/footers from `/admin/*` routes.
- **Auth Guard**: Update `_shell.tsx` to strictly enforce authentication and approval states.

### Core Modules
- **Dashboard**: Interactive stats (Sales, Orders, Stock) using MAD (Moroccan Dirham).
- **Product Manager**: Multi-image upload, reordering, and detailed attributes (Leather Type, SKU, etc.).
- **Order System**: Dedicated COD workflow with statuses (New, Confirmed, Shipped, etc.) and WhatsApp integration.
- **Customer CRM**: History, spending totals, and internal notes.
- **Site Manager**: Live editing of Hero sections, Shop visibility, and FAQs.

### Admin Tools
- **Audit Log**: Track all sensitive actions (price changes, status updates).
- **Access Control**: Interface for the Owner to manage other admin requests.
- **Settings**: Store-wide defaults (Maintenance mode, Delivery fees for Morocco).

## Technical Details

- **Framework**: TanStack Start with file-based routing.
- **Database**: Supabase with RLS.
- **UI**: Shadcn UI components customized with the leather brand palette.
- **Validation**: Zod for all form inputs.
- **State**: React Query for data fetching and synchronization.
