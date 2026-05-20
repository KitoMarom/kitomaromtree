-- Update default page settings in database with the new official contact details
UPDATE public.page_settings
SET 
  contact_phone = '09-8344840',
  footer_text = 'כל הזכויות שמורות לקיטו מרום © 2026'
WHERE id = '00000000-0000-0000-0000-000000000000'::uuid;
