-- Add return_date column to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS return_date DATE;
