-- Create Authors Table
create table authors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  image_url text,
  elo int default 1200,
  matches_played int default 0,
  created_at timestamptz default now()
);

-- Create Matches Table
create table matches (
  id uuid default uuid_generate_v4() primary key,
  winner_id uuid references authors(id) not null,
  loser_id uuid references authors(id) not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table authors enable row level security;
alter table matches enable row level security;

-- Create Policies (Public Read/Write for MVP - secure later)
create policy "Allow public read access to authors"
on authors for select using (true);

create policy "Allow public insert to matches"
on matches for insert with check (true);

-- (Optional) Update ELO function could be a Postgres function or handled in client for MVP.
