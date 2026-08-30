create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.study_portfolios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.question_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_key text not null,
  week_key text not null,
  scripture_reference text not null,
  question text not null,
  status text not null default 'submitted' check (status in ('submitted','reviewed','answered','archived')),
  instructor_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.study_portfolios enable row level security;
alter table public.question_submissions enable row level security;

create policy "Students manage their own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Students manage their own portfolio" on public.study_portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Students submit and read their own questions" on public.question_submissions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))) on conflict do nothing;
  insert into public.study_portfolios (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

