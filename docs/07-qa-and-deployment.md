# Phase 7: QA, Deployment, and final Release Documentation - Kito Marom

This document details the functional testing results, deployment steps, environment variables setup, and instructions for system handoff.

---

## 1. Functional QA Test Cases

### 1.1 Public Landing Page
* **Anonymous Access**: Public users can access `/` instantly without authenticating.
* **Filter States**: Deactivated cards (`is_active: false`) are filtered in PostgreSQL and never render to parents.
* **Order Sorting**: Cards are fetched matching `sort_order ASC` and render in precise order.
* **Card Links**: Clicking cards triggers external tabs (`target="_blank"`) successfully.

### 1.2 Administrative Auth
* **Login Gating**: Attempts to access `/admin` or `/admin/settings` when not logged in instantly triggers redirection to `/admin/login`.
* **First Admin Trigger**: Registering a new account when `profiles` is empty successfully assigns `'admin'` role and grants access.

### 1.3 Card & Settings Management
* **Update settings**: Modifying title/phone updates public header and footer immediately.
* **Link CRUD**: Creating and editing area cards updates content dynamically.
* **Audit Trails**: Saving settings or cards automatically appends logged activity to `public.audit_logs`.

### 1.4 User Permissions
* **Role Gate**: Active editors are barred from accessing `/admin/users` or calling user APIs.
* **Self Lockout Protection**: Admins are prevented from changing their own role or deactivating their own account.

---

## 2. Production Deployment Steps

### Step 1: Deploy Supabase Schema
1. Open your Supabase Dashboard: `rzpnbfvqqtzskkksnpsu`.
2. Access the **SQL Editor** in the left menu.
3. Paste the contents of [supabase/migrations/20260520000000_init_schema.sql](file:///c:/Users/David/Desktop/ריל מרקטינג/קיטו מרום/kitomaromtree/supabase/migrations/20260520000000_init_schema.sql).
4. Click **Run**.

### Step 2: Initialize Netlify Deployment
1. Log in to your Netlify dashboard at [netlify.com](https://netlify.com).
2. Click **Add new site > Import an existing project** and link it to your GitHub repository `jobskitomarom/kitomaromtree`.
3. Set the following build settings:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
4. Netlify will read your `netlify.toml` file automatically to bundle the serverless functions in `netlify/functions`.

### Step 3: Enter Environment Variables in Netlify
Under **Site configuration > Environment variables**, add the following three parameters:
1. `PUBLIC_SUPABASE_URL`: Your project endpoint (e.g. `https://rzpnbfvqqtzskkksnpsu.supabase.co`).
2. `PUBLIC_SUPABASE_ANON_KEY`: Your project public anon key.
3. `SUPABASE_SERVICE_ROLE_KEY`: Your project secret service role key (Secret).

*Note: In your local workspace, rename `.env.example` to `.env` and fill in `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY` to run the project locally via `npm run dev`.*

---

## 3. Creating the First Admin Account
1. Once deployed, navigate to the `/admin/login` page on your live domain.
2. Select the **הרשמת המנהל הראשון / משתמש חדש** tab.
3. Enter your full name, desired email, and password.
4. Click **הרשמה והגדרת מנהל**.
5. Log in. You are now the full Admin and can start managing links and adding team editors immediately!
