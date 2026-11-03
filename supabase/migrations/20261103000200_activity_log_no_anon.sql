-- Visitors have no business with the activity log. RLS already returns no
-- rows to them; this removes table access entirely, like bookings and profiles.
revoke all on public.activity_log from anon;
