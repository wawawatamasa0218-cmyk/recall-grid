alter table public.profiles add column if not exists ai_enabled boolean not null default false;

alter table public.decks add column if not exists title text;
alter table public.decks add column if not exists is_public boolean not null default false;
alter table public.decks add column if not exists public_slug text;
alter table public.decks add column if not exists copied_from_deck_id uuid references public.decks(id) on delete set null;
alter table public.decks add column if not exists copy_count integer not null default 0;
alter table public.decks add column if not exists category text;
alter table public.decks add column if not exists author_name text;
update public.decks set title = name, is_public = sharing_enabled, public_slug = share_slug where title is null;
alter table public.decks alter column title set not null;
create unique index if not exists decks_public_slug_unique on public.decks(public_slug) where public_slug is not null;
create index if not exists decks_public_ranking_idx on public.decks(is_public, copy_count desc, created_at desc);

create or replace function public.sync_deck_compat_columns()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.title := coalesce(nullif(new.title, ''), new.name);
    new.name := coalesce(nullif(new.name, ''), new.title);
    new.is_public := coalesce(new.is_public, new.sharing_enabled, false);
    new.sharing_enabled := new.is_public;
    new.public_slug := coalesce(new.public_slug, new.share_slug);
    new.share_slug := new.public_slug;
  else
    if new.name is distinct from old.name then new.title := new.name; end if;
    if new.title is distinct from old.title then new.name := new.title; end if;
    if new.sharing_enabled is distinct from old.sharing_enabled then new.is_public := new.sharing_enabled; end if;
    if new.is_public is distinct from old.is_public then new.sharing_enabled := new.is_public; end if;
    if new.share_slug is distinct from old.share_slug then new.public_slug := new.share_slug; end if;
    if new.public_slug is distinct from old.public_slug then new.share_slug := new.public_slug; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists sync_deck_compat_columns on public.decks;
create trigger sync_deck_compat_columns before insert or update on public.decks
for each row execute procedure public.sync_deck_compat_columns();

create table if not exists public.deck_copies (
  id uuid primary key default gen_random_uuid(),
  source_deck_id uuid not null references public.decks(id) on delete cascade,
  copied_deck_id uuid not null references public.decks(id) on delete cascade,
  copied_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(source_deck_id, copied_deck_id)
);
alter table public.deck_copies enable row level security;
create policy "deck_copies_owner_read" on public.deck_copies for select using (auth.uid() = copied_by_user_id);

create policy "public_decks_read" on public.decks for select using (is_public = true);
create policy "public_deck_cards_read" on public.cards for select using (
  exists (select 1 from public.decks where decks.id = cards.deck_id and decks.is_public = true)
);

create or replace function public.record_deck_copy(p_source_deck_id uuid, p_copied_deck_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from decks where id = p_source_deck_id and is_public = true) then raise exception 'Source deck is not public'; end if;
  if not exists (select 1 from decks where id = p_copied_deck_id and user_id = auth.uid()) then raise exception 'Copied deck is not owned by user'; end if;
  insert into deck_copies (source_deck_id, copied_deck_id, copied_by_user_id)
  values (p_source_deck_id, p_copied_deck_id, auth.uid());
  update decks set copy_count = copy_count + 1 where id = p_source_deck_id;
end;
$$;
grant execute on function public.record_deck_copy(uuid, uuid) to authenticated;
