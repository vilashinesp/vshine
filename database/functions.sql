-- ============================================================
-- TailorMate Storage Buckets & Utility Functions
-- ============================================================

-- ------------------------------------------------------------
-- Storage buckets (run via Supabase SQL editor or dashboard)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('cloth-images', 'cloth-images', true),
  ('design-images', 'design-images', true),
  ('measurement-images', 'measurement-images', true),
  ('finished-orders', 'finished-orders', true),
  ('avatars', 'avatars', true),
  ('shop-covers', 'shop-covers', true),
  ('chat-attachments', 'chat-attachments', false),
  ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Storage policies: authenticated users can upload to their
-- own folder (folder name = user id), public buckets are
-- world-readable, private buckets require ownership.
-- ------------------------------------------------------------
create policy "Public read on public buckets"
  on storage.objects for select
  using (bucket_id in (
    'cloth-images','design-images','measurement-images',
    'finished-orders','avatars','shop-covers'
  ));

create policy "Users upload to own folder"
  on storage.objects for insert
  with check (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users manage own files"
  on storage.objects for update
  using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own files"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1]);

create policy "Owner reads private invoice/chat files"
  on storage.objects for select
  using (
    bucket_id in ('chat-attachments', 'invoices')
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ------------------------------------------------------------
-- Function: search nearby tailors (basic haversine distance)
-- ------------------------------------------------------------
create or replace function nearby_tailors(
  lat double precision,
  lng double precision,
  radius_km double precision default 15
)
returns setof tailor_profiles as $$
  select *
  from tailor_profiles t
  where t.is_approved = true
    and (
      6371 * acos(
        cos(radians(lat)) * cos(radians(t.latitude)) *
        cos(radians(t.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(t.latitude))
      )
    ) <= radius_km
  order by t.avg_rating desc;
$$ language sql stable;

-- ------------------------------------------------------------
-- Function: dashboard revenue summary for a tailor
-- ------------------------------------------------------------
create or replace function tailor_revenue_summary(p_tailor_id uuid)
returns table(
  total_orders bigint,
  total_revenue numeric,
  pending_orders bigint,
  delivered_orders bigint
) as $$
  select
    count(*) as total_orders,
    coalesce(sum(total_amount), 0) as total_revenue,
    count(*) filter (where status not in ('delivered','cancelled','rejected')) as pending_orders,
    count(*) filter (where status = 'delivered') as delivered_orders
  from orders
  where tailor_id = p_tailor_id;
$$ language sql stable;
