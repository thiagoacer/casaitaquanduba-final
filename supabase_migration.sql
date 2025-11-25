-- Migration: Sistema de Reservas - Casa Itaquanduba
-- Description: Creates complete booking system with pricing, blocked dates, and inquiries

-- Create pricing_seasons table
CREATE TABLE IF NOT EXISTS pricing_seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_month integer NOT NULL CHECK (start_month >= 1 AND start_month <= 12),
  end_month integer NOT NULL CHECK (end_month >= 1 AND end_month <= 12),
  start_day integer NOT NULL CHECK (start_day >= 1 AND start_day <= 31),
  end_day integer NOT NULL CHECK (end_day >= 1 AND end_day <= 31),
  color text NOT NULL DEFAULT '#2EC4B6',
  created_at timestamptz DEFAULT now()
);

-- Create pricing_rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES pricing_seasons(id) ON DELETE CASCADE,
  min_guests integer NOT NULL CHECK (min_guests >= 1),
  max_guests integer NOT NULL CHECK (max_guests >= min_guests),
  price_per_night decimal(10,2) NOT NULL CHECK (price_per_night > 0),
  created_at timestamptz DEFAULT now()
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create booking_inquiries table
CREATE TABLE IF NOT EXISTS booking_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  num_guests integer NOT NULL CHECK (num_guests >= 1),
  num_nights integer NOT NULL CHECK (num_nights >= 1),
  calculated_price decimal(10,2) NOT NULL CHECK (calculated_price >= 0),
  discount_applied boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  is_large_group boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pricing_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view pricing seasons"
  ON pricing_seasons FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view pricing rules"
  ON pricing_rules FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create booking inquiries"
  ON booking_inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view booking inquiries"
  ON booking_inquiries FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial data
INSERT INTO pricing_seasons (name, start_month, end_month, start_day, end_day, color)
VALUES
  ('Alta Temporada', 12, 2, 1, 28, 'from-red-500 to-orange-500'),
  ('Alta Temporada Julho', 7, 7, 1, 31, 'from-red-500 to-orange-500'),
  ('Média Temporada', 3, 6, 1, 30, 'from-[#0A7B9B] to-[#2EC4B6]'),
  ('Média Temporada Ago-Out', 8, 10, 1, 31, 'from-[#0A7B9B] to-[#2EC4B6]'),
  ('Baixa Temporada', 11, 11, 1, 30, 'from-green-500 to-emerald-500')
ON CONFLICT DO NOTHING;

-- Insert pricing rules for Alta Temporada
INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 1, 4, 1200 FROM pricing_seasons WHERE name = 'Alta Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 5, 8, 1500 FROM pricing_seasons WHERE name = 'Alta Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 9, 10, 1800 FROM pricing_seasons WHERE name = 'Alta Temporada'
ON CONFLICT DO NOTHING;

-- Insert pricing rules for Alta Temporada Julho
INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 1, 4, 1200 FROM pricing_seasons WHERE name = 'Alta Temporada Julho'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 5, 8, 1500 FROM pricing_seasons WHERE name = 'Alta Temporada Julho'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 9, 10, 1800 FROM pricing_seasons WHERE name = 'Alta Temporada Julho'
ON CONFLICT DO NOTHING;

-- Insert pricing rules for Média Temporada
INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 1, 4, 900 FROM pricing_seasons WHERE name = 'Média Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 5, 8, 1100 FROM pricing_seasons WHERE name = 'Média Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 9, 10, 1300 FROM pricing_seasons WHERE name = 'Média Temporada'
ON CONFLICT DO NOTHING;

-- Insert pricing rules for Média Temporada Ago-Out
INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 1, 4, 900 FROM pricing_seasons WHERE name = 'Média Temporada Ago-Out'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 5, 8, 1100 FROM pricing_seasons WHERE name = 'Média Temporada Ago-Out'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 9, 10, 1300 FROM pricing_seasons WHERE name = 'Média Temporada Ago-Out'
ON CONFLICT DO NOTHING;

-- Insert pricing rules for Baixa Temporada
INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 1, 4, 700 FROM pricing_seasons WHERE name = 'Baixa Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 5, 8, 900 FROM pricing_seasons WHERE name = 'Baixa Temporada'
ON CONFLICT DO NOTHING;

INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night)
SELECT id, 9, 10, 1100 FROM pricing_seasons WHERE name = 'Baixa Temporada'
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_rules_season ON pricing_rules(season_id);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_dates ON booking_inquiries(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_status ON booking_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_booking_inquiries_created ON booking_inquiries(created_at DESC);
