-- ============================================================
-- MOBILE PHONE STORE — SUPABASE SCHEMA
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('customer','staff','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_condition as enum ('new','pre_owned','refurbished');
exception when duplicate_object then null; end $$;

do $$ begin
  create type condition_grade as enum ('A+','A','B','C');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_status as enum ('active','out_of_stock','reserved','sold','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type image_type as enum ('front','back','side','screen','camera','accessories','damage','gallery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending','confirmed','processing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tradein_status as enum ('submitted','reviewing','offer_sent','accepted','rejected','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type news_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  is_disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-create profile row when a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- BRANDS / CATEGORIES
-- ============================================================
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  model text,
  sku text unique,
  condition product_condition not null default 'new',
  condition_grade condition_grade,
  storage text,
  ram text,
  color text,
  battery_health int,
  price numeric(12,2) not null,
  original_price numeric(12,2),
  stock int not null default 0,
  description text,
  warranty text,
  specifications jsonb not null default '{}'::jsonb,
  status product_status not null default 'active',
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_status on products(status);
create index if not exists idx_products_price on products(price);
create index if not exists idx_products_created on products(created_at desc);

-- individual pre-owned/refurbished units
create table if not exists product_units (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  unit_code text unique not null,
  imei text,
  serial_number text,
  battery_health int,
  condition_grade condition_grade,
  condition_notes text,
  price numeric(12,2),
  status product_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_units_product on product_units(product_id);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  product_unit_id uuid references product_units(id) on delete cascade,
  image_url text not null,
  image_type image_type not null default 'gallery',
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_images_product on product_images(product_id);

-- ============================================================
-- WISHLIST
-- ============================================================
create table if not exists wishlists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  created_at timestamptz not null default now()
);

create table if not exists wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  wishlist_id uuid not null references wishlists(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(wishlist_id, product_id)
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  user_id uuid references profiles(id) on delete set null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  shipping_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  shipping_address jsonb,
  payment_method text,
  coupon_code text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_unit_id uuid references product_units(id) on delete set null,
  product_name text not null,
  quantity int not null default 1,
  price numeric(12,2) not null,
  subtotal numeric(12,2) not null
);
create index if not exists idx_order_items_order on order_items(order_id);

-- ============================================================
-- TRADE-IN
-- ============================================================
create table if not exists trade_in_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  storage text,
  color text,
  condition text,
  battery_health int,
  functionality jsonb not null default '{}'::jsonb,
  photos text[] default '{}',
  customer_notes text,
  estimated_value numeric(12,2),
  offered_value numeric(12,2),
  status tradein_status not null default 'submitted',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tradein_user on trade_in_requests(user_id);
create index if not exists idx_tradein_status on trade_in_requests(status);

-- ============================================================
-- SELL REQUESTS
-- ============================================================
create table if not exists sell_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  brand text not null,
  model text not null,
  storage text,
  color text,
  condition text,
  battery_health int,
  problems text,
  description text,
  photos text[] default '{}',
  contact_name text,
  contact_phone text,
  estimated_value numeric(12,2),
  offered_value numeric(12,2),
  status tradein_status not null default 'submitted',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sellreq_user on sell_requests(user_id);

-- ============================================================
-- NEWS / CMS
-- ============================================================
create table if not exists news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text,
  thumbnail_url text,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references profiles(id) on delete set null,
  tags text[] default '{}',
  status news_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_news_slug on news(slug);
create index if not exists idx_news_status on news(status);

-- ============================================================
-- REVIEWS
-- ============================================================
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  images text[] default '{}',
  verified_purchase boolean not null default false,
  status text not null default 'pending', -- pending / approved / rejected
  created_at timestamptz not null default now()
);
create index if not exists idx_reviews_product on reviews(product_id);

-- ============================================================
-- PROMOTIONS / COUPONS
-- ============================================================
create table if not exists promotions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  discount_type text not null, -- 'percentage' | 'fixed' | 'sale_price'
  discount_value numeric(12,2) not null,
  product_ids uuid[] default '{}',
  category_ids uuid[] default '{}',
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  discount_type text not null, -- 'percentage' | 'fixed'
  discount_value numeric(12,2) not null,
  minimum_order numeric(12,2) default 0,
  maximum_discount numeric(12,2),
  usage_limit int,
  used_count int not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade, -- null = admin-facing
  title text not null,
  message text,
  type text,
  is_read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id);

-- ============================================================
-- SETTINGS (single-row store config)
-- ============================================================
create table if not exists settings (
  id int primary key default 1,
  store_name text default 'PhoneHub',
  store_logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  shipping_fee numeric(12,2) default 0,
  currency text default 'THB',
  tax_percent numeric(5,2) default 0,
  store_description text,
  social_links jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['profiles','products','product_units','orders','trade_in_requests','sell_requests','news','settings']
  loop
    execute format('drop trigger if exists trg_updated_at on %I;', t);
    execute format('create trigger trg_updated_at before update on %I for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_units enable row level security;
alter table product_images enable row level security;
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table trade_in_requests enable row level security;
alter table sell_requests enable row level security;
alter table news enable row level security;
alter table reviews enable row level security;
alter table promotions enable row level security;
alter table coupons enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;

-- helper: is the current user admin/staff?
create or replace function is_admin_or_staff()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin','staff')
  );
$$ language sql stable security definer;

create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql stable security definer;

-- PROFILES
drop policy if exists "profiles_select_own_or_staff" on profiles;
create policy "profiles_select_own_or_staff" on profiles for select
  using (auth.uid() = id or is_admin_or_staff());
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update
  using (auth.uid() = id or is_admin()) with check (auth.uid() = id or is_admin());
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert
  with check (auth.uid() = id);

-- BRANDS / CATEGORIES (public read, admin write)
drop policy if exists "brands_public_read" on brands;
create policy "brands_public_read" on brands for select using (true);
drop policy if exists "brands_admin_write" on brands;
create policy "brands_admin_write" on brands for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories for select using (true);
drop policy if exists "categories_admin_write" on categories;
create policy "categories_admin_write" on categories for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

-- PRODUCTS (public read active, admin full)
drop policy if exists "products_public_read_active" on products;
create policy "products_public_read_active" on products for select
  using (status = 'active' or is_admin_or_staff());
drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

-- PRODUCT UNITS (public can read non-sensitive cols are still filtered app-side; RLS gates rows)
drop policy if exists "units_public_read" on product_units;
create policy "units_public_read" on product_units for select
  using (status = 'active' or is_admin_or_staff());
drop policy if exists "units_admin_write" on product_units;
create policy "units_admin_write" on product_units for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

-- PRODUCT IMAGES
drop policy if exists "images_public_read" on product_images;
create policy "images_public_read" on product_images for select using (true);
drop policy if exists "images_admin_write" on product_images;
create policy "images_admin_write" on product_images for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

-- WISHLISTS
drop policy if exists "wishlist_owner" on wishlists;
create policy "wishlist_owner" on wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "wishlist_items_owner" on wishlist_items;
create policy "wishlist_items_owner" on wishlist_items for all
  using (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid()))
  with check (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

-- ORDERS
drop policy if exists "orders_owner_or_staff_select" on orders;
create policy "orders_owner_or_staff_select" on orders for select
  using (auth.uid() = user_id or is_admin_or_staff());
drop policy if exists "orders_owner_insert" on orders;
create policy "orders_owner_insert" on orders for insert
  with check (auth.uid() = user_id);
drop policy if exists "orders_staff_update" on orders;
create policy "orders_staff_update" on orders for update
  using (is_admin_or_staff()) with check (is_admin_or_staff());

drop policy if exists "order_items_owner_or_staff" on order_items;
create policy "order_items_owner_or_staff" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin_or_staff())));
drop policy if exists "order_items_insert" on order_items;
create policy "order_items_insert" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

