-- 1. Create new admin-specific tables
CREATE TABLE public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'blocked', 'rejected')),
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    is_owner BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.admin_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_profiles TO authenticated;
GRANT SELECT ON public.admin_profiles TO anon; -- Allow checking status during login
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_access_requests TO authenticated;
GRANT SELECT, INSERT ON public.admin_audit_logs TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 3. Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Admin Profiles: Users can read their own profile, Super Admins can read all
CREATE POLICY "Admins can view their own profile" ON public.admin_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Super Admins can manage all profiles" ON public.admin_profiles
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE id = auth.uid() AND role = 'super_admin' AND status = 'approved'
        )
    );

-- Audit Logs: Only Super Admins can view
CREATE POLICY "Super Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE id = auth.uid() AND role = 'super_admin' AND status = 'approved'
        )
    );

-- 5. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;   
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Clean up old admin structures (keeping products/orders/customers)
DROP TABLE IF EXISTS public.admin_invitations CASCADE;
-- We leave profiles and user_roles for now as they might be used by the public site, 
-- but we move admin logic to admin_profiles.

-- 7. Initial Owner Setup Function
CREATE OR REPLACE FUNCTION public.setup_initial_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'valaverde05@gmail.com' THEN
        INSERT INTO public.admin_profiles (id, email, full_name, status, role, is_owner)
        VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'approved', 'super_admin', true)
        ON CONFLICT (id) DO UPDATE SET
            status = 'approved',
            role = 'super_admin',
            is_owner = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-approve owner on signup
CREATE OR REPLACE TRIGGER on_auth_user_created_owner
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.setup_initial_owner();
