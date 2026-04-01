-- =====================================================
-- DRAZONO — Confirm email + set admin role
-- Execute in Supabase SQL Editor
-- =====================================================

-- 1. Confirm email for tarpaga10@gmail.com
-- This sets email_confirmed_at so login works without clicking the confirmation link
update auth.users
set email_confirmed_at = now(),
    updated_at = now()
where email = 'tarpaga10@gmail.com'
  and email_confirmed_at is null;

-- 2. Make sure a profile exists for this user (in case trigger didn't fire)
insert into public.profiles (id, email, name, role)
select id, email, coalesce(raw_user_meta_data->>'name', 'Brayann'), 'admin'
from auth.users
where email = 'tarpaga10@gmail.com'
on conflict (id) do update set role = 'admin';

-- 3. Verify it worked
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role
from auth.users u
left join public.profiles p on p.id = u.id
where u.email = 'tarpaga10@gmail.com';
