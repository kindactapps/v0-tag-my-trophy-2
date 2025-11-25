-- Add Demo Order for Testing Order Management System
-- This creates a realistic order with all necessary data to test the workflow

-- Insert a demo customer profile (if not exists)
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'demo.customer@example.com',
    'Demo Customer',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert a demo order with comprehensive data
INSERT INTO orders (
    id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    shipping_name,
    shipping_email,
    shipping_phone,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip,
    shipping_country,
    plan_type,
    total_amount,
    status,
    priority_level,
    estimated_ship_date,
    notes,
    user_id,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000001'::uuid,
    'ORD-100001',
    'John Smith',
    'demo.customer@example.com',
    '(555) 123-4567',
    'John Smith',
    'demo.customer@example.com',
    '(555) 123-4567',
    '{"street": "123 Main Street", "unit": "Apt 4B"}'::jsonb,
    'San Francisco',
    'CA',
    '94102',
    'US',
    'premium',
    79.99,
    'processing',
    'high',
    CURRENT_DATE + INTERVAL '3 days',
    'Customer requested expedited processing. Include extra care instructions.',
    '00000000-0000-0000-0000-000000000001'::uuid,
    NOW() - INTERVAL '2 hours',
    NOW()
)
ON CONFLICT (order_number) DO NOTHING;

-- Insert order items for the demo order
INSERT INTO order_items (
    id,
    order_id,
    inventory_id,
    quantity,
    price,
    created_at
) VALUES 
(
    '20000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    NULL, -- No specific inventory item linked yet
    2,
    39.99,
    NOW() - INTERVAL '2 hours'
),
(
    '20000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    1,
    0.00, -- Free item or promotional
    NOW() - INTERVAL '2 hours'
)
ON CONFLICT (id) DO NOTHING;

-- Insert initial status history
INSERT INTO order_status_history (
    id,
    order_id,
    old_status,
    new_status,
    change_reason,
    notes,
    created_at
) VALUES 
(
    '30000000-0000-0000-0000-000000000001'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'pending',
    'Order created',
    'Order received from customer',
    NOW() - INTERVAL '2 hours'
),
(
    '30000000-0000-0000-0000-000000000002'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    'pending',
    'processing',
    'Payment confirmed',
    'Payment processed successfully. Ready for fulfillment.',
    NOW() - INTERVAL '1 hour'
)
ON CONFLICT (id) DO NOTHING;

-- Create a demo QR code batch
INSERT INTO qr_code_batches (
    id,
    batch_number,
    batch_size,
    start_code,
    end_code,
    status,
    notes,
    created_at,
    updated_at
) VALUES (
    '40000000-0000-0000-0000-000000000001'::uuid,
    'BATCH-DEMO-001',
    30,
    'qr0001',
    'qr0030',
    'created',
    'Demo batch for testing order management system',
    NOW() - INTERVAL '1 day',
    NOW()
)
ON CONFLICT (batch_number) DO NOTHING;

-- Create some demo QR codes in the batch
INSERT INTO qr_codes (
    id,
    qr_code_id,
    batch_id,
    status,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'qr' || LPAD(generate_series::TEXT, 4, '0'),
    '40000000-0000-0000-0000-000000000001'::uuid,
    CASE 
        WHEN generate_series <= 3 THEN 'available'
        ELSE 'available'
    END,
    NOW() - INTERVAL '1 day',
    NOW()
FROM generate_series(1, 10)
ON CONFLICT (qr_code_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Demo order created successfully!';
    RAISE NOTICE '  Order Number: ORD-100001';
    RAISE NOTICE '  Customer: John Smith (demo.customer@example.com)';
    RAISE NOTICE '  Status: processing';
    RAISE NOTICE '  Priority: high';
    RAISE NOTICE '  Total: $79.99';
    RAISE NOTICE '  Items: 2 order items';
    RAISE NOTICE '  QR Codes: 10 available codes in BATCH-DEMO-001';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test the order management system at /admin/orders';
END $$;

-- Verify the data was inserted
SELECT 
    'Demo Order Summary' as info,
    o.order_number,
    o.customer_name,
    o.status,
    o.priority_level,
    o.total_amount,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.order_number = 'ORD-100001'
GROUP BY o.id, o.order_number, o.customer_name, o.status, o.priority_level, o.total_amount;
