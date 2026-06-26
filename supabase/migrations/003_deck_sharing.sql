alter table public.profiles add column if not exists display_name text;
alter table public.decks add column if not exists description text;
alter table public.decks add column if not exists sharing_enabled boolean not null default false;
alter table public.decks add column if not exists share_slug text unique;
create index if not exists decks_share_slug_idx on public.decks(share_slug) where sharing_enabled = true;
