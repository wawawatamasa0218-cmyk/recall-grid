create extension if not exists "pgcrypto";

create type public.plan_type as enum ('free', 'pro');
create type public.review_result as enum ('again', 'hard', 'good', 'easy');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan public.plan_type not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  front text not null check (char_length(trim(front)) > 0),
  back text not null check (char_length(trim(back)) > 0),
  explanation text,
  tags text[] not null default '{}',
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  result public.review_result not null,
  reviewed_at timestamptz not null default now(),
  next_review_at timestamptz not null
);

create index decks_user_id_idx on public.decks(user_id);
create index cards_user_due_idx on public.cards(user_id, next_review_at);
create index cards_deck_id_idx on public.cards(deck_id);
create index reviews_card_date_idx on public.reviews(card_id, reviewed_at desc);

alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_owner_all" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "decks_owner_all" on public.decks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cards_owner_all" on public.cards for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews_owner_all" on public.reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, plan) values (new.id, 'free');
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();

-- マイグレーション以前に作成済みのユーザーにも Profile を補完する。
insert into public.profiles (user_id, plan)
select id, 'free' from auth.users
on conflict (user_id) do nothing;

create or replace function public.record_review(
  p_user_id uuid,
  p_card_id uuid,
  p_result public.review_result,
  p_reviewed_at timestamptz,
  p_next_review_at timestamptz
) returns void language plpgsql security invoker as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'Not authorized';
  end if;

  insert into public.reviews (user_id, card_id, result, reviewed_at, next_review_at)
  values (p_user_id, p_card_id, p_result, p_reviewed_at, p_next_review_at);

  update public.cards
  set next_review_at = p_next_review_at, updated_at = now()
  where id = p_card_id and user_id = p_user_id;

  if not found then raise exception 'Card not found'; end if;
end;
$$;

grant execute on function public.record_review(uuid, uuid, public.review_result, timestamptz, timestamptz) to authenticated;
