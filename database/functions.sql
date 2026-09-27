-- ============================================================
-- SERVER-SAFE BUSINESS LOGIC (run after schema.sql)
-- These RPCs stop the frontend from being able to fake prices,
-- stock, coupon math, or roles. Call them via supabase.rpc(...).
-- ============================================================

-- Validate a coupon without ever exposing the coupons table to customers directly.
create or replace function validate_coupon(p_code text, p_subtotal numeric)
returns table(valid boolean, discount numeric, message text)
language plpgsql security definer as $$
declare c coupons%rowtype;
declare d numeric;
begin
  select * into c from coupons where code = p_code and is_active = true;
  if not found then
    return query select false, 0::numeric, 'Coupon not found or inactive';
    return;
  end if;
  if c.start_date is not null and now() < c.start_date then
    return query select false, 0::numeric, 'Coupon not yet active';
    return;
  end if;
  if c.end_date is not null and now() > c.end_date then
    return query select false, 0::numeric, 'Coupon expired';
    return;
  end if;
  if c.usage_limit is not null and c.used_count >= c.usage_limit then
    return query select false, 0::numeric, 'Coupon usage limit reached';
    return;
  end if;
  if p_subtotal < coalesce(c.minimum_order,0) then
    return query select false, 0::numeric, format('Minimum order of %s required', c.minimum_order);
    return;
  end if;
  if c.discount_type = 'percentage' then
    d := p_subtotal * (c.discount_value/100.0);
    if c.maximum_discount is not null and d > c.maximum_discount then
      d := c.maximum_discount;
    end if;
  else
    d := c.discount_value;
  end if;
  return query select true, d, 'OK';
end;
$$;

grant execute on function validate_coupon(text, numeric) to authenticated, anon;

-- Create an order atomically: re-prices every line from the products table,
-- checks stock, applies the coupon server-side, and decrements stock.
-- p_items: jsonb array like [{"product_id":"...","quantity":2}, ...]
create or replace function create_order(
  p_user_id uuid,
  p_items jsonb,
  p_shipping_address jsonb,
  p_payment_method text,
  p_coupon_code text default null,
  p_shipping_fee numeric default 0
)
returns uuid
language plpgsql security definer as $$
declare
  item jsonb;
  prod products%rowtype;
  qty int;
  line_total numeric := 0;
  subtotal numeric := 0;
  discount numeric := 0;
  coupon_result record;
  new_order_id uuid;
  order_num text;
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'Cannot place an order for another user';
  end if;

  order_num := 'ORD-' || to_char(now(),'YYYYMMDD') || '-' || substr(md5(random()::text),1,6);

  insert into orders (order_number, user_id, shipping_address, payment_method, status, payment_status)
  values (order_num, p_user_id, p_shipping_address, p_payment_method, 'pending', 'pending')
  returning id into new_order_id;

  for item in select * from jsonb_array_elements(p_items) loop
    select * into prod from products where id = (item->>'product_id')::uuid for update;
    if not found or prod.status <> 'active' then
      raise exception 'Product % is not available', item->>'product_id';
    end if;
    qty := (item->>'quantity')::int;
    if prod.stock < qty then
      raise exception 'Insufficient stock for %', prod.name;
    end if;

    line_total := prod.price * qty;
    subtotal := subtotal + line_total;

    insert into order_items (order_id, product_id, product_name, quantity, price, subtotal)
    values (new_order_id, prod.id, prod.name, qty, prod.price, line_total);

    update products set stock = stock - qty where id = prod.id;
  end loop;

  if p_coupon_code is not null then
    select * into coupon_result from validate_coupon(p_coupon_code, subtotal);
    if coupon_result.valid then
      discount := coupon_result.discount;
      update coupons set used_count = used_count + 1 where code = p_coupon_code;
    end if;
  end if;

  update orders
    set subtotal = subtotal,
        discount = discount,
        shipping_fee = p_shipping_fee,
        total = subtotal - discount + p_shipping_fee,
        coupon_code = p_coupon_code
    where id = new_order_id;

  insert into notifications (user_id, title, message, type, link)
  values (p_user_id, 'Order placed', 'Your order ' || order_num || ' was received.', 'order', '/account/orders/' || new_order_id);

  insert into notifications (user_id, title, message, type, link)
  values (null, 'New order', order_num || ' was just placed.', 'admin_order', '/admin/orders/' || new_order_id);

  return new_order_id;
end;
$$;

grant execute on function create_order(uuid, jsonb, jsonb, text, text, numeric) to authenticated;
