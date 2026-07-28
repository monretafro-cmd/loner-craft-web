DROP POLICY IF EXISTS "public read store files" ON storage.objects;

CREATE POLICY "public read product images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "admins read media files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'media' AND public.is_admin(auth.uid()));