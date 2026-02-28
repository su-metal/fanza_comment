-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Comments table
create table comments (
  id uuid primary key default uuid_generate_v4(),
  work_key text not null,
  t integer not null, -- timestamp in seconds
  text text not null check (char_length(text) <= 120),
  user_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  score integer default 0,
  is_hidden boolean default false,
  client_hash text -- optional for dedup
);

-- Indexes for performance
create index idx_comments_work_key_t on comments(work_key, t);
create index idx_comments_work_key_created_at on comments(work_key, created_at desc);

-- Reports table
create table reports (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid not null references comments(id),
  reporter_user_id uuid not null references auth.users(id),
  reason text,
  created_at timestamptz default now(),
  unique(comment_id, reporter_user_id)
);

-- Likes table (optional but good for sorting)
create table likes (
  comment_id uuid not null references comments(id),
  user_id uuid not null references auth.users(id),
  created_at timestamptz default now(),
  primary key (comment_id, user_id)
);

-- RLS Policies

-- Comments: Everyone can read
alter table comments enable row level security;
create policy "Comments are public" on comments for select using (true);

-- Comments: Authenticated users can insert
create policy "Users can insert their own comments" on comments for insert with check (auth.uid() = user_id);

-- Reports: Authenticated users can insert
alter table reports enable row level security;
create policy "Users can report comments" on reports for insert with check (auth.uid() = reporter_user_id);

-- Likes: Authenticated users can insert/delete
alter table likes enable row level security;
create policy "Users can like comments" on likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike comments" on likes for delete using (auth.uid() = user_id);
