-- DJFL 4 shared database. Paste this whole file into the Supabase SQL editor and run it once.
-- Four small tables: the roster and units, the schedule, attendance marks, and every play.

create table if not exists djfl_config (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists djfl_events (
  id          text primary key,
  type        text not null,
  team        text,
  date        text not null,
  opponent    text not null default '',
  half        integer,
  final       boolean not null default false,
  deleted     boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table if not exists djfl_attendance (
  event_id    text not null,
  player_id   text not null,
  present     boolean not null default true,
  updated_at  timestamptz not null default now(),
  primary key (event_id, player_id)
);

create table if not exists djfl_plays (
  id          text primary key,
  game_id     text not null,
  players     jsonb not null,
  device      text,
  seq         integer not null default 0,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- safe to re-run on a project created before this column existed
alter table djfl_events add column if not exists final boolean not null default false;

create index if not exists djfl_plays_game on djfl_plays (game_id);
create index if not exists djfl_events_upd on djfl_events (updated_at);
create index if not exists djfl_attendance_upd on djfl_attendance (updated_at);
create index if not exists djfl_plays_upd on djfl_plays (updated_at);
create index if not exists djfl_config_upd on djfl_config (updated_at);

-- The server stamps every change, so phones with wrong clocks cannot confuse ordering.
create or replace function djfl_touch() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists djfl_touch_config on djfl_config;
drop trigger if exists djfl_touch_events on djfl_events;
drop trigger if exists djfl_touch_attendance on djfl_attendance;
drop trigger if exists djfl_touch_plays on djfl_plays;
create trigger djfl_touch_config     before insert or update on djfl_config     for each row execute function djfl_touch();
create trigger djfl_touch_events     before insert or update on djfl_events     for each row execute function djfl_touch();
create trigger djfl_touch_attendance before insert or update on djfl_attendance for each row execute function djfl_touch();
create trigger djfl_touch_plays      before insert or update on djfl_plays      for each row execute function djfl_touch();

-- The app uses the public "anon" key. These policies let it read and write these four
-- tables and nothing else. Do not put anything private in this project.
alter table djfl_config     enable row level security;
alter table djfl_events     enable row level security;
alter table djfl_attendance enable row level security;
alter table djfl_plays      enable row level security;

drop policy if exists djfl_anon_config     on djfl_config;
drop policy if exists djfl_anon_events     on djfl_events;
drop policy if exists djfl_anon_attendance on djfl_attendance;
drop policy if exists djfl_anon_plays      on djfl_plays;
create policy djfl_anon_config     on djfl_config     for all to anon using (true) with check (true);
create policy djfl_anon_events     on djfl_events     for all to anon using (true) with check (true);
create policy djfl_anon_attendance on djfl_attendance for all to anon using (true) with check (true);
create policy djfl_anon_plays      on djfl_plays      for all to anon using (true) with check (true);
