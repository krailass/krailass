-- ============================================================================
-- Janitor 4-digit PIN login.
-- The PIN is stored on the profile (admin must be able to view it) and mirrored
-- into a derived Supabase Auth password (server-only) so PIN sign-in works.
-- ============================================================================
alter table public.profiles add column if not exists pin text;

-- Unique across the system (nullable => admins keep NULL; multiple NULLs allowed).
create unique index if not exists profiles_pin_unique on public.profiles(pin) where pin is not null;

-- Column-level protection: end users may NOT read the pin column (only the
-- service role, used by admin routes, can). Client selects must list explicit
-- columns (never select *). This keeps one janitor from reading others' PINs.
revoke select (pin) on public.profiles from anon, authenticated;
