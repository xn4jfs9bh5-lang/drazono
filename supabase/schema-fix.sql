-- =====================================================
-- DRAZONO — Schema Supabase (CLEAN RESET)
-- Execute this SQL in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- =====================================================
-- STEP 1: DROP EVERYTHING (clean slate)
-- =====================================================

-- Drop trigger first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop all policies on all tables
do $$
declare
  _tbl text;
  _pol record;
begin
  for _tbl in select unnest(array[
    'profiles','vehicles','favorites','alerts',
    'contact_requests','vehicle_views','blog_posts'
  ]) loop
    for _pol in
      select policyname from pg_policies
      where schemaname = 'public' and tablename = _tbl
    loop
      execute format('drop policy if exists %I on public.%I', _pol.policyname, _tbl);
    end loop;
  end loop;
end $$;

-- Drop tables in correct order (children first)
drop table if exists public.vehicle_views cascade;
drop table if exists public.favorites cascade;
drop table if exists public.alerts cascade;
drop table if exists public.contact_requests cascade;
drop table if exists public.blog_posts cascade;
drop table if exists public.vehicles cascade;
drop table if exists public.profiles cascade;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- 1. PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  phone text,
  country text,
  city text,
  role text not null default 'client' check (role in ('client', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 2. VEHICLES
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  year integer not null,
  price_eur numeric not null,
  price_fcfa numeric generated always as (price_eur * 656) stored,
  mileage integer not null default 0,
  fuel_type text not null,
  transmission text not null,
  power text,
  color text,
  seats integer,
  doors integer,
  body_type text not null,
  condition text not null check (condition in ('neuf', 'occasion')),
  description text,
  images jsonb default '[]'::jsonb,
  status text not null default 'disponible' check (status in ('disponible', 'vendu', 'réservé', 'brouillon')),
  views_count integer not null default 0,
  featured boolean not null default false,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. FAVORITES
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_id)
);

-- 4. ALERTS
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand text,
  max_price numeric,
  body_type text,
  fuel_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5. CONTACT REQUESTS
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'received' check (status in ('received', 'vendor_contacted', 'quote_sent', 'waiting_validation', 'confirmed', 'delivered')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. VEHICLE VIEWS
create table public.vehicle_views (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  viewed_at timestamptz not null default now()
);

-- 7. BLOG POSTS
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  cover_image text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- STEP 3: TRIGGER — auto-create profile on signup
-- =====================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- =====================================================

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.favorites enable row level security;
alter table public.alerts enable row level security;
alter table public.contact_requests enable row level security;
alter table public.vehicle_views enable row level security;
alter table public.blog_posts enable row level security;

-- =====================================================
-- STEP 5: RLS POLICIES
-- =====================================================

-- ---- PROFILES ----
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_select_admin"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---- VEHICLES ----
create policy "vehicles_select_public"
  on public.vehicles for select
  using (true);

create policy "vehicles_insert_admin"
  on public.vehicles for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "vehicles_update_admin"
  on public.vehicles for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "vehicles_delete_admin"
  on public.vehicles for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---- FAVORITES ----
create policy "favorites_select_own"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "favorites_delete_own"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ---- ALERTS ----
create policy "alerts_select_own"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "alerts_insert_own"
  on public.alerts for insert
  with check (auth.uid() = user_id);

create policy "alerts_update_own"
  on public.alerts for update
  using (auth.uid() = user_id);

create policy "alerts_delete_own"
  on public.alerts for delete
  using (auth.uid() = user_id);

-- ---- CONTACT REQUESTS ----
create policy "contact_requests_insert_public"
  on public.contact_requests for insert
  with check (true);

create policy "contact_requests_select_own"
  on public.contact_requests for select
  using (auth.uid() = user_id);

create policy "contact_requests_select_admin"
  on public.contact_requests for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "contact_requests_update_admin"
  on public.contact_requests for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---- VEHICLE VIEWS ----
create policy "vehicle_views_insert_public"
  on public.vehicle_views for insert
  with check (true);

create policy "vehicle_views_select_admin"
  on public.vehicle_views for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ---- BLOG POSTS ----
create policy "blog_posts_select_published"
  on public.blog_posts for select
  using (published = true);

create policy "blog_posts_all_admin"
  on public.blog_posts for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- =====================================================
-- DONE! All tables, trigger, and RLS policies created.
-- =====================================================
