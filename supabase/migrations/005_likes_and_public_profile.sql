alter table public.decks add column if not exists like_count integer not null default 0;

create table if not exists public.deck_likes (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(deck_id, user_id)
);
alter table public.deck_likes enable row level security;
create policy "deck_likes_owner_read" on public.deck_likes for select using (auth.uid() = user_id);
create policy "deck_likes_owner_insert" on public.deck_likes for insert with check (auth.uid() = user_id);
create policy "deck_likes_owner_delete" on public.deck_likes for delete using (auth.uid() = user_id);

create or replace function public.toggle_deck_like(p_deck_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare liked boolean;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not exists (select 1 from decks where id = p_deck_id and is_public = true) then raise exception 'Deck is not public'; end if;
  if exists (select 1 from deck_likes where deck_id = p_deck_id and user_id = auth.uid()) then
    delete from deck_likes where deck_id = p_deck_id and user_id = auth.uid();
    update decks set like_count = greatest(0, like_count - 1) where id = p_deck_id;
    liked := false;
  else
    insert into deck_likes (deck_id, user_id) values (p_deck_id, auth.uid());
    update decks set like_count = like_count + 1 where id = p_deck_id;
    liked := true;
  end if;
  return liked;
end;
$$;
grant execute on function public.toggle_deck_like(uuid) to authenticated;
