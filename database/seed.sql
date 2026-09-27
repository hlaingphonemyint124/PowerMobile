-- ============================================================
-- SEED DATA — run after schema.sql + functions.sql
-- ============================================================

insert into brands (name, slug, description, is_active) values
('Apple','apple','Premium smartphones from Apple.',true),
('Samsung','samsung','Flagship and mid-range Android devices from Samsung.',true),
('Google','google','Pixel phones with pure Android and top-tier cameras.',true),
('Xiaomi','xiaomi','Value-focused smartphones with strong specs.',true),
('OPPO','oppo','Stylish, camera-focused Android devices.',true),
('OnePlus','oneplus','Performance flagships with fast charging.',true),
('Sony','sony','Xperia devices for creators and audiophiles.',true)
on conflict (slug) do nothing;

insert into categories (name, slug, description, is_active) values
('New Phones','new-phones','Brand new, sealed smartphones.',true),
('Pre-Owned Phones','pre-owned-phones','Inspected, graded second-hand smartphones.',true),
('Refurbished Phones','refurbished-phones','Professionally restored devices with warranty.',true)
on conflict (slug) do nothing;

do $$
declare
  apple_id uuid; samsung_id uuid; google_id uuid; xiaomi_id uuid;
  new_cat uuid; used_cat uuid; refurb_cat uuid;
begin
  select id into apple_id from brands where slug='apple';
  select id into samsung_id from brands where slug='samsung';
  select id into google_id from brands where slug='google';
  select id into xiaomi_id from brands where slug='xiaomi';
  select id into new_cat from categories where slug='new-phones';
  select id into used_cat from categories where slug='pre-owned-phones';
  select id into refurb_cat from categories where slug='refurbished-phones';

  insert into products (brand_id, category_id, name, slug, model, sku, condition, storage, ram, color, price, original_price, stock, description, warranty, is_featured, is_new_arrival, status)
  values
  (apple_id, new_cat, 'Apple iPhone 15 Pro 256GB', 'apple-iphone-15-pro-256gb', 'iPhone 15 Pro', 'IP15P-256-BLK', 'new', '256GB', '8GB', 'Black Titanium', 42900, 45900, 12, 'The latest iPhone 15 Pro with A17 Pro chip and titanium design.', '1 Year Apple Warranty', true, true, 'active'),
  (apple_id, new_cat, 'Apple iPhone 14 128GB', 'apple-iphone-14-128gb', 'iPhone 14', 'IP14-128-BLU', 'new', '128GB', '6GB', 'Blue', 26900, 28900, 20, 'Reliable performance with A15 Bionic chip.', '1 Year Apple Warranty', false, false, 'active'),
  (samsung_id, new_cat, 'Samsung Galaxy S24 Ultra 512GB', 'samsung-galaxy-s24-ultra-512gb', 'Galaxy S24 Ultra', 'SGS24U-512', 'new', '512GB', '12GB', 'Titanium Gray', 45900, 48900, 8, 'Flagship Samsung with built-in S Pen and AI camera features.', '1 Year Samsung Warranty', true, true, 'active'),
  (google_id, new_cat, 'Google Pixel 8 Pro 256GB', 'google-pixel-8-pro-256gb', 'Pixel 8 Pro', 'GP8P-256', 'new', '256GB', '12GB', 'Obsidian', 33900, 35900, 10, 'Best-in-class computational photography with Tensor G3.', '1 Year Google Warranty', true, false, 'active'),
  (xiaomi_id, new_cat, 'Xiaomi 14 256GB', 'xiaomi-14-256gb', 'Xiaomi 14', 'XM14-256', 'new', '256GB', '12GB', 'White', 24900, 26900, 15, 'Leica-tuned cameras with Snapdragon 8 Gen 3.', '1 Year Xiaomi Warranty', false, true, 'active');

  insert into products (brand_id, category_id, name, slug, model, sku, condition, condition_grade, storage, ram, color, battery_health, price, original_price, stock, description, warranty, is_best_seller, status)
  values
  (apple_id, used_cat, 'Apple iPhone 13 128GB (Pre-Owned)', 'apple-iphone-13-128gb-pre-owned', 'iPhone 13', 'IP13-128-USED', 'pre_owned', 'A', '128GB', '4GB', 'Midnight', 89, 17900, 22900, 1, 'Inspected pre-owned iPhone 13 in great condition. Actual device photos available.', '3 Month Store Warranty', true, 'active'),
  (samsung_id, used_cat, 'Samsung Galaxy S22 256GB (Pre-Owned)', 'samsung-galaxy-s22-256gb-pre-owned', 'Galaxy S22', 'SGS22-256-USED', 'pre_owned', 'B', '256GB', '8GB', 'Phantom Black', 84, 15900, 22900, 1, 'Good working condition with light cosmetic wear.', '3 Month Store Warranty', false, 'active');

  insert into products (brand_id, category_id, name, slug, model, sku, condition, condition_grade, storage, ram, color, battery_health, price, original_price, stock, description, warranty, status)
  values
  (apple_id, refurb_cat, 'Apple iPhone 12 64GB (Refurbished)', 'apple-iphone-12-64gb-refurbished', 'iPhone 12', 'IP12-64-REF', 'refurbished', 'A+', '64GB', '4GB', 'White', 92, 13900, 19900, 5, 'Professionally refurbished with new battery and screen inspection.', '6 Month Store Warranty', 'active');
end $$;

-- individual units for the two pre-owned single-stock listings
insert into product_units (product_id, unit_code, imei, serial_number, battery_health, condition_grade, condition_notes, price, status)
select id, 'IP13-U001', '350123456789012', 'SN-IP13-0001', 89, 'A', 'Minor scratch on back glass, screen flawless.', 17900, 'active'
from products where slug = 'apple-iphone-13-128gb-pre-owned';

insert into product_units (product_id, unit_code, imei, serial_number, battery_health, condition_grade, condition_notes, price, status)
select id, 'SGS22-U001', '350987654321098', 'SN-SGS22-0001', 84, 'B', 'Visible micro-scratches on frame, screen good.', 15900, 'active'
from products where slug = 'samsung-galaxy-s22-256gb-pre-owned';

insert into news (title, slug, excerpt, content, tags, status, published_at)
values
('iPhone 17 Pro: What to Expect', 'iphone-17-pro-what-to-expect', 'Rumors point to a redesigned camera bar and a faster A19 Pro chip.', 'Full article content goes here — write real editorial content in the admin panel.', array['apple','rumors'], 'published', now()),
('How to Get the Most Value from Your Trade-In', 'how-to-get-most-value-trade-in', 'A few simple steps before you trade in your old phone can raise its value significantly.', 'Full article content goes here — write real editorial content in the admin panel.', array['trade-in','guide'], 'published', now())
on conflict (slug) do nothing;

insert into coupons (code, discount_type, discount_value, minimum_order, usage_limit, is_active)
values ('WELCOME10','percentage',10,1000,100,true)
on conflict (code) do nothing;

-- ============================================================
-- To make a user an admin after they sign up through the app:
-- update profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================
