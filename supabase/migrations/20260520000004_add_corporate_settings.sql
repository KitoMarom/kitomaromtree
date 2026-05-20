-- Add new corporate details columns to page_settings table
ALTER TABLE public.page_settings
ADD COLUMN IF NOT EXISTS company_name text NOT NULL DEFAULT 'קיטו מרום הדרכה טכנולוגית בע"מ',
ADD COLUMN IF NOT EXISTS office_address text NOT NULL DEFAULT 'מתחם INTRO, רחוב האורזים 2 נתניה.',
ADD COLUMN IF NOT EXISTS po_box text NOT NULL DEFAULT 'ת.ד. 2356, נתניה 42120',
ADD COLUMN IF NOT EXISTS contact_fax text NOT NULL DEFAULT '09-8344841';

-- Drop the old contact_email column if it exists
ALTER TABLE public.page_settings
DROP COLUMN IF EXISTS contact_email;

-- Update the existing settings record with the official details
UPDATE public.page_settings
SET 
  company_name = 'קיטו מרום הדרכה טכנולוגית בע"מ',
  office_address = 'מתחם INTRO, רחוב האורזים 2 נתניה.',
  po_box = 'ת.ד. 2356, נתניה 42120',
  contact_phone = '09-8344840',
  contact_fax = '09-8344841'
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;
