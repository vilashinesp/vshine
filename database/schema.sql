-- ============================================================
-- TailorMate Database Schema (Supabase PostgreSQL)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('customer', 'tailor', 'admin');

create type order_status as enum (
  'pending', 'accepted', 'rejected', 'measurement',
  'cutting', 'stitching', 'ironing', 'ready', 'delivered', 'cancelled'
);

create type payment_method as enum ('cash', 'upi', 'stripe', 'razorpay');

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type notification_type as enum (
  'booking', 'order_status', 'payment', 'chat', 'system', 'promotion'
);

-- ============================================================
-- USERS
-- ============================================================

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  phone text unique,
  full_name text not null,
  password_hash text,
  google_id text unique,
  avatar_url text,
  role user_role not null default 'customer',
  is_active boolean not null default true,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_users_email on users(email);
create index idx_users_role on users(role);

-- ============================================================
-- TAILOR PROFILES
-- ============================================================

create table tailor_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  shop_name text not null,
  bio text,
  years_experience integer default 0,
  address text,
  city text,
  state text,
  pincode text,
  latitude double precision,
  longitude double precision,
  cover_image_url text,
  is_approved boolean not null default false,
  avg_rating numeric(2,1) default 0,
  total_reviews integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index idx_tailor_profiles_city on tailor_profiles(city);
create index idx_tailor_profiles_user on tailor_profiles(user_id);

-- ============================================================
-- SERVICE CATEGORIES & SERVICES
-- ============================================================

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  icon_url text,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default uuid_generate_v4(),
  tailor_id uuid not null references tailor_profiles(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_days integer not null default 3,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_tailor on services(tailor_id);
create index idx_services_category on services(category_id);

-- ============================================================
-- MEASUREMENTS
-- ============================================================

create table measurements (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id) on delete cascade,
  label text not null default 'Default',
  chest numeric(5,2),
  waist numeric(5,2),
  hip numeric(5,2),
  shoulder numeric(5,2),
  sleeve_length numeric(5,2),
  inseam numeric(5,2),
  neck numeric(5,2),
  height numeric(5,2),
  weight numeric(5,2),
  notes text,
  ai_suggested boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_measurements_customer on measurements(customer_id);

-- ============================================================
-- BOOKINGS
-- ============================================================

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id) on delete cascade,
  tailor_id uuid not null references tailor_profiles(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  measurement_id uuid references measurements(id) on delete set null,
  booking_date date not null,
  booking_time time not null,
  cloth_image_url text,
  design_image_url text,
  measurement_image_url text,
  notes text,
  status order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_customer on bookings(customer_id);
create index idx_bookings_tailor on bookings(tailor_id);
create index idx_bookings_status on bookings(status);
create index idx_bookings_date on bookings(booking_date);

-- ============================================================
-- ORDERS
-- ============================================================

create table orders (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid not null references bookings(id) on delete cascade,
  customer_id uuid not null references users(id) on delete cascade,
  tailor_id uuid not null references tailor_profiles(id) on delete cascade,
  order_number text not null unique,
  status order_status not null default 'pending',
  total_amount numeric(10,2) not null,
  finished_image_url text,
  estimated_delivery date,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_tailor on orders(tailor_id);
create index idx_orders_status on orders(status);
create index idx_orders_number on orders(order_number);

create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  changed_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_order_history_order on order_status_history(order_id);

-- ============================================================
-- PAYMENTS
-- ============================================================

create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references users(id) on delete cascade,
  amount numeric(10,2) not null,
  method payment_method not null,
  status payment_status not null default 'pending',
  transaction_ref text,
  invoice_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_payments_order on payments(order_id);
create index idx_payments_customer on payments(customer_id);

-- ============================================================
-- COUPONS
-- ============================================================

create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  discount_percent numeric(5,2),
  discount_flat numeric(10,2),
  max_uses integer,
  used_count integer default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- WISHLIST
-- ============================================================

create table wishlist (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id) on delete cascade,
  tailor_id uuid references tailor_profiles(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(customer_id, tailor_id, service_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  customer_id uuid not null references users(id) on delete cascade,
  tailor_id uuid not null references tailor_profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(order_id)
);

create index idx_reviews_tailor on reviews(tailor_id);

-- ============================================================
-- CHAT
-- ============================================================

create table chat_threads (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id) on delete cascade,
  tailor_id uuid not null references tailor_profiles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(customer_id, tailor_id, booking_id)
);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  message text,
  attachment_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_thread on chat_messages(thread_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, is_read);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================

create table refresh_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_refresh_tokens_user on refresh_tokens(user_id);

-- ============================================================
-- CMS / SITE SETTINGS (admin)
-- ============================================================

create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
