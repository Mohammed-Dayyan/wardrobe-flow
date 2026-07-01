-- Least worn excludes items already in the most-worn set for the same month and day-type filter.

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
  ),
  most_worn_ids AS (
    SELECT m.id
    FROM get_most_worn_items(p_day_type, p_month, GREATEST(p_limit, 1)) AS m
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
    AND ci.id NOT IN (SELECT id FROM most_worn_ids)
  ORDER BY wear_count ASC, ci.created_at ASC
  LIMIT GREATEST(p_limit, 1);
$$;
