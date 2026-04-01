-- =====================================================
-- DRAZONO — Schema Supabase
-- Execute this SQL in the Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
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

-- RLS: users can read/update their own profile, admin can read all
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admin can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 2. VEHICLES TABLE
create table if not exists public.vehicles (
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

-- RLS: public read, admin write
alter table public.vehicles enable row level security;

create policy "Vehicles are publicly readable"
  on public.vehicles for select
  using (true);

create policy "Admin can insert vehicles"
  on public.vehicles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update vehicles"
  on public.vehicles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can delete vehicles"
  on public.vehicles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 3. FAVORITES TABLE
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, vehicle_id)
);

alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can add favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can remove favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- 4. ALERTS TABLE
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  brand text,
  max_price numeric,
  body_type text,
  fuel_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users can view own alerts"
  on public.alerts for select
  using (auth.uid() = user_id);

create policy "Users can create alerts"
  on public.alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on public.alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on public.alerts for delete
  using (auth.uid() = user_id);

-- 5. CONTACT REQUESTS TABLE
create table if not exists public.contact_requests (
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

alter table public.contact_requests enable row level security;

create policy "Anyone can create contact requests"
  on public.contact_requests for insert
  with check (true);

create policy "Users can view own contact requests"
  on public.contact_requests for select
  using (auth.uid() = user_id);

create policy "Admin can view all contact requests"
  on public.contact_requests for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admin can update contact requests"
  on public.contact_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 6. VEHICLE VIEWS TABLE
create table if not exists public.vehicle_views (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  viewed_at timestamptz not null default now()
);

alter table public.vehicle_views enable row level security;

create policy "Anyone can insert views"
  on public.vehicle_views for insert
  with check (true);

create policy "Admin can view all views"
  on public.vehicle_views for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 7. BLOG POSTS TABLE
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  cover_image text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Published blog posts are publicly readable"
  on public.blog_posts for select
  using (published = true);

create policy "Admin can manage blog posts"
  on public.blog_posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- =====================================================
-- TRIGGER: auto-create profile on signup
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
