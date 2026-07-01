-- Analytics aggregation RPCs (DB-side, user-scoped via auth.uid())

CREATE OR REPLACE FUNCTION get_most_worn_items(
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
  SELECT
    ci.id,
    ci.name,
    ci.category,
    ci.color,
    COUNT(wh.id)::bigint AS wear_count,
    MAX(wh.worn_date) AS last_worn_date,
    COUNT(wh.id) FILTER (
      WHERE wh.worn_date >= date_trunc('month', CURRENT_DATE)::date
        AND wh.worn_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    )::bigint AS wears_this_month
  FROM wear_history wh
  INNER JOIN clothing_items ci
    ON ci.id = wh.clothing_item_id AND ci.user_id = auth.uid()
  INNER JOIN outfits o
    ON o.id = wh.outfit_id AND o.user_id = auth.uid()
  WHERE wh.user_id = auth.uid()
    AND (p_day_type IS NULL OR o.day_type = p_day_type)
  GROUP BY ci.id, ci.name, ci.category, ci.color
  ORDER BY wear_count DESC, last_worn_date DESC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION get_least_worn_items(p_limit INT DEFAULT 10)
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
  SELECT
    ci.id,
    ci.name,
    ci.category,
    ci.color,
    COUNT(wh.id)::bigint AS wear_count,
    MAX(wh.worn_date) AS last_worn_date,
    COUNT(wh.id) FILTER (
      WHERE wh.worn_date >= date_trunc('month', CURRENT_DATE)::date
        AND wh.worn_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
    )::bigint AS wears_this_month
  FROM clothing_items ci
  LEFT JOIN wear_history wh
    ON wh.clothing_item_id = ci.id AND wh.user_id = auth.uid()
  WHERE ci.user_id = auth.uid()
  GROUP BY ci.id, ci.name, ci.category, ci.color, ci.created_at
  ORDER BY wear_count ASC, ci.created_at ASC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION get_day_type_breakdown(p_month TEXT)
RETURNS TABLE (
  day_type TEXT,
  count BIGINT
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
  types AS (
    SELECT unnest(ARRAY['office', 'stay_home', 'travel', 'day_out']::text[]) AS day_type
  ),
  counts AS (
    SELECT o.day_type, COUNT(*)::bigint AS count
    FROM outfits o
    CROSS JOIN bounds b
    WHERE o.user_id = auth.uid()
      AND o.date >= b.month_start
      AND o.date < b.month_end
    GROUP BY o.day_type
  )
  SELECT
    t.day_type,
    COALESCE(c.count, 0)::bigint AS count
  FROM types t
  LEFT JOIN counts c ON c.day_type = t.day_type
  ORDER BY array_position(ARRAY['office', 'stay_home', 'travel', 'day_out'], t.day_type);
$$;

GRANT EXECUTE ON FUNCTION get_most_worn_items(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_least_worn_items(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_day_type_breakdown(TEXT) TO authenticated;
