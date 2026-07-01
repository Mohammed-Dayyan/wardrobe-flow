-- Profile display name for greetings and sidebar

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT 'User';

UPDATE profiles
SET display_name = 'User'
WHERE display_name IS NULL OR TRIM(display_name) = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''), 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
