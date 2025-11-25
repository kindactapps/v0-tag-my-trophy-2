-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
DROP TRIGGER IF EXISTS update_subscription_events_updated_at ON subscription_events;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP TABLE IF EXISTS subscription_events CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Create subscriptions table to track customer subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamp with time zone NOT NULL,
  current_period_end timestamp with time zone NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamp with time zone,
  trial_end timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create subscription events table for audit trail
CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  stripe_event_id text UNIQUE NOT NULL,
  event_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_event_type ON subscription_events(event_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for subscription_events
CREATE POLICY "Users can view their subscription events"
  ON subscription_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions 
      WHERE subscriptions.id = subscription_events.subscription_id 
      AND subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all subscription events"
  ON subscription_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage subscription events"
  ON subscription_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add subscription_id column to orders table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL;
    CREATE INDEX idx_orders_subscription_id ON orders(subscription_id);
  END IF;
END $$;
