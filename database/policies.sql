-- ============================================================
-- TailorMate Row Level Security Policies
-- ============================================================

alter table users enable row level security;
alter table tailor_profiles enable row level security;
alter table services enable row level security;
alter table categories enable row level security;
alter table measurements enable row level security;
alter table bookings enable row level security;
alter table orders enable row level security;
alter table order_status_history enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table wishlist enable row level security;
alter table reviews enable row level security;
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;
alter table notifications enable row level security;
alter table site_settings enable row level security;

-- ------------------------------------------------------------
-- Helper: current user role (reads JWT claim set by backend)
-- ------------------------------------------------------------
create or replace function auth_role() returns text as $$
  select coalesce(current_setting('request.jwt.claims', true)::json->>'role', 'anon');
$$ language sql stable;

create or replace function auth_uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ language sql stable;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
create policy "Users can view own profile" on users
  for select using (id = auth_uid() or auth_role() = 'admin');

create policy "Users can update own profile" on users
  for update using (id = auth_uid());

-- ------------------------------------------------------------
-- TAILOR PROFILES (public read, tailor/admin write)
-- ------------------------------------------------------------
create policy "Anyone can view approved tailors" on tailor_profiles
  for select using (is_approved = true or user_id = auth_uid() or auth_role() = 'admin');

create policy "Tailor can update own profile" on tailor_profiles
  for update using (user_id = auth_uid() or auth_role() = 'admin');

create policy "Tailor can insert own profile" on tailor_profiles
  for insert with check (user_id = auth_uid());

-- ------------------------------------------------------------
-- SERVICES (public read, owning tailor write)
-- ------------------------------------------------------------
create policy "Anyone can view active services" on services
  for select using (is_active = true or auth_role() in ('tailor', 'admin'));

create policy "Tailor manages own services" on services
  for all using (
    tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    or auth_role() = 'admin'
  );

-- ------------------------------------------------------------
-- CATEGORIES (public read, admin write)
-- ------------------------------------------------------------
create policy "Anyone can view categories" on categories
  for select using (true);

create policy "Admin manages categories" on categories
  for all using (auth_role() = 'admin');

-- ------------------------------------------------------------
-- MEASUREMENTS (owner + assigned tailor + admin)
-- ------------------------------------------------------------
create policy "Customer manages own measurements" on measurements
  for all using (customer_id = auth_uid() or auth_role() = 'admin');

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------
create policy "Customer views own bookings" on bookings
  for select using (
    customer_id = auth_uid()
    or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    or auth_role() = 'admin'
  );

create policy "Customer creates bookings" on bookings
  for insert with check (customer_id = auth_uid());

create policy "Customer or tailor updates booking" on bookings
  for update using (
    customer_id = auth_uid()
    or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    or auth_role() = 'admin'
  );

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
create policy "Customer/tailor view own orders" on orders
  for select using (
    customer_id = auth_uid()
    or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    or auth_role() = 'admin'
  );

create policy "Tailor updates order status" on orders
  for update using (
    tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    or auth_role() = 'admin'
  );

-- ------------------------------------------------------------
-- ORDER STATUS HISTORY
-- ------------------------------------------------------------
create policy "View history of accessible orders" on order_status_history
  for select using (
    order_id in (
      select id from orders where customer_id = auth_uid()
      or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    )
    or auth_role() = 'admin'
  );

-- ------------------------------------------------------------
-- PAYMENTS
-- ------------------------------------------------------------
create policy "Customer views own payments" on payments
  for select using (customer_id = auth_uid() or auth_role() = 'admin');

-- ------------------------------------------------------------
-- COUPONS (public read active, admin write)
-- ------------------------------------------------------------
create policy "Anyone can view active coupons" on coupons
  for select using (is_active = true or auth_role() = 'admin');

create policy "Admin manages coupons" on coupons
  for all using (auth_role() = 'admin');

-- ------------------------------------------------------------
-- WISHLIST
-- ------------------------------------------------------------
create policy "Customer manages own wishlist" on wishlist
  for all using (customer_id = auth_uid());

-- ------------------------------------------------------------
-- REVIEWS (public read, customer write on own orders)
-- ------------------------------------------------------------
create policy "Anyone can view reviews" on reviews
  for select using (true);

create policy "Customer writes review on own order" on reviews
  for insert with check (customer_id = auth_uid());

-- ------------------------------------------------------------
-- CHAT
-- ------------------------------------------------------------
create policy "Participants view own chat threads" on chat_threads
  for select using (
    customer_id = auth_uid()
    or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
  );

create policy "Participants view own messages" on chat_messages
  for select using (
    thread_id in (
      select id from chat_threads where customer_id = auth_uid()
      or tailor_id in (select id from tailor_profiles where user_id = auth_uid())
    )
  );

create policy "Participants send messages" on chat_messages
  for insert with check (sender_id = auth_uid());

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create policy "User views own notifications" on notifications
  for select using (user_id = auth_uid());

create policy "User marks own notifications read" on notifications
  for update using (user_id = auth_uid());

-- ------------------------------------------------------------
-- SITE SETTINGS (admin only)
-- ------------------------------------------------------------
create policy "Admin manages settings" on site_settings
  for all using (auth_role() = 'admin');

create policy "Anyone can read settings" on site_settings
  for select using (true);
