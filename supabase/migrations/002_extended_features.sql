alter table public.cards add column if not exists image_path text;
alter table public.cards add column if not exists stability real not null default 0;
alter table public.cards add column if not exists difficulty real not null default 5;
alter table public.cards add column if not exists reps integer not null default 0;
alter table public.cards add column if not exists lapses integer not null default 0;

alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists subscription_status text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-images', 'card-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "card_images_public_read" on storage.objects for select
using (bucket_id = 'card-images');
create policy "card_images_owner_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card_images_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "card_images_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'card-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop function if exists public.record_review(uuid, uuid, public.review_result, timestamptz, timestamptz);
create function public.record_review(
  p_user_id uuid,
  p_card_id uuid,
  p_result public.review_result,
  p_reviewed_at timestamptz,
  p_next_review_at timestamptz,
  p_stability real,
  p_difficulty real,
  p_reps integer,
  p_lapses integer
) returns void language plpgsql security invoker as $$
begin
  if p_user_id <> auth.uid() then raise exception 'Not authorized'; end if;
  insert into public.reviews (user_id, card_id, result, reviewed_at, next_review_at)
  values (p_user_id, p_card_id, p_result, p_reviewed_at, p_next_review_at);
  update public.cards set
    next_review_at = p_next_review_at,
    stability = p_stability,
    difficulty = p_difficulty,
    reps = p_reps,
    lapses = p_lapses,
    updated_at = now()
  where id = p_card_id and user_id = p_user_id;
  if not found then raise exception 'Card not found'; end if;
end;
$$;
grant execute on function public.record_review(uuid, uuid, public.review_result, timestamptz, timestamptz, real, real, integer, integer) to authenticated;
