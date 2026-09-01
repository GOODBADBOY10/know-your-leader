-- ============================================================
-- KNOW YOUR LEADER — SCHEMA
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- ============================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- STATIC REFERENCE DATA
-- ============================================================

-- Offices: fixed set, ranked by hierarchy (01 = highest).
create table offices (
  id    smallint primary key,
  code  text unique not null,   -- PRES, GOV, SEN, REP, HOA, CHM
  label text not null,
  rank  smallint not null
);

insert into offices (id, code, label, rank) values
  (1, 'PRES', 'President', 1),
  (2, 'GOV',  'Governor', 2),
  (3, 'SEN',  'Senator', 3),
  (4, 'REP',  'House of Representatives', 4),
  (5, 'HOA',  'House of Assembly', 5),
  (6, 'CHM',  'LG Chairman', 6);

-- States: all 36 + FCT. Static, seeded here (not via the JSON import).
create table states (
  id     serial primary key,
  name   text unique not null,
  is_fct boolean not null default false
);

insert into states (name, is_fct) values
  ('Abia', false), ('Adamawa', false), ('Akwa Ibom', false), ('Anambra', false),
  ('Bauchi', false), ('Bayelsa', false), ('Benue', false), ('Borno', false),
  ('Cross River', false), ('Delta', false), ('Ebonyi', false), ('Edo', false),
  ('Ekiti', false), ('Enugu', false), ('Gombe', false), ('Imo', false),
  ('Jigawa', false), ('Kaduna', false), ('Kano', false), ('Katsina', false),
  ('Kebbi', false), ('Kogi', false), ('Kwara', false), ('Lagos', false),
  ('Nasarawa', false), ('Niger', false), ('Ogun', false), ('Ondo', false),
  ('Osun', false), ('Oyo', false), ('Plateau', false), ('Rivers', false),
  ('Sokoto', false), ('Taraba', false), ('Yobe', false), ('Zamfara', false),
  ('FCT (Abuja)', true);

-- ============================================================
-- GEOGRAPHY / JURISDICTION TABLES
-- Populated by the bulk import script (supabase/import.js), not here.
-- ============================================================

create table senatorial_districts (
  id       serial primary key,
  state_id int not null references states(id),
  name     text not null,
  unique (state_id, name)
);

create table federal_constituencies (
  id       serial primary key,
  state_id int not null references states(id),
  name     text not null,
  unique (state_id, name)
);

create table state_constituencies (
  id       serial primary key,
  state_id int not null references states(id),
  name     text not null,
  unique (state_id, name)
);

-- LGAs carry pointers to the constituencies they sit inside.
-- SIMPLIFICATION: this assumes each LGA maps to exactly one senatorial
-- district / federal constituency / state constituency. In reality a
-- handful of LGAs are split across constituencies. Fine for an MVP —
-- flag it if you hit a real-world case that needs finer granularity.
create table lgas (
  id                        serial primary key,
  state_id                  int not null references states(id),
  name                      text not null,
  senatorial_district_id    int references senatorial_districts(id),
  federal_constituency_id   int references federal_constituencies(id),
  state_constituency_id     int references state_constituencies(id),
  unique (state_id, name)
);

create index on lgas (state_id);

-- ============================================================
-- OFFICEHOLDERS
-- ============================================================

create table officeholders (
  id                        uuid primary key default gen_random_uuid(),
  office_id                 smallint not null references offices(id),
  name                      text not null,
  party                     text,
  term_start                date,
  term_end                  date,
  photo_url                 text,
  source                    text not null default 'manual' check (source in ('wikidata', 'manual')),

  -- Exactly one of these is set, matching the office's jurisdiction level.
  -- PRES sets none (national). GOV sets state_id. SEN sets senatorial_district_id.
  -- REP sets federal_constituency_id. HOA sets state_constituency_id. CHM sets lga_id.
  state_id                  int references states(id),
  lga_id                    int references lgas(id),
  senatorial_district_id    int references senatorial_districts(id),
  federal_constituency_id   int references federal_constituencies(id),
  state_constituency_id     int references state_constituencies(id),

  -- Stable natural key for idempotent re-imports, e.g. "CHM|Lagos|Ikeja".
  -- Built by the import script; also handy for admin lookups.
  external_key              text unique not null,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index on officeholders (office_id);
create index on officeholders (state_id);
create index on officeholders (lga_id);
create index on officeholders (senatorial_district_id);
create index on officeholders (federal_constituency_id);
create index on officeholders (state_constituency_id);

-- Keep updated_at current on every edit (admin panel or otherwise).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger officeholders_set_updated_at
  before update on officeholders
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Public can read everything. Only authenticated (admin) users can write.
-- Once you add contributors beyond yourself, swap the write policies
-- for a proper admin-role check instead of "any authenticated user."
-- ============================================================

alter table states enable row level security;
alter table lgas enable row level security;
alter table senatorial_districts enable row level security;
alter table federal_constituencies enable row level security;
alter table state_constituencies enable row level security;
alter table offices enable row level security;
alter table officeholders enable row level security;

create policy "public read" on states for select using (true);
create policy "public read" on lgas for select using (true);
create policy "public read" on senatorial_districts for select using (true);
create policy "public read" on federal_constituencies for select using (true);
create policy "public read" on state_constituencies for select using (true);
create policy "public read" on offices for select using (true);
create policy "public read" on officeholders for select using (true);

create policy "admin write" on officeholders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Geography tables change rarely, but allow admin writes too
-- (e.g. adding a new LGA's constituency mapping later).
create policy "admin write" on lgas for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin write" on senatorial_districts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin write" on federal_constituencies for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin write" on state_constituencies for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');