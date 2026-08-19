
-- Tighten grants by revoking unnecessary privileges from anon and authenticated roles
-- Default to locking down tables, then granting specific access where needed by policies

-- Admin Invitations
REVOKE ALL ON public.admin_invitations FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invitations TO authenticated;
GRANT ALL ON public.admin_invitations TO service_role;

-- Audit Logs
REVOKE ALL ON public.audit_logs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- Profiles
REVOKE ALL ON public.profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- User Roles
REVOKE ALL ON public.user_roles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Site Settings
REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

-- Notifications
REVOKE ALL ON public.notifications FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- WhatsApp Logs
REVOKE ALL ON public.whatsapp_logs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_logs TO authenticated;
GRANT ALL ON public.whatsapp_logs TO service_role;

-- Inventory History
REVOKE ALL ON public.inventory_history FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_history TO authenticated;
GRANT ALL ON public.inventory_history TO service_role;

-- Customer Notes
REVOKE ALL ON public.customer_notes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_notes TO authenticated;
GRANT ALL ON public.customer_notes TO service_role;

-- Products
REVOKE ALL ON public.products FROM anon, authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Categories
REVOKE ALL ON public.categories FROM anon, authenticated;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

-- Homepage Content
REVOKE ALL ON public.homepage_content FROM anon, authenticated;
GRANT SELECT ON public.homepage_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_content TO authenticated;
GRANT ALL ON public.homepage_content TO service_role;

-- Reviews
REVOKE ALL ON public.reviews FROM anon, authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- Orders
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Order Items
REVOKE ALL ON public.order_items FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
