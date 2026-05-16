create table trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  destination text not null,
  origin text,
  start_date date not null,
  end_date date not null,
  budget integer not null,
  interests text[],
  itinerary jsonb,
  created_at timestamp with time zone default now()
);

alter table trips enable row level security;

create policy "Users can view own trips" on trips for select using (auth.uid() = user_id);
create policy "Users can insert own trips" on trips for insert with check (auth.uid() = user_id);
create policy "Users can delete own trips" on trips for delete using (auth.uid() = user_id);
