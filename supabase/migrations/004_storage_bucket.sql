-- Storage bucket for clothing images

INSERT INTO storage.buckets (id, name, public)
VALUES ('clothing-images', 'clothing-images', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY clothing_images_select_own ON storage.objects
  FOR SELECT USING (
    bucket_id = 'clothing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY clothing_images_insert_own ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'clothing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY clothing_images_update_own ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'clothing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY clothing_images_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'clothing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
