CREATE TYPE public.app_role AS ENUM ('super_admin','admin');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "roles readable by admins" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT, name_ar TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 3,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT false,
  cod_available BOOLEAN NOT NULL DEFAULT true,
  whatsapp_ordering BOOLEAN NOT NULL DEFAULT true,
  weight NUMERIC(10,2),
  dimensions TEXT,
  material TEXT,
  leather_type TEXT,
  color TEXT,
  made_in TEXT DEFAULT 'Taroudant, Morocco',
  delivery_time TEXT,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  translations JSONB NOT NULL DEFAULT '{}'::jsonb,
  sold INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  label TEXT,
  is_main BOOLEAN NOT NULL DEFAULT false,
  media_type TEXT NOT NULL DEFAULT 'image',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL,
  option_value TEXT NOT NULL,
  sku TEXT, stock INT NOT NULL DEFAULT 0,
  price NUMERIC(10,2), image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  language TEXT DEFAULT 'fr',
  source TEXT DEFAULT 'website',
  orders_count INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customers_phone_idx ON public.customers (phone);

CREATE TABLE public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label TEXT, address TEXT NOT NULL, city TEXT, region TEXT, postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE SEQUENCE public.order_number_seq START 1001;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('LL-' || nextval('public.order_number_seq')),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  city TEXT NOT NULL,
  region TEXT,
  address TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'new',
  whatsapp_status TEXT NOT NULL DEFAULT 'not_sent',
  whatsapp_attempts INT NOT NULL DEFAULT 0,
  last_whatsapp_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'website',
  language TEXT NOT NULL DEFAULT 'fr',
  customer_notes TEXT,
  admin_notes TEXT,
  assigned_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stock_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_created_idx ON public.orders (created_at DESC);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT, to_status TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'outgoing',
  status TEXT NOT NULL DEFAULT 'sent',
  language TEXT DEFAULT 'fr',
  message TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change INT NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resulting_stock INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2) DEFAULT 0,
  max_uses INT, uses_per_customer INT DEFAULT 1, used_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  city TEXT,
  rating INT NOT NULL DEFAULT 5,
  text TEXT,
  photo_url TEXT,
  language TEXT DEFAULT 'fr',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, phone TEXT, email TEXT,
  subject TEXT, message TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'contact_form',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_admin UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL, region TEXT,
  fee NUMERIC(10,2) NOT NULL DEFAULT 35,
  estimated_time TEXT,
  surcharge NUMERIC(10,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
  link TEXT, read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.homepage_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL, name TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'other',
  mime_type TEXT, size_bytes BIGINT, width INT, height INT,
  alt_text TEXT, usage_location TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_name TEXT,
  action TEXT NOT NULL, page TEXT, record_type TEXT, record_id TEXT,
  old_value JSONB, new_value JSONB, ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','products','product_images','product_variants','customers','customer_addresses','customer_notes','orders','order_items','order_status_history','whatsapp_logs','inventory_history','coupons','reviews','messages','delivery_zones','notifications','homepage_content','site_settings','media','audit_logs']
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "admins read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (public.is_admin(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "admins insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "admins update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "super admins delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (public.has_role(auth.uid(), ''super_admin''))', t);
  END LOOP;
END $$;

GRANT SELECT ON public.products, public.product_images, public.product_variants, public.categories, public.reviews, public.homepage_content, public.site_settings, public.delivery_zones TO anon;
CREATE POLICY "public active products" ON public.products FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "public product images" ON public.product_images FOR SELECT TO anon USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active'));
CREATE POLICY "public variants" ON public.product_variants FOR SELECT TO anon USING (available AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'active'));
CREATE POLICY "public categories" ON public.categories FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "public reviews" ON public.reviews FOR SELECT TO anon USING (status = 'approved');
CREATE POLICY "public homepage" ON public.homepage_content FOR SELECT TO anon USING (active);
CREATE POLICY "public settings" ON public.site_settings FOR SELECT TO anon USING (is_public);
CREATE POLICY "public delivery zones" ON public.delivery_zones FOR SELECT TO anon USING (active);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','categories','products','product_variants','customers','orders','coupons','reviews','messages','delivery_zones','homepage_content','site_settings']
  LOOP
    EXECUTE format('CREATE TRIGGER set_updated_at_%1$s BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

INSERT INTO public.categories (name, name_fr, name_ar, slug, description, status, display_order) VALUES
  ('Wallets','Portefeuilles','المحافظ','wallets','Everyday bifolds cut from full-grain hides.','active',1),
  ('Card Holders','Porte-cartes','حافظات البطاقات','card-holders','Slim carry, hand-burnished edges.','draft',2),
  ('Passport Holders','Porte-passeports','حافظات جوازات السفر','passport-holders','Travel companions built to age well.','draft',3),
  ('Money Clips','Pinces a billets','مشابك النقود','money-clips','Minimal cash carry.','draft',4),
  ('Belts','Ceintures','الأحزمة','belts','Hand-cut leather belts.','draft',5),
  ('Accessories','Accessoires','إكسسوارات','accessories','Small leather goods.','draft',6);

INSERT INTO public.products (name, subtitle, slug, sku, short_description, description, price, stock, category_id, status, featured, material, leather_type, color, dimensions, made_in, delivery_time, seo_title, seo_description, features, tags)
SELECT 'ALPHA WALLET','Handmade Minimalist Leather Wallet','alpha-wallet','LL-ALPHA-001',
 'A slim handmade leather wallet designed for everyday carry, made from genuine Moroccan goat leather.',
 'Discover the Alpha Wallet by Loner Leather. A slim handmade leather wallet designed for everyday carry. Made from genuine Moroccan goat leather using traditional craftsmanship. Compact, elegant, durable, and built to age beautifully.',
 300, 25, c.id, 'active', true,
 'Genuine Moroccan goat leather','Vegetable tanned goat leather','Dark Brown','12 cm x 7.5 cm','Taroudant, Morocco','2-4 days across Morocco',
 'Leather Wallet for Men - Slim Handmade Bifold | Loner Leather',
 'Handmade Moroccan goat leather wallet. Slim, minimalist, cash on delivery across Morocco. 300 MAD.',
 ARRAY['Slim minimalist design','Holds 6-8 cards','2 hidden pockets','Quick access card slot','Hand stitched','Premium Moroccan goat leather','Develops a natural vintage patina over time','Ideal as a personal wallet or gift'],
 ARRAY['wallet','leather','handmade','morocco']
FROM public.categories c WHERE c.slug = 'wallets';

INSERT INTO public.delivery_zones (city, region, fee, estimated_time) VALUES
 ('Casablanca','Casablanca-Settat',35,'24-48h'),
 ('Rabat','Rabat-Sale-Kenitra',35,'24-48h'),
 ('Taroudant','Souss-Massa',25,'24h'),
 ('Marrakech','Marrakech-Safi',35,'24-48h'),
 ('Agadir','Souss-Massa',35,'24-48h'),
 ('Tanger','Tanger-Tetouan-Al Hoceima',40,'2-4 days'),
 ('Fes','Fes-Meknes',40,'2-4 days'),
 ('Meknes','Fes-Meknes',40,'2-4 days'),
 ('Oujda','Oriental',45,'2-4 days'),
 ('Laayoune','Laayoune-Sakia El Hamra',60,'3-5 days');

INSERT INTO public.site_settings (key, value, is_public) VALUES
 ('general','{"store_name":"Loner Leather","phone":"+212 6 61 24 88 03","whatsapp":"212661248803","email":"hello@lonerleather.ma","address":"Quartier El Mellah, Medina, Taroudant 83000, Morocco","city":"Taroudant","country":"Morocco","currency":"MAD","timezone":"Africa/Casablanca"}'::jsonb, true),
 ('delivery','{"default_fee":35,"free_shipping_from":500,"remote_surcharge":20}'::jsonb, true),
 ('whatsapp','{"business_api_enabled":false,"phone":"212661248803","api_token":"","phone_number_id":""}'::jsonb, false),
 ('languages','{"default":"fr","enabled":["ar","fr","en"]}'::jsonb, true),
 ('seo','{"title":"Loner Leather - Handmade Moroccan Leather","description":"Handmade leather that lasts for years."}'::jsonb, true),
 ('social','{"instagram":"https://instagram.com/lonerleather","facebook":"https://facebook.com/lonerleather","tiktok":""}'::jsonb, true),
 ('orders','{"auto_confirm":false,"require_whatsapp_confirmation":true}'::jsonb, false),
 ('security','{"session_timeout_minutes":120,"max_failed_logins":5}'::jsonb, false);

INSERT INTO public.homepage_content (section, content, display_order) VALUES
 ('announcement','{"en":{"text":"Free delivery across Morocco over 500 MAD"},"fr":{"text":"Livraison gratuite au Maroc des 500 MAD"},"ar":{"text":"توصيل مجاني في المغرب ابتداءً من 500 درهم"},"enabled":true}'::jsonb,0),
 ('hero','{"en":{"title":"Handmade Leather That Lasts For Years.","description":"Cut, stitched and finished by hand in Taroudant, Morocco.","primary_cta":"Shop the Alpha Wallet","secondary_cta":"Our Craft"},"fr":{"title":"Du cuir fait main qui dure des annees.","description":"Coupe, cousu et fini a la main a Taroudant, Maroc.","primary_cta":"Decouvrir Alpha Wallet","secondary_cta":"Notre savoir-faire"},"ar":{"title":"جلد مصنوع يدويًا يدوم لسنوات.","description":"يُقص ويُخاط ويُنهى يدويًا في تارودانت، المغرب.","primary_cta":"تسوق محفظة ألفا","secondary_cta":"حرفتنا"},"image_url":""}'::jsonb,1),
 ('trust_badges','{"items":[{"en":"Cash on Delivery","fr":"Paiement a la livraison","ar":"الدفع عند الاستلام"},{"en":"Handmade in Morocco","fr":"Fait main au Maroc","ar":"صناعة يدوية في المغرب"},{"en":"Genuine leather","fr":"Cuir veritable","ar":"جلد أصلي"}]}'::jsonb,2),
 ('craftsmanship','{"en":{"title":"Cut, stitched and inspected by hand","text":"Every wallet leaves our Taroudant workshop after a single pair of hands finishes it."},"fr":{"title":"Coupe, cousu et inspecte a la main","text":"Chaque portefeuille quitte notre atelier de Taroudant apres avoir ete fini par une seule paire de mains."},"ar":{"title":"تُقص وتُخاط وتُفحص يدويًا","text":"كل محفظة تغادر ورشتنا بتارودانت بعد أن ينهيها زوج واحد من الأيدي."}}'::jsonb,3),
 ('packaging','{"en":{"title":"Arrives gift ready","text":"Hand-packed with a thank you card."},"fr":{"title":"Livre pret a offrir","text":"Emballe a la main avec une carte de remerciement."},"ar":{"title":"تصلك جاهزة للإهداء","text":"معبأة يدويًا مع بطاقة شكر."}}'::jsonb,4),
 ('footer','{"en":{"tagline":"Handmade leather goods from Taroudant, Morocco."},"fr":{"tagline":"Maroquinerie faite main a Taroudant, Maroc."},"ar":{"tagline":"منتجات جلدية مصنوعة يدويًا من تارودانت، المغرب."}}'::jsonb,5);