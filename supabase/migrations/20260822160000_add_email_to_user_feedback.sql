alter table if exists public.user_feedback
  add column if not exists email text;