-- TRADE-INS
drop policy if exists "tradein_owner_or_staff" on trade_in_requests;
create policy "tradein_owner_or_staff" on trade_in_requests for select
  using (auth.uid() = user_id or is_admin_or_staff());
drop policy if exists "tradein_owner_insert" on trade_in_requests;
create policy "tradein_owner_insert" on trade_in_requests for insert
  with check (auth.uid() = user_id);
drop policy if exists "tradein_owner_update_own_pending" on trade_in_requests;
create policy "tradein_owner_update_own_pending" on trade_in_requests for update
  using (auth.uid() = user_id or is_admin_or_staff())
  with check (auth.uid() = user_id or is_admin_or_staff());

-- SELL REQUESTS
drop policy if exists "sellreq_owner_or_staff" on sell_requests;
create policy "sellreq_owner_or_staff" on sell_requests for select
  using (auth.uid() = user_id or is_admin_or_staff());
drop policy if exists "sellreq_owner_insert" on sell_requests;
create policy "sellreq_owner_insert" on sell_requests for insert
  with check (auth.uid() = user_id);
drop policy if exists "sellreq_update" on sell_requests;
create policy "sellreq_update" on sell_requests for update
  using (auth.uid() = user_id or is_admin_or_staff())
  with check (auth.uid() = user_id or is_admin_or_staff());

