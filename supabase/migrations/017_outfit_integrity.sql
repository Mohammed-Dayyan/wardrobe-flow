-- Outfit integrity: future dates, concurrency lock, duplicate slots, max-per-day constant
-- Keep max_outfits_per_day in sync with MAX_OUTFITS_PER_DAY in src/features/outfits/constants/outfit-limits.ts

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
  max_outfits_per_day constant integer := 5;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_date > current_date THEN
    RAISE EXCEPTION 'Future dates are not allowed';
  END IF;

  IF p_day_type NOT IN ('office', 'stay_home', 'travel', 'day_out') THEN
    RAISE EXCEPTION 'Invalid day type';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_user_id::text || p_date::text));

  SELECT COUNT(*) INTO v_count
  FROM outfits
  WHERE user_id = v_user_id AND date = p_date;

  IF v_count >= max_outfits_per_day THEN
    RAISE EXCEPTION 'Maximum 5 outfit logs per day';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM outfits o
    WHERE o.user_id = v_user_id
      AND o.date = p_date
      AND o.day_type = p_day_type
      AND COALESCE(
        (SELECT oi.clothing_item_id FROM outfit_items oi WHERE oi.outfit_id = o.id AND oi.role = 'top' LIMIT 1),
        NULL
      ) IS NOT DISTINCT FROM p_top_id
      AND COALESCE(
        (SELECT oi.clothing_item_id FROM outfit_items oi WHERE oi.outfit_id = o.id AND oi.role = 'pants' LIMIT 1),
        NULL
      ) IS NOT DISTINCT FROM p_pants_id
      AND COALESCE(
        (SELECT oi.clothing_item_id FROM outfit_items oi WHERE oi.outfit_id = o.id AND oi.role = 'jacket' LIMIT 1),
        NULL
      ) IS NOT DISTINCT FROM p_jacket_id
      AND COALESCE(
        (SELECT oi.clothing_item_id FROM outfit_items oi WHERE oi.outfit_id = o.id AND oi.role = 'shoes' LIMIT 1),
        NULL
      ) IS NOT DISTINCT FROM p_shoes_id
  ) THEN
    RAISE EXCEPTION 'Duplicate outfit for this day';
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
