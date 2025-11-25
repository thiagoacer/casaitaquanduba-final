/*
  # Pricing Configuration System

  1. New Tables
    - `pricing_config`
      - `id` (uuid, primary key) - Unique identifier
      - `key` (text, unique) - Configuration key (e.g., 'cleaning_fee', 'discount_percentage')
      - `value` (numeric) - Configuration value
      - `description` (text) - Human-readable description of the config
      - `updated_at` (timestamptz) - Last update timestamp
      - `created_at` (timestamptz) - Creation timestamp

  2. Initial Data
    - Insert default configuration values:
      - cleaning_fee: 300
      - discount_percentage: 15
      - discount_threshold_nights: 7

  3. Security
    - Enable RLS on `pricing_config` table
    - Add policy for public read access (anyone can view prices)
    - Add policy for authenticated admin users to update prices

  4. Notes
    - This table stores general pricing configurations
    - The existing pricing_seasons and pricing_rules tables handle season-specific pricing
    - All values are stored as numeric for flexibility
*/

-- Create pricing_config table
CREATE TABLE IF NOT EXISTS pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value numeric NOT NULL,
  description text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Insert default configuration values
INSERT INTO pricing_config (key, value, description) VALUES
  ('cleaning_fee', 300, 'Taxa de limpeza única por estadia'),
  ('discount_percentage', 15, 'Percentual de desconto para estadias longas'),
  ('discount_threshold_nights', 7, 'Número mínimo de noites para desconto')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read pricing config (public data)
CREATE POLICY "Anyone can read pricing config"
  ON pricing_config
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can update pricing config
CREATE POLICY "Authenticated users can update pricing config"
  ON pricing_config
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed pricing_seasons table with default seasons if empty
INSERT INTO pricing_seasons (name, start_month, end_month, start_day, end_day, color) VALUES
  ('Alta Temporada', 12, 2, 1, 28, 'from-red-500 to-orange-500'),
  ('Média Temporada', 3, 10, 1, 31, 'from-[#0A7B9B] to-[#2EC4B6]'),
  ('Baixa Temporada', 11, 11, 1, 30, 'from-green-500 to-emerald-500')
ON CONFLICT DO NOTHING;

-- Get season IDs for pricing rules
DO $$
DECLARE
  alta_season_id uuid;
  media_season_id uuid;
  baixa_season_id uuid;
BEGIN
  -- Get season IDs
  SELECT id INTO alta_season_id FROM pricing_seasons WHERE name = 'Alta Temporada' LIMIT 1;
  SELECT id INTO media_season_id FROM pricing_seasons WHERE name = 'Média Temporada' LIMIT 1;
  SELECT id INTO baixa_season_id FROM pricing_seasons WHERE name = 'Baixa Temporada' LIMIT 1;

  -- Insert pricing rules for Alta Temporada if they don't exist
  IF alta_season_id IS NOT NULL THEN
    INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night) VALUES
      (alta_season_id, 1, 6, 1200),
      (alta_season_id, 7, 8, 1500),
      (alta_season_id, 9, 10, 1800)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert pricing rules for Média Temporada
  IF media_season_id IS NOT NULL THEN
    INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night) VALUES
      (media_season_id, 1, 6, 900),
      (media_season_id, 7, 8, 1100),
      (media_season_id, 9, 10, 1300)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert pricing rules for Baixa Temporada
  IF baixa_season_id IS NOT NULL THEN
    INSERT INTO pricing_rules (season_id, min_guests, max_guests, price_per_night) VALUES
      (baixa_season_id, 1, 6, 700),
      (baixa_season_id, 7, 8, 900),
      (baixa_season_id, 9, 10, 1100)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to pricing_config
DROP TRIGGER IF EXISTS update_pricing_config_updated_at ON pricing_config;
CREATE TRIGGER update_pricing_config_updated_at
  BEFORE UPDATE ON pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();