-- NEWS (public read published, admin full)
drop policy if exists "news_public_read_published" on news;
create policy "news_public_read_published" on news for select
  using (status = 'published' or is_admin_or_staff());
drop policy if exists "news_admin_write" on news;
create policy "news_admin_write" on news for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

-- REVIEWS
drop policy if exists "reviews_public_read_approved" on reviews;
create policy "reviews_public_read_approved" on reviews for select
  using (status = 'approved' or auth.uid() = user_id or is_admin_or_staff());
drop policy if exists "reviews_owner_insert" on reviews;
create policy "reviews_owner_insert" on reviews for insert
  with check (auth.uid() = user_id);
drop policy if exists "reviews_admin_moderate" on reviews;
create policy "reviews_admin_moderate" on reviews for update
  using (is_admin_or_staff()) with check (is_admin_or_staff());
drop policy if exists "reviews_admin_delete" on reviews;
create policy "reviews_admin_delete" on reviews for delete using (is_admin_or_staff());

-- PROMOTIONS / COUPONS
drop policy if exists "promotions_public_read" on promotions;
create policy "promotions_public_read" on promotions for select using (is_active or is_admin_or_staff());
drop policy if exists "promotions_admin_write" on promotions;
create policy "promotions_admin_write" on promotions for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());

drop policy if exists "coupons_admin_all" on coupons;
create policy "coupons_admin_all" on coupons for all
  using (is_admin_or_staff()) with check (is_admin_or_staff());
-- customers validate coupons through a server-side RPC (see functions.sql), not direct table reads

-- NOTIFICATIONS
drop policy if exists "notifications_owner_or_admin" on notifications;
create policy "notifications_owner_or_admin" on notifications for select
  using (auth.uid() = user_id or (user_id is null and is_admin_or_staff()));
drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications for update
  using (auth.uid() = user_id or is_admin_or_staff());
drop policy if exists "notifications_system_insert" on notifications;
create policy "notifications_system_insert" on notifications for insert with check (true);

-- SETTINGS
drop policy if exists "settings_public_read" on settings;
create policy "settings_public_read" on settings for select using (true);
drop policy if exists "settings_admin_write" on settings;
create policy "settings_admin_write" on settings for update
  using (is_admin()) with check (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images','product-images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('news-images','news-images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('trade-in-images','trade-in-images', false)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

-- public read for public buckets
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images" on storage.objects for select
  using (bucket_id in ('product-images','news-images','avatars'));

-- admin/staff can write product & news images
drop policy if exists "staff_write_product_images" on storage.objects;
create policy "staff_write_product_images" on storage.objects for insert
  with check (bucket_id in ('product-images','news-images') and is_admin_or_staff());
drop policy if exists "staff_update_product_images" on storage.objects;
create policy "staff_update_product_images" on storage.objects for update
  using (bucket_id in ('product-images','news-images') and is_admin_or_staff());
drop policy if exists "staff_delete_product_images" on storage.objects;
create policy "staff_delete_product_images" on storage.objects for delete
  using (bucket_id in ('product-images','news-images') and is_admin_or_staff());

-- avatars: users manage their own folder (path prefix = their uid)
drop policy if exists "user_write_own_avatar" on storage.objects;
create policy "user_write_own_avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "user_update_own_avatar" on storage.objects;
create policy "user_update_own_avatar" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- trade-in images: private, owner + staff only, path prefix = uid
drop policy if exists "tradein_owner_read" on storage.objects;
create policy "tradein_owner_read" on storage.objects for select
  using (bucket_id = 'trade-in-images' and ((storage.foldername(name))[1] = auth.uid()::text or is_admin_or_staff()));
drop policy if exists "tradein_owner_write" on storage.objects;
create policy "tradein_owner_write" on storage.objects for insert
  with check (bucket_id = 'trade-in-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- DONE. Next: run database/functions.sql, then database/seed.sql
-- ============================================================
