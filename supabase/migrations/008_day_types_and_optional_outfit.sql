-- Wardrobe-context day types + optional outfit items on any day type

UPDATE outfits
SET day_type = 'stay_home'
WHERE day_type IN ('wfh', 'leave', 'holiday');

ALTER TABLE outfits DROP CONSTRAINT IF EXISTS outfits_day_type_check;

ALTER TABLE outfits
  ADD CONSTRAINT outfits_day_type_check
  CHECK (day_type IN ('office', 'stay_home', 'travel', 'day_out'));

CREATE OR REPLACE FUNCTION upsert_outfit(
  p_date date,
  p_day_type text,
  p_notes text DEFAULT NULL,
  p_shirt_id uuid DEFAULT NULL,
  p_pants_id uuid DEFAULT NULL,
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
  v_has_items boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_day_type NOT IN ('office', 'stay_home', 'travel', 'day_out') THEN
    RAISE EXCEPTION 'Invalid day type';
  END IF;

  v_has_items := p_shirt_id IS NOT NULL OR p_pants_id IS NOT NULL OR p_shoes_id IS NOT NULL;

  IF p_day_type = 'office' THEN
    IF p_shirt_id IS NULL OR p_pants_id IS NULL THEN
      RAISE EXCEPTION 'Office days require shirt and pants';
    END IF;
  END IF;

  IF p_shirt_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_shirt_id AND user_id = v_user_id AND category = 'shirt'
  ) THEN
    RAISE EXCEPTION 'Invalid shirt selection';
  END IF;

  IF p_pants_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_pants_id AND user_id = v_user_id AND category = 'pants'
  ) THEN
    RAISE EXCEPTION 'Invalid pants selection';
  END IF;

  IF p_shoes_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_shoes_id AND user_id = v_user_id AND category = 'shoes'
  ) THEN
    RAISE EXCEPTION 'Invalid shoes selection';
  END IF;

  INSERT INTO outfits (user_id, date, day_type, notes)
  VALUES (v_user_id, p_date, p_day_type, NULLIF(TRIM(p_notes), ''))
  ON CONFLICT (user_id, date) DO UPDATE SET
    day_type = EXCLUDED.day_type,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_outfit_id;

  DELETE FROM wear_history WHERE outfit_id = v_outfit_id;
  DELETE FROM outfit_items WHERE outfit_id = v_outfit_id;

  IF p_shirt_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_shirt_id, 'shirt');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_shirt_id, v_outfit_id, p_date);
  END IF;

  IF p_pants_id IS NOT NULL THEN
    INSERT INTO outfit_items (outfit_id, clothing_item_id, role) VALUES
      (v_outfit_id, p_pants_id, 'pants');
    INSERT INTO wear_history (user_id, clothing_item_id, outfit_id, worn_date) VALUES
      (v_user_id, p_pants_id, v_outfit_id, p_date);
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
