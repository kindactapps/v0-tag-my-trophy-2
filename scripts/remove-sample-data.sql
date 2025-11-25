-- Script to remove all sample/demo data from the database
-- Run this before production deployment

-- Remove sample profiles
DELETE FROM profiles WHERE email IN (
  'admin@tagmytrophy.com',
  'demo@tagmytrophy.com',
  'customer1@example.com',
  'customer2@example.com',
  'customer3@example.com',
  'john.smith@email.com',
  'sarah.j@email.com',
  'mike.wilson@email.com',
  'emily.davis@email.com',
  'lisa.brown@email.com'
);

-- Remove sample QR slugs
DELETE FROM qr_slugs WHERE slug IN (
  'mountain-sunrise-demo',
  'family-fishing-trip',
  'graduation-memories-2024',
  'wedding-celebration',
  'available-tag-001',
  'river-adventure-x7k9',
  'tigers-soccer-2024',
  'mountain-journey-b3m5',
  'meadow-celebration-q8w2'
);

-- Remove sample orders
DELETE FROM orders WHERE customer_email LIKE '%@example.com';

-- Remove sample stores (keep if you want to use them, otherwise delete)
-- DELETE FROM stores WHERE name IN ('Downtown Sports', 'Athletic Zone', 'Trophy Central', 'Victory Shop');

-- Remove sample packages
DELETE FROM packages WHERE package_name IN (
  'Holiday Bundle 2024',
  'Spring Collection',
  'Corporate Package A',
  'Retail Starter Pack'
);

-- Remove sample range presets
DELETE FROM range_presets WHERE name IN (
  'Small Batch',
  'Medium Batch',
  'Large Batch',
  'Store Assignment'
);

-- Verify cleanup
SELECT 
  'Cleanup completed. Remaining records:' as status,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM qr_slugs) as qr_slugs_count,
  (SELECT COUNT(*) FROM orders) as orders_count,
  (SELECT COUNT(*) FROM stores) as stores_count,
  (SELECT COUNT(*) FROM packages) as packages_count;
