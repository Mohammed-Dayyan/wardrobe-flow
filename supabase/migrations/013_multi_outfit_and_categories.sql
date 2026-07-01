-- Multi-outfit per day + top/jacket categories + create/update/delete by outfit id

ALTER TABLE clothing_items DROP CONSTRAINT IF EXISTS clothing_items_category_check;
ALTER TABLE outfit_items DROP CONSTRAINT IF EXISTS outfit_items_role_check;

UPDATE clothing_items SET category = 'top' WHERE category = 'shirt';
UPDATE outfit_items SET role = 'top' WHERE role = 'shirt';

ALTER TABLE clothing_items
  ADD CONSTRAINT clothing_items_category_check
  CHECK (category IN ('top', 'pants', 'jacket', 'shoes'));

ALTER TABLE outfit_items
  ADD CONSTRAINT outfit_items_role_check
  CHECK (role IN ('top', 'pants', 'jacket', 'shoes'));

ALTER TABLE outfits DROP CONSTRAINT IF EXISTS outfits_user_id_date_key;

CREATE INDEX IF NOT EXISTS outfits_user_id_date_created_at_idx
  ON outfits(user_id, date, created_at DESC);

REVOKE EXECUTE ON FUNCTION upsert_outfit(date, text, text, uuid, uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION delete_outfit(date) FROM authenticated;

DROP FUNCTION IF EXISTS upsert_outfit(date, text, text, uuid, uuid, uuid);
DROP FUNCTION IF EXISTS delete_outfit(date);

CREATE OR REPLACE FUNCTION create_outfit(
  p_date date,
  p_day_type text,
  p_notes text DEFAULT NULL,
  p_top_id uuid DEFAULT NULL,
  p_pants_id uuid DEFAULT NULL,
  p_jacket_id uuid DEFAULT NULL,
  p_shoes_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_outfit_id uuid;
  v_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_day_type NOT IN ('office', 'stay_home', 'travel', 'day_out') THEN
    RAISE EXCEPTION 'Invalid day type';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM outfits
  WHERE user_id = v_user_id AND date = p_date;

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 outfit logs per day';
  END IF;

  IF p_day_type = 'office' THEN
    IF p_top_id IS NULL OR p_pants_id IS NULL THEN
      RAISE EXCEPTION 'Office days require top and pants';
    END IF;
  END IF;

  IF p_top_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_top_id AND user_id = v_user_id AND category = 'top'
  ) THEN
    RAISE EXCEPTION 'Invalid top selection';
  END IF;

  IF p_pants_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_pants_id AND user_id = v_user_id AND category = 'pants'
  ) THEN
    RAISE EXCEPTION 'Invalid pants selection';
  END IF;

  IF p_jacket_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_jacket_id AND user_id = v_user_id AND category = 'jacket'
  ) THEN
    RAISE EXCEPTION 'Invalid jacket selection';
  END IF;

  IF p_shoes_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_shoes_id AND user_id = v_user_id AND category = 'shoes'
  ) THEN
    RAISE EXCEPTION 'Invalid shoes selection';
  END IF;

  INSERT INTO outfits (user_id, date, day_type, notes)
  VALUES (v_user_id, p_date, p_day_type, NULLIF(TRIM(p_notes), ''))
  RETURNING id INTO v_outfit_id;

  IF p_top_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_top_id, 'top');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_top_id, v_outfit_id, p_date);
  END IF;

  IF p_pants_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_pants_id, 'pants');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_pants_id, v_outfit_id, p_date);
  END IF;

  IF p_jacket_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_jacket_id, 'jacket');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_jacket_id, v_outfit_id, p_date);
  END IF;

  IF p_shoes_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_shoes_id, 'shoes');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_shoes_id, v_outfit_id, p_date);
  END IF;

  RETURN v_outfit_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_outfit(
  p_outfit_id uuid,
  p_day_type text,
  p_notes text DEFAULT NULL,
  p_top_id uuid DEFAULT NULL,
  p_pants_id uuid DEFAULT NULL,
  p_jacket_id uuid DEFAULT NULL,
  p_shoes_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_date date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT date INTO v_date
  FROM outfits
  WHERE id = p_outfit_id AND user_id = v_user_id;

  IF v_date IS NULL THEN
    RAISE EXCEPTION 'Outfit not found';
  END IF;

  IF p_day_type NOT IN ('office', 'stay_home', 'travel', 'day_out') THEN
    RAISE EXCEPTION 'Invalid day type';
  END IF;

  IF p_day_type = 'office' THEN
    IF p_top_id IS NULL OR p_pants_id IS NULL THEN
      RAISE EXCEPTION 'Office days require top and pants';
    END IF;
  END IF;

  IF p_top_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_top_id AND user_id = v_user_id AND category = 'top'
  ) THEN
    RAISE EXCEPTION 'Invalid top selection';
  END IF;

  IF p_pants_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_pants_id AND user_id = v_user_id AND category = 'pants'
  ) THEN
    RAISE EXCEPTION 'Invalid pants selection';
  END IF;

  IF p_jacket_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_jacket_id AND user_id = v_user_id AND category = 'jacket'
  ) THEN
    RAISE EXCEPTION 'Invalid jacket selection';
  END IF;

  IF p_shoes_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_shoes_id AND user_id = v_user_id AND category = 'shoes'
  ) THEN
    RAISE EXCEPTION 'Invalid shoes selection';
  END IF;

  UPDATE outfits
  SET day_type = p_day_type,
      notes = NULLIF(TRIM(p_notes), ''),
      updated_at = NOW()
  WHERE id = p_outfit_id AND user_id = v_user_id;

  DELETE FROM wear_history WHERE outfit_id = p_outfit_id;
  DELETE FROM outfit_items WHERE outfit_id = p_outfit_id;

  IF p_top_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (p_outfit_id, p_top_id, 'top');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_top_id, p_outfit_id, v_date);
  END IF;

  IF p_pants_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (p_outfit_id, p_pants_id, 'pants');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_pants_id, p_outfit_id, v_date);
  END IF;

  IF p_jacket_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (p_outfit_id, p_jacket_id, 'jacket');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_jacket_id, p_outfit_id, v_date);
  END IF;

  IF p_shoes_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (p_outfit_id, p_shoes_id, 'shoes');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_shoes_id, p_outfit_id, v_date);
  END IF;

  RETURN p_outfit_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_outfit_by_id(p_outfit_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM outfits WHERE id = p_outfit_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Outfit not found';
  END IF;

  DELETE FROM wear_history WHERE outfit_id = p_outfit_id;
  DELETE FROM outfit_items WHERE outfit_id = p_outfit_id;
  DELETE FROM outfits WHERE id = p_outfit_id AND user_id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_outfit(date, text, text, uuid, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_outfit(uuid, text, text, uuid, uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_outfit_by_id(uuid) TO authenticated;
