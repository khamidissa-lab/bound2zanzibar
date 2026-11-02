-- =============================================================================
-- BOUND 2 ZANZIBAR — "More details" content for tours
--
-- what_to_expect: [{ "title": string, "description": string }, ...]
-- good_to_know:   practical notes, one per item
-- faqs:           [{ "question": string, "answer": string }, ...]
-- Existing RLS policies on `tours` already cover these columns.
-- =============================================================================

alter table public.tours
  add column what_to_expect jsonb not null default '[]'
    check (jsonb_typeof(what_to_expect) = 'array' and jsonb_array_length(what_to_expect) <= 30),
  add column good_to_know text[] not null default '{}',
  add column faqs jsonb not null default '[]'
    check (jsonb_typeof(faqs) = 'array' and jsonb_array_length(faqs) <= 30);
