-- Initialize Schema for Kito Marom Registration Links System

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'editor')),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create page_settings table
CREATE TABLE IF NOT EXISTS public.page_settings (
    id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid),
    page_title text NOT NULL DEFAULT 'צהרונים וקייטנות קיטו מרום',
    page_subtitle text NOT NULL DEFAULT 'בחרו את האיזור המבוקש כדי להירשם',
    intro_text text,
    logo_url text,
    hero_image_url text,
    contact_phone text,
    contact_email text,
    footer_text text NOT NULL DEFAULT 'כל הזכויות שמורות לקיטו מרום © 2026',
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create registration_cards table
CREATE TABLE IF NOT EXISTS public.registration_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    area_name text NOT NULL,
    display_title text NOT NULL,
    description text,
    image_url text,
    target_url text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    details text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert Default Page Settings Row
INSERT INTO public.page_settings (id, page_title, page_subtitle, intro_text, logo_url, contact_phone, contact_email, footer_text)
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'צהרונים וקייטנות תשפ"ו - קיטו מרום',
    'ההרשמה לצהרוני גני הילדים ובתי הספר החלה! בחרו את אזור המגורים שלכם לקבלת קישור הרשמה ישיר',
    'חברת קיטו מרום מפעילה תוכניות חינוכיות, קייטנות וצהרונים ברחבי הארץ בדגש על מצוינות, בטיחות והנאה לילדים.',
    'https://www.kitomarom.co.il/assets/images/logo.png',
    '09-7407000',
    'office@kitomarom.co.il',
    'כל הזכויות שמורות לקיטו מרום © 2026 | עיצוב ופיתוח מערכת הרשמה'
) ON CONFLICT DO NOTHING;

-- Seed Default Areas (from Atarix reference)
INSERT INTO public.registration_cards (area_name, display_title, description, target_url, sort_order, is_active)
VALUES 
('חריש', 'הרשמה לצהרוני גני ילדים ובתי ספר בחריש', 'צהרוני גני הילדים ובתי הספר היסודיים בחריש לשנת הלימודים תשפ"ו.', 'https://harish.co.il', 1, true),
('טירת הכרמל', 'הרשמה לצהרוני גני ילדים בטירת הכרמל', 'צהרונים איכותיים לילדי הגנים בטירת הכרמל עם צוות חם ומנוסה.', 'https://tirat-carmel.co.il', 2, true),
('ראשון לציון', 'הרשמה לצהרונים ובתי תלמיד בראשון לציון', 'מרכז הרשמה לצהרונים בבתי הספר היסודיים בראשון לציון.', 'https://rishon-lezion.co.il', 3, true),
('גבעתיים', 'צהרוני בתי ספר וגני ילדים בגבעתיים', 'תוכניות ניצנים וצהרוני קיטו מרום ברחבי גבעתיים.', 'https://givatayim.co.il', 4, true),
('הוד השרון', 'הרשמה לקייטנות וצהרונים בהוד השרון', 'הרשמת קיץ וצהרונים שוטפת לילדי גני הילדים בהוד השרון.', 'https://hod-hasharon.co.il', 5, true),
('מ.א בנימין', 'צהרונים וקייטנות במועצה אזורית בנימין', 'צהרוני יישובי מועצת בנימין לשנת תשפ"ו.', 'https://binyamin.org.il', 6, true)
ON CONFLICT DO NOTHING;

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Security Definer Functions to prevent RLS infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin' AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role IN ('admin', 'editor') AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles RLS Policies
CREATE POLICY "Allow users to read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow active admins to manage profiles" ON public.profiles
    FOR ALL USING (public.is_admin(auth.uid()));

-- 2. Page Settings RLS Policies
CREATE POLICY "Allow public read of settings" ON public.page_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow active staff to update settings" ON public.page_settings
    FOR UPDATE USING (public.is_staff(auth.uid()));

-- 3. Registration Cards RLS Policies
CREATE POLICY "Allow public read of active cards" ON public.registration_cards
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow active staff to manage cards" ON public.registration_cards
    FOR ALL USING (public.is_staff(auth.uid()));

-- 4. Audit Logs RLS Policies
CREATE POLICY "Allow active staff to read logs" ON public.audit_logs
    FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Allow active staff to insert logs" ON public.audit_logs
    FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

-- Profile Auto-Creation Trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    is_first_user boolean;
BEGIN
    -- Check if this is the first user in the profiles table
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
    
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data->>'full_name', 'משתמש קיטו מרום'), 
        new.email,
        CASE 
            WHEN is_first_user THEN 'admin'
            ELSE COALESCE(new.raw_user_meta_data->>'role', 'editor')
        END,
        true
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
