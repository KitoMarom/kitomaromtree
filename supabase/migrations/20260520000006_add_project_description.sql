ALTER TABLE public.registration_cards
ADD COLUMN IF NOT EXISTS project_description text;

UPDATE public.registration_cards
SET project_description = ''
WHERE project_description IS NULL;

ALTER TABLE public.registration_cards
ALTER COLUMN project_description SET DEFAULT '',
ALTER COLUMN project_description SET NOT NULL;
