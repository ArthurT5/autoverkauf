-- AutoVerkauf — Supabase Schema
-- Run this in your Supabase project's SQL Editor (supabase.com > project > SQL Editor)

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text,
  role text not null default 'BUYER' check (role in ('BUYER', 'DEALER', 'ADMIN')),
  locale text default 'de',
  created_at timestamptz default now()
);

-- Buyers
create table buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Dealers
create table dealers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references users(id) on delete cascade,
  company_name text not null,
  canton text,
  website text,
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz default now()
);

-- Vehicle requests
create table vehicle_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references buyers(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'CLOSED', 'EXPIRED')),
  budget_min integer not null,
  budget_max integer not null,
  body_types text[] default '{}',
  brands text[] default '{}',
  year_min integer,
  year_max integer,
  fuel_types text[] default '{}',
  transmissions text[] default '{}',
  mileage_max integer,
  must_have text[] default '{}',
  nice_to_have text[] default '{}',
  canton text,
  notes text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Offers
create table offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references vehicle_requests(id) on delete cascade,
  dealer_id uuid references dealers(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'VIEWED', 'ACCEPTED', 'DECLINED')),
  make text not null,
  model text not null,
  year integer not null,
  mileage integer,
  fuel text,
  transmission text,
  price integer not null, -- CHF in cents
  description text,
  viewed_at timestamptz,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table buyers enable row level security;
alter table dealers enable row level security;
alter table vehicle_requests enable row level security;
alter table offers enable row level security;
alter table notifications enable row level security;

-- Service role bypasses RLS (used by server-side API routes)
-- Public anon role has no access — all reads/writes go through the service role on the server
