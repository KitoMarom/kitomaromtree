-- Add categorization columns to registration_cards table
ALTER TABLE public.registration_cards 
ADD COLUMN IF NOT EXISTS education_level text NOT NULL DEFAULT 'school' CHECK (education_level IN ('school', 'kindergarten')),
ADD COLUMN IF NOT EXISTS program_type text NOT NULL DEFAULT 'after_school' CHECK (program_type IN ('after_school', 'camp'));

-- Update existing seeded cards with reasonable category defaults
UPDATE public.registration_cards 
SET education_level = 'school', program_type = 'after_school'
WHERE area_name IN ('חריש', 'ראשון לציון', 'גבעתיים', 'מ.א בנימין');

UPDATE public.registration_cards 
SET education_level = 'kindergarten', program_type = 'after_school'
WHERE area_name IN ('טירת הכרמל');

UPDATE public.registration_cards 
SET education_level = 'school', program_type = 'camp'
WHERE area_name IN ('הוד השרון');
