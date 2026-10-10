
create type public.app_role as enum ('admin','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- first user becomes admin, everyone gets customer
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  insert into public.user_roles(user_id, role) values (new.id, 'customer');
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  recipient text not null,
  phone text not null,
  governorate text not null,
  city text not null,
  street text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text not null default '',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "public read active cats" on public.categories for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage cats" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  compare_price numeric(10,2),
  stock int not null default 0 check (stock >= 0),
  image_url text not null default '',
  is_demo boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active products" on public.products for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric(10,2) not null default 0 check (fee >= 0),
  active boolean not null default true,
  sort_order int not null default 0
);
grant select on public.shipping_zones to anon, authenticated;
grant insert, update, delete on public.shipping_zones to authenticated;
grant all on public.shipping_zones to service_role;
alter table public.shipping_zones enable row level security;
create policy "public read zones" on public.shipping_zones for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage zones" on public.shipping_zones for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  cod_enabled boolean not null default true,
  cod_deposit_type text not null default 'fixed' check (cod_deposit_type in ('fixed','percent')),
  cod_deposit_value numeric(10,2) not null default 100 check (cod_deposit_value >= 0),
  vodafone_enabled boolean not null default false,
  vodafone_number text not null default '',
  visa_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "public read settings" on public.store_settings for select using (true);
create policy "admin update settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  user_id uuid not null,
  recipient text not null, phone text not null, governorate text not null, city text not null, street text not null, notes text not null default '',
  shipping_zone text not null,
  subtotal numeric(10,2) not null,
  shipping_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cod','vodafone','visa')),
  deposit_amount numeric(10,2) not null default 0,
  remaining_amount numeric(10,2) not null default 0,
  payment_reference text not null default '',
  payment_status text not null default 'pending' check (payment_status in ('pending','awaiting_verification','verified','failed')),
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);
grant select on public.orders to authenticated;
grant update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own or admin orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  name text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0)
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "own or admin items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

-- secure order placement: prices, stock, deposit computed in DB
create or replace function public.place_order(_items jsonb, _address_id uuid, _zone_id uuid, _payment_method text, _payment_reference text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _addr public.addresses;
  _zone public.shipping_zones;
  _s public.store_settings;
  _sub numeric := 0; _total numeric; _dep numeric := 0;
  _oid uuid; _it jsonb; _p public.products; _q int;
begin
  if _uid is null then raise exception 'يجب تسجيل الدخول'; end if;
  select * into _addr from addresses where id = _address_id and user_id = _uid;
  if not found then raise exception 'العنوان غير صالح'; end if;
  select * into _zone from shipping_zones where id = _zone_id and active;
  if not found then raise exception 'منطقة الشحن غير متاحة'; end if;
  select * into _s from store_settings where id = 1;
  if _payment_method = 'cod' and not _s.cod_enabled then raise exception 'الدفع عند الاستلام غير متاح'; end if;
  if _payment_method = 'vodafone' and not _s.vodafone_enabled then raise exception 'فودافون كاش غير مفعّل بعد'; end if;
  if _payment_method = 'visa' then raise exception 'الدفع بالفيزا غير مفعّل حتى يكتمل ربط بوابة الدفع'; end if;
  if _payment_method not in ('cod','vodafone') then raise exception 'طريقة دفع غير صالحة'; end if;
  if jsonb_array_length(_items) = 0 then raise exception 'السلة فارغة'; end if;

  insert into orders(user_id, recipient, phone, governorate, city, street, notes, shipping_zone, subtotal, shipping_fee, total, payment_method, payment_reference)
  values (_uid, _addr.recipient, _addr.phone, _addr.governorate, _addr.city, _addr.street, _addr.notes, _zone.name, 0, _zone.fee, 0, _payment_method, coalesce(_payment_reference,''))
  returning id into _oid;

  for _it in select * from jsonb_array_elements(_items) loop
    _q := (_it->>'quantity')::int;
    if _q is null or _q < 1 then raise exception 'كمية غير صالحة'; end if;
    select * into _p from products where id = (_it->>'product_id')::uuid and active for update;
    if not found then raise exception 'منتج غير متاح'; end if;
    if _p.stock < _q then raise exception 'الكمية المطلوبة من "%" غير متوفرة', _p.name; end if;
    update products set stock = stock - _q where id = _p.id;
    insert into order_items(order_id, product_id, name, unit_price, quantity) values (_oid, _p.id, _p.name, _p.price, _q);
    _sub := _sub + _p.price * _q;
  end loop;

  _total := _sub + _zone.fee;
  if _payment_method = 'cod' then
    if _s.cod_deposit_type = 'percent' then _dep := round(_total * least(_s.cod_deposit_value,100) / 100, 2);
    else _dep := least(_s.cod_deposit_value, _total); end if;
  else
    _dep := _total;
  end if;

  update orders set subtotal = _sub, total = _total, deposit_amount = _dep, remaining_amount = _total - _dep,
    payment_status = case when _dep > 0 and coalesce(_payment_reference,'') <> '' then 'awaiting_verification' when _dep > 0 then 'pending' else 'verified' end
  where id = _oid;
  return _oid;
end $$;
revoke all on function public.place_order(jsonb, uuid, uuid, text, text) from public, anon;
grant execute on function public.place_order(jsonb, uuid, uuid, text, text) to authenticated;

-- customer can submit transfer reference for own order
create or replace function public.submit_payment_reference(_order_id uuid, _ref text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update orders set payment_reference = _ref, payment_status = 'awaiting_verification'
  where id = _order_id and user_id = auth.uid() and payment_status in ('pending','failed');
  if not found then raise exception 'لا يمكن تحديث هذا الطلب'; end if;
end $$;
revoke all on function public.submit_payment_reference(uuid, text) from public, anon;
grant execute on function public.submit_payment_reference(uuid, text) to authenticated;

insert into public.store_settings(id) values (1);

insert into public.shipping_zones(name, fee, sort_order) values
('القاهرة والجيزة', 50, 1), ('الإسكندرية', 60, 2), ('الدلتا والقناة', 70, 3), ('الصعيد', 90, 4);

insert into public.categories(name, slug, image_url, sort_order) values
('ملابس حريمي','women','/images/cat-women.jpg',1),
('ملابس رجالي','men','/images/cat-men.jpg',2),
('ملابس أطفال','kids','/images/cat-kids.jpg',3),
('أحذية','shoes','/images/cat-shoes.jpg',4),
('مستلزمات العرائس','bridal','/images/cat-gifts.jpg',5),
('مستلزمات المدارس','school','/images/cat-kids.jpg',6),
('الهدايا والمنزل','gifts-home','/images/cat-gifts.jpg',7);

insert into public.products(category_id, name, description, price, compare_price, stock, image_url, is_demo)
select c.id, p.name, 'منتج تجريبي للعرض فقط — استبدله بمنتجك الحقيقي من لوحة الإدارة.', p.price, p.cp, p.stock, c.image_url, true
from public.categories c join (values
 ('women','بلوزة تجريبية',350,420,12),('women','فستان تجريبي',600,null,5),
 ('men','قميص تجريبي',300,null,10),('men','بنطلون تجريبي',450,520,8),
 ('kids','طقم أطفال تجريبي',250,null,15),('shoes','حذاء تجريبي',550,650,6),
 ('bridal','طقم عروسة تجريبي',900,null,3),('school','شنطة مدرسية تجريبية',280,null,20),
 ('gifts-home','صندوق هدية تجريبي',200,250,25),('gifts-home','مفرش منزلي تجريبي',320,null,0)
) as p(slug,name,price,cp,stock) on p.slug = c.slug;
