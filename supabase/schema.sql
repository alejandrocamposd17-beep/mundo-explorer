-- Mundo Explorer · favoritos en la nube
-- Ejecuta este script en Supabase → SQL Editor.

create table if not exists public.favorites (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  cca3       text        not null check (cca3 ~ '^[A-Z]{3}$'),
  name       text        not null check (char_length(name) between 1 and 100),
  flag       text        not null check (flag ~ '^https://flagcdn\.com/'),
  region     text        not null check (char_length(region) <= 60),
  created_at timestamptz not null default now(),
  primary key (user_id, cca3)
);

-- Row Level Security: cada usuario solo puede ver y modificar sus propios favoritos
alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "favorites_update_own" on public.favorites;
create policy "favorites_update_own" on public.favorites
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Límite de 100 favoritos por usuario
create or replace function public.favorites_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.favorites where user_id = new.user_id) >= 100 then
    raise exception 'Límite de 100 favoritos alcanzado';
  end if;
  return new;
end;
$$;

drop trigger if exists favorites_limit_trigger on public.favorites;
create trigger favorites_limit_trigger before insert on public.favorites
  for each row execute function public.favorites_limit();
