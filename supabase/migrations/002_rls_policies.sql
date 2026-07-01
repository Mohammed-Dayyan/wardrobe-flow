-- Row Level Security policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wear_history ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY profiles_delete_own ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Clothing items
CREATE POLICY clothing_items_select_own ON clothing_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY clothing_items_insert_own ON clothing_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY clothing_items_update_own ON clothing_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY clothing_items_delete_own ON clothing_items
  FOR DELETE USING (auth.uid() = user_id);

-- Outfits
CREATE POLICY outfits_select_own ON outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY outfits_insert_own ON outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY outfits_update_own ON outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY outfits_delete_own ON outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Outfit items (access via outfit ownership)
CREATE POLICY outfit_items_select_own ON outfit_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY outfit_items_insert_own ON outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY outfit_items_update_own ON outfit_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY outfit_items_delete_own ON outfit_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_items.outfit_id
        AND outfits.user_id = auth.uid()
    )
  );

-- Wear history
CREATE POLICY wear_history_select_own ON wear_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY wear_history_insert_own ON wear_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wear_history_update_own ON wear_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY wear_history_delete_own ON wear_history
  FOR DELETE USING (auth.uid() = user_id);
