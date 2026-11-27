-- Wall: one-time Supabase setup.
-- Paste this whole file into Supabase > SQL Editor and click Run.
-- Safe to run more than once.

-- 1) Posts table (the brief's SQL, made re-runnable)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  body text check (char_length(body) <= 280),
  created_at timestamptz default now()
);

-- 2) Author name (fixed name, no login) and optional photo
alter table public.posts add column if not exists author_name text not null default 'Genesis Perez';
alter table public.posts add column if not exists image_url text;
alter table public.posts drop constraint if exists posts_not_empty;
alter table public.posts add constraint posts_not_empty
  check (coalesce(btrim(body), '') <> '' or image_url is not null);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- 3) Security: anyone can read and post, nobody can edit or delete
alter table public.posts enable row level security;
drop policy if exists "Anyone can read posts" on public.posts;
create policy "Anyone can read posts" on public.posts
  for select to anon, authenticated using (true);
drop policy if exists "Anyone can create posts" on public.posts;
create policy "Anyone can create posts" on public.posts
  for insert to anon, authenticated
  with check (char_length(author_name) <= 80);

-- 4) Realtime: broadcast new posts to everyone viewing the wall
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end $$;

-- 5) Photo uploads: public bucket "wall-photos", images up to 5 MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wall-photos', 'wall-photos', true, 5242880,
        array['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Anyone can upload wall photos" on storage.objects;
create policy "Anyone can upload wall photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'wall-photos');
