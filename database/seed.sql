-- ============================================================
-- TailorMate Seed Data
-- ============================================================

insert into categories (name, description) values
  ('Men''s Wear', 'Shirts, trousers, suits, sherwanis'),
  ('Women''s Wear', 'Blouses, salwar suits, sarees, gowns'),
  ('Kids Wear', 'School uniforms, party wear'),
  ('Alterations', 'Resizing, repairs, hemming'),
  ('Bridal & Ethnic', 'Wedding and festive wear'),
  ('Uniforms', 'Corporate and institutional uniforms')
on conflict (name) do nothing;

insert into site_settings (key, value) values
  ('site_name', '"TailorMate"'),
  ('support_email', '"support@tailormate.app"'),
  ('currency', '"INR"'),
  ('booking_lead_time_hours', '24'),
  ('platform_commission_percent', '10')
on conflict (key) do nothing;
