-- Update logo URL in page_settings to the correct official Kito Marom logo
UPDATE public.page_settings
SET logo_url = 'https://www.kitomarom.co.il/assets/images/logo.png'
WHERE id = '00000000-0000-0000-0000-000000000000';
