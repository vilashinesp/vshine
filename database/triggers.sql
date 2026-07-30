-- ============================================================
-- TailorMate Triggers
-- ============================================================

-- ------------------------------------------------------------
-- Generic updated_at toucher
-- ------------------------------------------------------------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();

create trigger trg_tailor_profiles_updated_at before update on tailor_profiles
  for each row execute function set_updated_at();

create trigger trg_services_updated_at before update on services
  for each row execute function set_updated_at();

create trigger trg_measurements_updated_at before update on measurements
  for each row execute function set_updated_at();

create trigger trg_bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- Log order status changes into order_status_history
-- ------------------------------------------------------------
create or replace function log_order_status_change() returns trigger as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into order_status_history (order_id, status, changed_by)
    values (new.id, new.status, auth_uid());
    if new.status = 'delivered' and new.delivered_at is null then
      new.delivered_at = now();
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_status_history
  before insert or update on orders
  for each row execute function log_order_status_change();

-- ------------------------------------------------------------
-- Recalculate tailor avg_rating when a review is added
-- ------------------------------------------------------------
create or replace function refresh_tailor_rating() returns trigger as $$
begin
  update tailor_profiles
  set avg_rating = (
        select coalesce(round(avg(rating)::numeric, 1), 0)
        from reviews where tailor_id = new.tailor_id
      ),
      total_reviews = (
        select count(*) from reviews where tailor_id = new.tailor_id
      )
  where id = new.tailor_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_reviews_refresh_rating
  after insert or update on reviews
  for each row execute function refresh_tailor_rating();

-- ------------------------------------------------------------
-- Auto-generate order_number on insert (e.g. TM-20260723-0001)
-- ------------------------------------------------------------
create sequence if not exists order_number_seq;

create or replace function generate_order_number() returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'TM-' || to_char(now(), 'YYYYMMDD') || '-' ||
      lpad(nextval('order_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_generate_number
  before insert on orders
  for each row execute function generate_order_number();

-- ------------------------------------------------------------
-- Notify customer on booking status change
-- ------------------------------------------------------------
create or replace function notify_booking_status_change() returns trigger as $$
begin
  if (tg_op = 'UPDATE') and (old.status is distinct from new.status) then
    insert into notifications (user_id, type, title, body, link)
    values (
      new.customer_id,
      'booking',
      'Booking status updated',
      'Your booking status changed to ' || new.status,
      '/bookings/' || new.id
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_bookings_notify
  after update on bookings
  for each row execute function notify_booking_status_change();
