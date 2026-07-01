-- Month-scoped wear analytics; least_worn by day type; has_wear_in_month flag

CREATE OR REPLACE FUNCTION get_most_worn_items(
  p_day_type TEXT DEFAULT NULL,
  p_month TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  color TEXT,
  wear_count BIGINT,
  last_worn_date DATE,
  wears_this_month BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      (p_month || '-01')::date AS month_start,
      ((p_month || '-01')::date + INTERVAL '1 month')::date AS month_end
  )
  SELECT
    ci.id,
    ci.name,
    ci.category,
    ci.color,
    COUNT(wh.id)::bigint AS wear_count,
    MAX(wh.worn_date) AS last_worn_date,
    COUNT(wh.id)::bigint AS wears_this_month
  FROM wear_history wh
  INNER JOIN clothing_items ci
    ON ci.id = wh.clothing_item_id AND ci.user_id = auth.uid()
  INNER JOIN outfits o
    ON o.id = wh.outfit_id AND o.user_id = auth.uid()
  CROSS JOIN bounds b
  WHERE wh.user_id = auth.uid()
    AND wh.worn_date >= b.month_start
    AND wh.worn_date < b.month_end
    AND (p_day_type IS NULL OR o.day_type = p_day_type)
  GROUP BY ci.id, ci.name, ci.category, ci.color
  ORDER BY wear_count DESC, last_worn_date DESC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION get_least_worn_items(
  p_month TEXT,
  p_day_type TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category TEXT,
  color TEXT,
  wear_count BIGINT,
  last_worn_date DATE,
  wears_this_month BIGINT
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  WITH bounds AS (
    SELECT
      (p_month || '-01')::date AS month_start,
      ((p_month || '-01')::date + INTERVAL '1 month')::date AS month_end
  ),
  month_wears AS (
    SELECT
      wh.clothing_item_id,
      COUNT(wh.id)::bigint AS wear_count,
      MAX(wh.worn_date) AS last_worn_date
    FROM wear_history wh
    INNER JOIN outfits o
      ON o.id = wh.outfit_id AND o.user_id = auth.uid()
    CROSS JOIN bounds b
    WHERE wh.user_id = auth.uid()
      AND wh.worn_date >= b.month_start
      AND wh.worn_date < b.month_end
      AND (p_day_type IS NULL OR o.day_type = p_day_type)
    GROUP BY wh.clothing_item_id
  )
  SELECT
    ci.id,
    ci.name,
    ci.category,
    ci.color,
    COALESCE(mw.wear_count, 0)::bigint AS wear_count,
    mw.last_worn_date,
    COALESCE(mw.wear_count, 0)::bigint AS wears_this_month
  FROM clothing_items ci
  LEFT JOIN month_wears mw ON mw.clothing_item_id = ci.id
  WHERE ci.user_id = auth.uid()
  ORDER BY wear_count ASC, ci.created_at ASC
  LIMIT GREATEST(p_limit, 1);
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
      WHERE user_id = auth.uid()
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

GRANT EXECUTE ON FUNCTION get_most_worn_items(TEXT, TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_least_worn_items(TEXT, TEXT, INT) TO authenticated;
