-- Create emissions table for carbon accounting data
create table if not exists public.emissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  category text not null,
  scope integer not null check (scope in (1, 2, 3)),
  quantity numeric not null,
  unit text not null,
  emission_factor numeric not null,
  co2_equivalent numeric not null,
  date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.emissions enable row level security;

-- Create policies for emissions
create policy "emissions_select_own"
  on public.emissions for select
  using (auth.uid() = user_id);

create policy "emissions_insert_own"
  on public.emissions for insert
  with check (auth.uid() = user_id);

create policy "emissions_update_own"
  on public.emissions for update
  using (auth.uid() = user_id);

create policy "emissions_delete_own"
  on public.emissions for delete
  using (auth.uid() = user_id);

-- Create index for better performance
create index if not exists emissions_user_id_idx on public.emissions(user_id);
create index if not exists emissions_date_idx on public.emissions(date);
create index if not exists emissions_scope_idx on public.emissions(scope);
