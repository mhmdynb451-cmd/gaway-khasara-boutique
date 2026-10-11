CREATE OR REPLACE FUNCTION public.place_order(_items jsonb, _address_id uuid, _zone_id uuid, _payment_method text, _payment_reference text DEFAULT ''::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  if _zone.fee is null or _zone.fee <= 0 then raise exception 'رسوم التوصيل لهذه المنطقة غير محددة بعد'; end if;
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
    _dep := _zone.fee;
  else
    _dep := _total;
  end if;

  update orders set subtotal = _sub, total = _total, deposit_amount = _dep, remaining_amount = _total - _dep,
    payment_status = case when _dep > 0 and coalesce(_payment_reference,'') <> '' then 'awaiting_verification' when _dep > 0 then 'pending' else 'verified' end
  where id = _oid;
  return _oid;
end $function$;