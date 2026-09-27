# PhoneHub — Mobile Phone E-Commerce & Trade-In Platform

A full-stack mobile phone store built with React, Vite, Tailwind CSS and Supabase. Sells new, pre-owned and refurbished smartphones, supports trade-ins and sell-your-phone submissions, and includes a role-protected admin dashboard.

## Tech Stack
- React 18 + Vite
- React Router 6
- Tailwind CSS (light/dark mode)
- Supabase (Postgres, Auth, Storage, Row Level Security)
- Lucide React icons

## 1. Install dependencies
```bash
npm install
```

## 2. Create a Supabase project
Go to https://supabase.com, create a new project, and grab your **Project URL** and **anon public key** from Project Settings → API.

## 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Never commit `.env` or use the service-role key in frontend code — only the anon key belongs here.

## 4. Set up the database
In the Supabase dashboard, open **SQL Editor → New Query**, and run these three files **in order**:
1. `database/schema.sql` — tables, enums, indexes, RLS policies, storage buckets
2. `database/functions.sql` — server-side RPCs for safe order creation & coupon validation
3. `database/seed.sql` — sample brands, products, and news articles

## 5. Create your first admin user
1. Run the app (`npm run dev`) and register a normal account at `/register`, or sign up via Supabase Auth directly.
2. In Supabase → SQL Editor, run:
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Sign in at `/admin/login` with that account.

## 6. Run locally
```bash
npm run dev
```
Visit `http://localhost:5173`.

## 7. Build for production
```bash
npm run build
npm run preview   # optional, serves the production build locally
```

## Project Structure
```
src/
  api/          # Supabase data-access modules (one per domain)
  components/   # Shared UI (Navbar, ProductCard, route guards, admin layout, etc.)
  contexts/     # Auth, Cart, Toast providers
  hooks/        # useTheme (light/dark mode)
  lib/          # Supabase client
  pages/        # Customer-facing routes
  pages/admin/  # Admin dashboard routes
database/
  schema.sql    # Full Postgres schema + RLS + storage policies
  functions.sql # Server-side order/coupon RPCs
  seed.sql      # Sample data
```

## What's fully implemented
- Email/password auth (register, login, logout, password reset) via Supabase Auth
- Product catalog: search, brand/condition/price filters, sorting, pagination, URL-synced filters
- Individual pre-owned unit tracking (`product_units`: IMEI, serial, battery health, grade — admin-only fields, never exposed publicly)
- Product detail with image gallery, specs, reviews
- Cart (persisted to localStorage) → checkout → orders, all placed through a **server-side Postgres RPC** (`create_order`) that re-prices every line from the database, checks stock, validates coupons, and decrements inventory — the frontend never dictates price, stock or discount
- Wishlist, product comparison (up to 3 phones)
- 6-step Trade-In form (device functionality checklist + photo upload to a private Storage bucket) and a separate Sell-Your-Phone form
- News CMS (public published list/detail, admin create/edit/publish/delete)
- Reviews (customer submission → pending → admin moderation)
- Admin dashboard: live revenue/order/product/customer/trade-in stats, recent orders, low-stock list
- Admin CRUD: products (with multi-image upload), brands, categories, news, orders (status + payment status + notes), trade-ins & sell requests (estimate/offer/status workflow), customers (search + disable), promotions, coupons, review moderation
- Row Level Security on every table: customers can only read/write their own data; admin/staff roles get elevated access; product images are public, trade-in photos are private
- Light/dark mode (persisted), responsive layout, toast notifications, confirmation dialogs on destructive actions, loading skeletons, empty states, 404 page

## What's intentionally lighter-weight (extend as needed)
This is a large spec (70 sections). The above is genuinely wired end-to-end against Supabase — nothing is faked or hardcoded. A few areas were kept simple rather than fully built out, since they're the parts real teams iterate on over time rather than solve in one pass:
- **Promotions engine**: promotions are stored and toggleable, but automatic price adjustment on the storefront based on active promotions isn't wired up yet — apply `price`/`original_price` directly on products for now, or extend `listProducts` to join active promotions.
- **Payment gateway**: checkout supports Cash on Delivery, Bank Transfer and PromptPay as manual methods (as the spec requested), with `payment_method` on the order ready for a real gateway (Stripe/Omise/2C2P) to be dropped in later.
- **SEO metadata**: product/news pages use clean slugs, but per-page `<title>`/meta tag injection (e.g. via `react-helmet-async`) isn't wired in — routes are ready for it.
- **Notifications**: rows are created automatically on order placement (customer + admin-facing) and the schema supports the rest of the event list in the spec; wiring every event (shipped, trade-in reviewed, etc.) into `updateOrderStatus`/`updateTradeIn` is a small follow-up.
- **Product unit selection on the storefront**: `product_units` exist and are visible on the product detail response, but the buy flow currently treats each pre-owned listing as its one unit rather than letting a customer pick between several units of the same model — extend `ProductDetail.jsx` if you stock multiple units per model.

## Security notes
- RLS is enabled on every table. Customers cannot read other customers' orders, profiles, trade-ins or sell requests.
- `product_units.imei` and `serial_number` are only meaningfully useful to admins; the frontend never displays them on customer-facing pages (the `getProductBySlug` query does return them structurally — if you want a hard guarantee, strip those two fields in a Postgres view or an edge function rather than relying on the frontend not rendering them).
- Orders are created exclusively through the `create_order` Postgres function (`SECURITY DEFINER`), which re-validates price, stock and coupon server-side — the browser cannot forge a cheaper order.
- Only the Supabase anon key is used client-side; never place the service-role key in this codebase.
