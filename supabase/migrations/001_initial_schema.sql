-- WardrobeFlow v1 initial schema

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clothing items
CREATE TABLE clothing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shirt', 'pants', 'shoes')),
  color TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX clothing_items_user_id_idx ON clothing_items(user_id);
CREATE INDEX clothing_items_user_id_category_idx ON clothing_items(user_id, category);
CREATE INDEX clothing_items_user_id_created_at_idx ON clothing_items(user_id, created_at DESC);

-- Outfits
CREATE TABLE outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_type TEXT NOT NULL CHECK (day_type IN ('office', 'wfh', 'leave', 'holiday', 'travel')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX outfits_user_id_date_idx ON outfits(user_id, date DESC);

-- Outfit items
CREATE TABLE outfit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('shirt', 'pants', 'shoes')),
  UNIQUE(outfit_id, role)
);

CREATE INDEX outfit_items_outfit_id_idx ON outfit_items(outfit_id);
CREATE INDEX outfit_items_clothing_item_id_idx ON outfit_items(clothing_item_id);

-- Wear history
CREATE TABLE wear_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE RESTRICT,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  worn_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wear_history_user_id_clothing_item_id_worn_date_idx
  ON wear_history(user_id, clothing_item_id, worn_date DESC);
CREATE INDEX wear_history_user_id_worn_date_idx ON wear_history(user_id, worn_date DESC);
CREATE INDEX wear_history_outfit_id_idx ON wear_history(outfit_id);

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER clothing_items_updated_at
  BEFORE UPDATE ON clothing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
