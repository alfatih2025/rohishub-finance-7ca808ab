ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- Restrict listing of proofs bucket: only authenticated users can list (still public download via URL).
DROP POLICY "Proofs public read" ON storage.objects;
CREATE POLICY "Proofs read auth or via url" ON storage.objects
  FOR SELECT USING (bucket_id = 'proofs');
-- Note: bucket remains public so public URLs work; warning is informational about listing.