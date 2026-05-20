# Phase 2: Supabase Database, Auth, RLS, and Storage - Kito Marom

This document outlines the database schema, security policies, triggers, storage configurations, and procedures to establish the Supabase backend for Kito Marom.

---

## 1. Database Schema

All SQL scripts are contained in [supabase/migrations/20260520000000_init_schema.sql](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/supabase/migrations/20260520000000_init_schema.sql).

### 1.1 Tables Summary

#### Table: `public.profiles`
Links standard Supabase Auth users to Kito Marom system roles (`admin`, `editor`).
* `id` (uuid, PRIMARY KEY): Matches `auth.users.id` with `ON DELETE CASCADE`.
* `full_name` (text): Full name of the editor/admin staff.
* `email` (text): Email address (unique).
* `role` (text): Allowed values: `'admin'`, `'editor'`.
* `is_active` (boolean): Default is `true`. Deactivated users cannot log in or make changes.

#### Table: `public.page_settings`
Single row holding customizable fields of the public landing page.
* `id` (uuid, PRIMARY KEY): Constrained to `'00000000-0000-0000-0000-000000000000'`.
* `page_title` (text): Public hero heading.
* `page_subtitle` (text): Description subtitle.
* `intro_text` (text): Introduction context paragraph.
* `logo_url` (text): URL to the Kito Marom logo.
* `hero_image_url` (text): URL to a promotional header image.
* `contact_phone` (text): Main contact line.
* `contact_email` (text): Contact email address.
* `footer_text` (text): Custom copyright/info footer line.

#### Table: `public.registration_cards`
Stores the individual cards representing each camp or program registration link.
* `id` (uuid, PRIMARY KEY): Automatically generated.
* `area_name` (text): Area name (e.g., `'חריש'`).
* `display_title` (text): Specific registration program title (e.g., `'צהרוני גני ילדים תשפ"ו'`).
* `description` (text): Optional extra description.
* `image_url` (text): Optional thumbnail for the card.
* `target_url` (text): Destination registration page.
* `sort_order` (integer): Sorting value (ascending).
* `is_active` (boolean): Default is `true`. Inactive cards are hidden from parents.

#### Table: `public.audit_logs`
Read-only logging of user administrative operations.
* `id` (uuid, PRIMARY KEY).
* `user_id` (uuid): ID of the staff member.
* `action` (text): e.g. `'UPDATE_SETTINGS'`, `'CREATE_CARD'`.
* `entity_type` (text): `'registration_cards'` or `'page_settings'`.
* `entity_id` (uuid): Referenced entity row.

---

## 2. Row-Level Security (RLS) Policies

RLS is enabled on **all** tables to guarantee security:
1. **Public Read Only**: Anonymous users can only `SELECT` from `page_settings` and `registration_cards` (where `is_active = true`). They are denied write access or access to other tables.
2. **Staff Read/Write**: Active profiles with the `admin` or `editor` role can update settings, insert logs, and fully manage registration cards.
3. **Admin-Only Access**: Only active `admin` roles can manage system user profiles.

---

## 3. Automation Triggers

### 3.1 Trigger `on_auth_user_created`
An automatic trigger is attached to `auth.users` that executes `public.handle_new_user()` on user creation:
* If the `profiles` table is completely empty, the very first user who signs up is automatically designated as an **`admin`**.
* Subsequent users created or invited are automatically defaulted to the **`editor`** role.
* Submits a corresponding record to `public.profiles` using metadata (e.g. `full_name`).

---

## 4. Storage Bucket Setup

To handle custom images and logos, a **public storage bucket** should be configured:
* **Bucket Name**: `public-assets`
* **Access Level**: Public (anonymous users can read images).
* **Upload Restrictions**: Only authenticated active staff (`admin` or `editor`) can write/delete files in this bucket.

### Recommended Storage RLS Policies:
```sql
-- Allow public select/read of assets
CREATE POLICY "Allow public read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'public-assets');

-- Allow authenticated active staff to insert/update/delete assets
CREATE POLICY "Allow staff upload" 
ON storage.objects FOR ALL 
USING (
  bucket_id = 'public-assets' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_active = true
  )
);
```

---

## 5. How to Deploy Database & Create the First Admin

### 5.1 How to run the SQL in Supabase
1. Access your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Open your project: `rzpnbfvqqtzskkksnpsu`.
3. In the left navigation bar, click on **SQL Editor**.
4. Click **New Query**.
5. Copy the entire contents of the migration file [init_schema.sql](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/supabase/migrations/20260520000000_init_schema.sql) and paste it into the editor.
6. Click **Run**. All tables, constraints, default configurations, sample cards, and triggers will be created instantly.

### 5.2 How to Create your first Admin User
Once the SQL schema is deployed:
1. Open the internal Admin panel `/admin/login` once the project UI is compiled and running.
2. Click "Sign Up" or trigger a standard email sign-up. 
3. Because the `profiles` table is empty, this user will automatically be designated as an **`admin`**.
4. After logging in, you can then invite or create additional staff members (who will default to the restricted `editor` role unless explicitly upgraded).
