-- Add expected_return_date column to assignment_history
-- Run this in your Supabase SQL Editor

ALTER TABLE public.assignment_history 
ADD COLUMN IF NOT EXISTS expected_return_date DATE;
