-- Allow an activity area to target schools, kindergartens, or both.
ALTER TABLE public.registration_cards
DROP CONSTRAINT IF EXISTS registration_cards_education_level_check;

ALTER TABLE public.registration_cards
ADD CONSTRAINT registration_cards_education_level_check
CHECK (education_level IN ('school', 'kindergarten', 'both'));
