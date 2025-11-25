-- Simple test data for pack-and-scan testing
-- Uses existing admin user as customer
-- Creates 1 order and 5 QR codes

-- Clean up existing test data first
DELETE FROM qr_codes WHERE qr_code_id IN ('qr0001', 'qr0002', 'qr0003', 'qr0004', 'qr0005');
DELETE FROM orders WHERE order_number = 'TEST-001';

-- Insert 1 test order
INSERT INTO orders (
  id,
  user_id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  status,
  total_amount,
  shipping_name,
  shipping_email,
  shipping_phone,
  shipping_address,
  shipping_city,
  shipping_state,
  shipping_zip,
  shipping_country,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'b47101e8-ac55-497b-a696-f08d76997d9b', -- existing admin user
  'TEST-001',
  'Test Customer',
  'test@example.com',
  '555-0123',
  'processing',
  50.00,
  'Test Customer',
  'test@example.com',
  '555-0123',
  '{"street": "123 Test St", "unit": "Apt 1"}',
  'Test City',
  'CA',
  '90001',
  'USA',
  NOW(),
  NOW()
);

-- Insert 5 QR codes
INSERT INTO qr_codes (
  id,
  qr_code_id,
  status,
  product_type,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'qr0001', 'available', 'premium', NOW(), NOW()),
  (gen_random_uuid(), 'qr0002', 'available', 'premium', NOW(), NOW()),
  (gen_random_uuid(), 'qr0003', 'available', 'premium', NOW(), NOW()),
  (gen_random_uuid(), 'qr0004', 'available', 'premium', NOW(), NOW()),
  (gen_random_uuid(), 'qr0005', 'available', 'premium', NOW(), NOW());
