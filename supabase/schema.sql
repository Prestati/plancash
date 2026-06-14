-- Plan-plattformen: Databaseskjema
-- Kjør dette i Supabase SQL Editor

-- =====================
-- HUSHOLD
-- =====================

create table if not exists husholdning_profil (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  medlemmer jsonb not null default '[]',
  updated_at timestamptz default now()
);

-- =====================
-- BUDSJETT-KATEGORIER
-- =====================

create table if not exists budsjett_kategorier (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  navn text not null,
  type text not null check (type in ('inntekt','fast','gjeld','abonnement','forbruk','sparing')),
  standard_beløp numeric(10,2) not null default 0,
  ikon text,
  eier text default 'felles', -- 'felles' eller navn på husholdsmedlem
  sortering int not null default 0,
  aktiv boolean not null default true,
  created_at timestamptz default now()
);

-- =====================
-- MÅNEDLIGE AVVIK
-- =====================
-- Når standard_beløp ikke stemmer for en gitt måned legges avviket her.

create table if not exists budsjett_maneder (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  kategori_id uuid references budsjett_kategorier(id) on delete cascade not null,
  ar int not null,
  maned int not null check (maned between 1 and 12),
  belop numeric(10,2) not null,
  notat text,
  created_at timestamptz default now(),
  unique(user_id, kategori_id, ar, maned)
);

-- =====================
-- TRANSAKSJONER
-- =====================

create table if not exists transaksjoner (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  kategori_id uuid references budsjett_kategorier(id) on delete set null,
  dato date not null,
  beløp numeric(10,2) not null,
  beskrivelse text,
  betalt_av text, -- 'karoline' | 'tobias' | 'felles' | navn på husholdsmedlem
  kilde text default 'manuell',
  created_at timestamptz default now()
);

-- =====================
-- PLANDISH-INTEGRASJON
-- =====================

create table if not exists plandish_sync (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plandish_kvittering_id text not null,
  transaksjon_id uuid references transaksjoner(id) on delete cascade,
  synkronisert_at timestamptz default now(),
  unique(user_id, plandish_kvittering_id)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

alter table husholdning_profil enable row level security;
alter table budsjett_kategorier enable row level security;
alter table budsjett_maneder enable row level security;
alter table transaksjoner enable row level security;
alter table plandish_sync enable row level security;

create policy "Egne data" on husholdning_profil for all using (auth.uid() = user_id);
create policy "Egne data" on budsjett_kategorier for all using (auth.uid() = user_id);
create policy "Egne data" on budsjett_maneder for all using (auth.uid() = user_id);
create policy "Egne data" on transaksjoner for all using (auth.uid() = user_id);
create policy "Egne data" on plandish_sync for all using (auth.uid() = user_id);
