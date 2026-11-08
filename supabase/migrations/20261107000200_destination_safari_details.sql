-- =============================================================================
-- Safari details on destinations: the wildlife a visitor may see and the best
-- time to visit. Shown on mainland park pages together with a note that
-- sightings can never be guaranteed.
-- =============================================================================

alter table public.destinations
  add column wildlife text[] not null default '{}'
    constraint destinations_wildlife_size check (cardinality(wildlife) <= 30),
  add column best_time text
    constraint destinations_best_time_length check (char_length(best_time) <= 800);
