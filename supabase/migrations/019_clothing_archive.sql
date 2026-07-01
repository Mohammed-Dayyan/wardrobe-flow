-- Soft-archive clothing items: hide from wardrobe/picker while preserving outfit history

ALTER TABLE clothing_items
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS clothing_items_user_active_idx
  ON clothing_items (user_id, archived_at)
  WHERE archived_at IS NULL;

CREATE OR REPLACE FUNCTION create_outfit(
  p_date date,
  p_day_type text,
  p_notes text DEFAULT NULL,
  p_top_id uuid DEFAULT NULL,
  p_pants_id uuid DEFAULT NULL,
  p_jacket_id uuid DEFAULT NULL,
  p_shoes_id uuid DEFAULT NULL,
  p_timezone text DEFAULT 'UTC'
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

  IF p_date > user_local_date(p_timezone) THEN
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
    WHERE id = p_top_id AND user_id = v_user_id AND category = 'top' AND archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid top selection';
  END IF;

  IF p_pants_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_pants_id AND user_id = v_user_id AND category = 'pants' AND archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid pants selection';
  END IF;

  IF p_jacket_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_jacket_id AND user_id = v_user_id AND category = 'jacket' AND archived_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid jacket selection';
  END IF;

  IF p_shoes_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items
    WHERE id = p_shoes_id AND user_id = v_user_id AND category = 'shoes' AND archived_at IS NULL
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
    SELECT 1 FROM clothing_items ci
    WHERE ci.id = p_top_id AND ci.user_id = v_user_id AND ci.category = 'top'
      AND (
        ci.archived_at IS NULL
        OR EXISTS (
          SELECT 1 FROM outfit_items oi
          WHERE oi.outfit_id = p_outfit_id AND oi.clothing_item_id = p_top_id
        )
      )
  ) THEN
    RAISE EXCEPTION 'Invalid top selection';
  END IF;

  IF p_pants_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items ci
    WHERE ci.id = p_pants_id AND ci.user_id = v_user_id AND ci.category = 'pants'
      AND (
        ci.archived_at IS NULL
        OR EXISTS (
          SELECT 1 FROM outfit_items oi
          WHERE oi.outfit_id = p_outfit_id AND oi.clothing_item_id = p_pants_id
        )
      )
  ) THEN
    RAISE EXCEPTION 'Invalid pants selection';
  END IF;

  IF p_jacket_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items ci
    WHERE ci.id = p_jacket_id AND ci.user_id = v_user_id AND ci.category = 'jacket'
      AND (
        ci.archived_at IS NULL
        OR EXISTS (
          SELECT 1 FROM outfit_items oi
          WHERE oi.outfit_id = p_outfit_id AND oi.clothing_item_id = p_jacket_id
        )
      )
  ) THEN
    RAISE EXCEPTION 'Invalid jacket selection';
  END IF;

  IF p_shoes_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM clothing_items ci
    WHERE ci.id = p_shoes_id AND ci.user_id = v_user_id AND ci.category = 'shoes'
      AND (
        ci.archived_at IS NULL
        OR EXISTS (
          SELECT 1 FROM outfit_items oi
          WHERE oi.outfit_id = p_outfit_id AND oi.clothing_item_id = p_shoes_id
        )
      )
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

CREATE OR REPLACE FUNCTION get_analytics_snapshot(
  p_month TEXT,
  p_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      (p_month || '-01')::date AS month_start,
      ((p_month || '-01')::date + INTERVAL '1 month')::date AS month_end
  )
  SELECT jsonb_build_object(
    'wardrobe_count', (
      SELECT COUNT(*)::int
      FROM clothing_items
      WHERE user_id = auth.uid() AND archived_at IS NULL
    ),
    'has_outfit_logs', (
      EXISTS (SELECT 1 FROM outfits WHERE user_id = auth.uid())
    ),
    'has_wear_data', (
      EXISTS (SELECT 1 FROM wear_history WHERE user_id = auth.uid())
    ),
    'has_wear_in_month', (
      SELECT EXISTS (
        SELECT 1
        FROM wear_history wh
        CROSS JOIN bounds b
        WHERE wh.user_id = auth.uid()
          AND wh.worn_date >= b.month_start
          AND wh.worn_date < b.month_end
      )
    ),
    'breakdown', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('day_type', day_type, 'count', count)
        ),
        '[]'::jsonb
      )
      FROM get_day_type_breakdown(p_month)
    ),
    'least_worn', jsonb_build_object(
      'all', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_least_worn_items(p_month, NULL, GREATEST(p_limit, 1)) AS t
      ),
      'office', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_least_worn_items(p_month, 'office', GREATEST(p_limit, 1)) AS t
      ),
      'stay_home', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_least_worn_items(p_month, 'stay_home', GREATEST(p_limit, 1)) AS t
      ),
      'travel', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_least_worn_items(p_month, 'travel', GREATEST(p_limit, 1)) AS t
      ),
      'day_out', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_least_worn_items(p_month, 'day_out', GREATEST(p_limit, 1)) AS t
      )
    ),
    'most_worn', jsonb_build_object(
      'all', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items(NULL, p_month, GREATEST(p_limit, 1)) AS t
      ),
      'office', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('office', p_month, GREATEST(p_limit, 1)) AS t
      ),
      'stay_home', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('stay_home', p_month, GREATEST(p_limit, 1)) AS t
      ),
      'travel', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('travel', p_month, GREATEST(p_limit, 1)) AS t
      ),
      'day_out', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('day_out', p_month, GREATEST(p_limit, 1)) AS t
      )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION create_outfit(date, text, text, uuid, uuid, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_outfit(uuid, text, text, uuid, uuid, uuid, uuid) TO authenticated;
