-- Split analytics gates: outfit logs vs clothing wear records

CREATE OR REPLACE FUNCTION get_analytics_snapshot(
  p_month TEXT,
  p_limit INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
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
    'breakdown', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object('day_type', day_type, 'count', count)
        ),
        '[]'::jsonb
      )
      FROM get_day_type_breakdown(p_month)
    ),
    'least_worn', (
      SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM get_least_worn_items(GREATEST(p_limit, 1)) AS t
    ),
    'most_worn', jsonb_build_object(
      'all', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items(NULL, GREATEST(p_limit, 1)) AS t
      ),
      'office', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('office', GREATEST(p_limit, 1)) AS t
      ),
      'stay_home', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('stay_home', GREATEST(p_limit, 1)) AS t
      ),
      'travel', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('travel', GREATEST(p_limit, 1)) AS t
      ),
      'day_out', (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
        FROM get_most_worn_items('day_out', GREATEST(p_limit, 1)) AS t
      )
    )
  );
$$;
