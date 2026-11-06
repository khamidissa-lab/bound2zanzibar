-- =============================================================================
-- "Paid" booking status. Its own migration: a new enum value must be committed
-- before it can be used. The rule that a booking is only marked paid once
-- payments are recorded lives in the next migration.
-- =============================================================================

alter type public.booking_status add value if not exists 'paid' after 'confirmed';
