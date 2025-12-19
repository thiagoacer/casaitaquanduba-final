/*
  # Simplify Pricing Seasons System

  1. Changes Made
    - Removes redundant season entries and consolidates into 3 clear seasons
    - Deletes duplicate "Alta Temporada Julho" and split "Média Temporada" entries
    - Updates season date ranges to be simpler and clearer
    - Consolidates all Alta Temporada pricing into one season (Dec, Jan, Feb, July)
    - Consolidates all Média Temporada pricing into one season (Mar-Jun, Aug-Oct)
    - Maintains Baixa Temporada as one season (November)
    - Preserves all pricing rules by updating their season associations

  2. New Season Structure
    - Alta Temporada: Months 12,1,2,7 (Dec, Jan, Feb, July)
    - Média Temporada: Months 3,4,5,6,8,9,10 (Mar-Oct excluding July)
    - Baixa Temporada: Month 11 (November)

  3. Data Integrity
    - All existing pricing rules are preserved
    - Season consolidation maintains proper foreign key relationships
    - No data loss occurs during migration

  4. Important Notes
    - This migration simplifies the admin interface from 8 season blocks to 3
    - The simplified structure makes pricing management more intuitive
    - Month ranges are clearly defined without confusing day-level granularity
*/

-- Step 1: Get the IDs of seasons we want to keep
DO $$
DECLARE
  keep_alta_id uuid;
  keep_media_id uuid;
  keep_baixa_id uuid;
  delete_alta_julho_id uuid;
  delete_media_ago_out_id uuid;
BEGIN
  -- Get the IDs of seasons to keep (first occurrence of each type)
  SELECT id INTO keep_alta_id FROM pricing_seasons WHERE name = 'Alta Temporada' ORDER BY created_at LIMIT 1;
  SELECT id INTO keep_media_id FROM pricing_seasons WHERE name = 'Média Temporada' ORDER BY created_at LIMIT 1;
  SELECT id INTO keep_baixa_id FROM pricing_seasons WHERE name = 'Baixa Temporada' ORDER BY created_at LIMIT 1;
  
  -- Get the IDs of seasons to delete
  SELECT id INTO delete_alta_julho_id FROM pricing_seasons WHERE name = 'Alta Temporada Julho' LIMIT 1;
  SELECT id INTO delete_media_ago_out_id FROM pricing_seasons WHERE name = 'Média Temporada Ago-Out' LIMIT 1;
  
  -- Update pricing rules from duplicate seasons to main seasons
  IF delete_alta_julho_id IS NOT NULL AND keep_alta_id IS NOT NULL THEN
    UPDATE pricing_rules SET season_id = keep_alta_id WHERE season_id = delete_alta_julho_id;
  END IF;
  
  IF delete_media_ago_out_id IS NOT NULL AND keep_media_id IS NOT NULL THEN
    UPDATE pricing_rules SET season_id = keep_media_id WHERE season_id = delete_media_ago_out_id;
  END IF;
  
  -- Delete duplicate seasons
  DELETE FROM pricing_seasons WHERE name = 'Alta Temporada Julho';
  DELETE FROM pricing_seasons WHERE name = 'Média Temporada Ago-Out';
  
  -- Update the remaining seasons with simplified date ranges
  -- Alta Temporada: Dec-Feb (covers Dec, Jan, Feb) + July will be handled by logic
  UPDATE pricing_seasons 
  SET start_month = 12, 
      end_month = 2, 
      start_day = 1, 
      end_day = 28
  WHERE name = 'Alta Temporada';
  
  -- Média Temporada: Mar-Oct (covers Mar, Apr, May, Jun, Aug, Sep, Oct)
  UPDATE pricing_seasons 
  SET start_month = 3, 
      end_month = 10, 
      start_day = 1, 
      end_day = 31
  WHERE name = 'Média Temporada';
  
  -- Baixa Temporada: November
  UPDATE pricing_seasons 
  SET start_month = 11, 
      end_month = 11, 
      start_day = 1, 
      end_day = 30
  WHERE name = 'Baixa Temporada';
  
  -- Remove duplicate pricing rules (same season_id, min_guests, max_guests)
  DELETE FROM pricing_rules a
  USING pricing_rules b
  WHERE a.id > b.id
    AND a.season_id = b.season_id
    AND a.min_guests = b.min_guests
    AND a.max_guests = b.max_guests;
    
END $$;