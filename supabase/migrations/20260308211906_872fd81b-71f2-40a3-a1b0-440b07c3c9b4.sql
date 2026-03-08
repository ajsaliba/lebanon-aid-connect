-- Function to allow any authenticated user to increment heading_count
CREATE OR REPLACE FUNCTION public.increment_heading_count(shelter_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.shelters
  SET heading_count = heading_count + 1
  WHERE id = shelter_id;
END;
$$;

-- Allow any authenticated user to update shelter occupancy (for managers) 
-- and heading_count (for anyone heading there)
-- We need a permissive SELECT policy since all are RESTRICTIVE currently
-- Actually the existing policies are restrictive. Let's add a permissive update policy for heading_count via the function above.
-- The function is SECURITY DEFINER so it bypasses RLS.