-- Function to get random photos for the background
-- SECURITY DEFINER allows this to run with privileges of the owner,
-- bypassing RLS for the 'photos' table so it works on the Lock Screen.

CREATE OR REPLACE FUNCTION get_random_background_photos(limit_count int)
RETURNS TABLE (storage_path text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.storage_path
  FROM photos p
  ORDER BY random()
  LIMIT limit_count;
END;
$$;

-- Grant execution to everyone (public/anon) so the landing page can use it
GRANT EXECUTE ON FUNCTION get_random_background_photos(int) TO anon, authenticated, service_role;
