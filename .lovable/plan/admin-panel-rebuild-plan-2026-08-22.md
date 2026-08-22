# Admin Panel Rebuild Plan

Delete the existing broken admin implementation and build a professional, stable administration system from scratch for Loner Leather.

## User Review Required

> [!IMPORTANT]
> The permanent owner account `valaverde05@gmail.com` will be granted full access automatically. All other new admin signups will start in a `pending` state and require owner approval.

## Proposed Changes

### 1. Cleanup & Preparation
- Remove all files under `src/routes/admin/`, `src/lib/admin/`, and `src/components/admin*`.
- Ensure public website routes and data (Products, Orders, Customers) remain intact in the database.

### 2. Core Authentication & Security
- **New Admin Layout**: Create a dedicated `AdminLayout` that does not use the public website's header/footer.
- **Central Auth Provider**: Implement `AdminAuthProvider` to manage session states (loading, authenticated, pending, unauthenticated, error).
- **Hardened Access Guard**: Validate admin status against the database `profiles` table linked by Supabase UUID.
- **Owner Auto-Approval**: Hardcode logic to ensure `valaverde05@gmail.com` is always `approved` as `super_admin` and `is_owner`.

### 3. Admin Application Modules
- **Login**: Email + Password first, with stable error handling. Add "Continue with Google" only after basic auth works.
- **Dashboard**: Real-time stats (Sales, Orders, Stock Alerts) using MAD currency.
- **Product Management**: Full CRUD for products, including multi-image uploads to Supabase Storage.
- **Order Management**: Specialized workflow for Cash on Delivery (Confirm, Prepare, Ship, etc.).
- **Customer Management**: Detailed profiles with order history and WhatsApp links.
- **Access Control**: Interface for the owner to manage other admin requests (Approve, Block, Remove).

### 4. Visual Design
- Luxury dark palette: `#241812` (Dark Brown), `#8A4D25` (Leather Brown), `#F7F3EF` (Cream).
- Responsive sidebar: Fixed on desktop, collapsible on tablet, drawer on mobile.

## Technical Details

- **Auth**: Supabase Auth + Database-linked profiles.
- **State Management**: TanStack Query for data, React Context for Admin session.
- **Routing**: TanStack Router with `beforeLoad` guards for all `/admin/*` paths.
- **Components**: shadcn/ui customized with the Loner Leather luxury palette.
- **Validation**: Zod for all form and API inputs.

## Test Plan

1. **Auth Scenarios**:
   - Verify unauthenticated users are redirected to `/admin/login`.
   - Confirm `valaverde05@gmail.com` gains immediate access to `/admin`.
   - Verify session persistence after browser refresh.
   - Test "8-second timeout" for session verification.
2. **Data Integrity**:
   - Verify ALPHA WALLET and existing images appear correctly in the new admin.
   - Test product creation/editing updates the public website instantly.
3. **Responsive Design**:
   - Verify layout stability from 320px to 1920px widths.
