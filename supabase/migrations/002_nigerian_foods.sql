create table if not exists public.nigerian_foods (
  id uuid primary key default gen_random_uuid(),
  dish_name text not null,
  local_name text,
  serving_size_g numeric not null,
  calories numeric not null,
  protein_g numeric not null,
  carbs_g numeric not null,
  fat_g numeric not null,
  source_citation text not null,
  verified boolean default false,
  created_at timestamptz default now()
);

alter table public.nigerian_foods enable row level security;

create policy "Anyone can read nigerian_foods"
  on public.nigerian_foods for select
  using (true);

create policy "Authenticated users can insert nigerian_foods"
  on public.nigerian_foods for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update nigerian_foods"
  on public.nigerian_foods for update
  using (auth.role() = 'authenticated');

insert into public.nigerian_foods (dish_name, local_name, serving_size_g, calories, protein_g, carbs_g, fat_g, source_citation, verified)
values ('Jollof Rice', 'Jollof Rice', 100, 144.5, 2.6, 27.5, 2.7,
  'https://www.fitnigerian.com/nutrition-facts/jollof-rice/', true);
