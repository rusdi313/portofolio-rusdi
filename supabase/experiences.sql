-- Run once in your project's Supabase SQL Editor.
create table if not exists public.experiences (
  id text primary key default gen_random_uuid()::text,
  role text not null,
  company text not null,
  period text not null,
  location text,
  type text,
  current boolean not null default false,
  summary text,
  highlights text[] not null default '{}',
  technologies text[] not null default '{}',
  sort_order integer not null default 0
);

alter table public.experiences enable row level security;
-- Portfolio visitors can read. Editing remains in the Supabase dashboard.
revoke all on public.experiences from anon, authenticated;
grant select on public.experiences to anon, authenticated;
drop policy if exists "Public can read experiences" on public.experiences;
create policy "Public can read experiences"
  on public.experiences for select to anon, authenticated using (true);

-- Enable INSERT, UPDATE and DELETE events without adding the table twice.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'experiences'
  ) then
    alter publication supabase_realtime add table public.experiences;
  end if;
end $$;
