-- Run this in your Supabase SQL editor

-- Cafes
create table cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id),
  plan text default 'starter' check (plan in ('starter', 'growth', 'pro')),
  location text,
  loyalty_reward_text text,
  created_at timestamptz default now()
);

-- Tables (physical tables in the café)
create table cafe_tables (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid references cafes(id) on delete cascade,
  table_number text not null,
  qr_url text,
  created_at timestamptz default now()
);

-- Submissions (one per customer scan)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  cafe_id text not null,
  table_id text not null,
  submitted_at timestamptz default now(),
  mood text check (mood in ('happy', 'neutral', 'sad')),
  mood_accurate boolean,
  vibe_score integer check (vibe_score between 1 and 5),
  vibe_label text,
  voice_transcript text,
  question text,
  question_answer text,
  ghost_note text,
  receipt_oneliner text
);

-- RLS: owners can only see their own café's submissions
alter table submissions enable row level security;
alter table cafes enable row level security;
alter table cafe_tables enable row level security;

-- Allow service role full access (backend uses service key)
create policy "Service role full access on submissions"
  on submissions for all
  using (true)
  with check (true);

create policy "Service role full access on cafes"
  on cafes for all
  using (true)
  with check (true);

create policy "Service role full access on cafe_tables"
  on cafe_tables for all
  using (true)
  with check (true);
