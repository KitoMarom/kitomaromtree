# Phase 1: Product and Architecture Plan - Kito Marom Registration Links

This document defines the final product specifications, technical architecture, data model, authentication, routing, and folder conventions for the Kito Marom registration links system.

---

## 1. System Scope & User Flows

The system is designed for one client only (Kito Marom) to serve parents and allow staff to manage links.

### 1.1 Public Parent-Facing Flow
1. **Landing (`/`)**: 
   - A beautiful, clean, responsive Hebrew RTL landing page.
   - Branded in Kito Marom purple (`#7c3aed` / HSL values for premium UI).
   - Dynamically loads header, titles, hero section, contact numbers, and active registration cards from Supabase.
   - Parents view cards sorted by their designated order.
   - Clicking a card opens the associated registration link in a new tab.

### 1.2 Administrative staff Flow
1. **Login (`/admin/login`)**:
   - Clean login card requiring Email and Password.
2. **Dashboard (`/admin`)**:
   - Navigation Hub: Quick access to "Page Settings", "Registration Cards", and "User Management" (Admin-only).
   - Safe visual status indicator of current public settings.
3. **Manage Page Settings (`/admin/settings`)**:
   - Simple form to edit: Main Title, Subtitle, Intro Text, Logo URL, Contact Phone, Contact Email, and Footer.
4. **Manage Cards (`/admin/cards`)**:
   - Interactive table/list displaying all registration links by area.
   - Actions: Create new area card, edit existing card details, toggle Active/Inactive state, and adjust sort order.
5. **Manage Users (`/admin/users`) - Admin Only**:
   - Displays all registered staff members.
   - Actions: Invite/Create new users, change roles (Admin or Editor), and deactivate/activate users.

---

## 2. Directory Structure

```
kitomaromtree/
├── .agents/
├── docs/
│   ├── 00-access-audit.md
│   ├── 01-architecture-plan.md
│   └── ... (other phases)
├── netlify/
│   └── functions/
│       └── manage-users.js           # Serverless API for Admin-only user management
├── public/
│   └── favicon.ico                   # Standard favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx                # Public branded header
│   │   ├── Footer.jsx                # Public branded footer
│   │   ├── RegistrationCard.jsx      # Clean clickable registration area card
│   │   ├── AdminLayout.jsx           # Shared Admin sidebar and shell
│   │   └── ProtectedRoute.jsx        # Auth & Role guard wrapper
│   ├── pages/
│   │   ├── PublicPage.jsx            # Public parent landing page
│   │   ├── admin/
│   │   │   ├── Login.jsx             # Admin authentication screen
│   │   │   ├── Dashboard.jsx         # Administrative dashboard
│   │   │   ├── Settings.jsx          # Public page settings manager
│   │   │   ├── Cards.jsx             # Area registration links manager
│   │   │   └── Users.jsx             # Admin-only user management dashboard
│   │   └── NotFound.jsx              # Simple custom 404 page
│   ├── supabaseClient.js             # Supabase JS Client initialization
│   ├── index.css                     # Premium Vanilla CSS Design System and RTL styles
│   ├── App.jsx                       # Main App shell & Router
│   └── main.jsx                      # Vite React entrypoint
├── index.html                        # Main HTML containing <div id="root">, RTL configured
├── netlify.toml                      # Netlify configuration file
├── package.json                      # NPM dependencies
└── vite.config.js                    # Vite React bundler configuration
```

---

## 3. Data Model (Supabase Schema)

### 3.1 Table: `profiles`
Holds additional metadata and roles for users authenticated via Supabase Auth.
* `id` uuid PRIMARY KEY REFERENCES `auth.users` ON DELETE CASCADE
* `full_name` text
* `email` text UNIQUE NOT NULL
* `role` text NOT NULL CHECK (`role` IN ('admin', 'editor'))
* `is_active` boolean DEFAULT true
* `created_at` timestamptz DEFAULT now()
* `updated_at` timestamptz DEFAULT now()

### 3.2 Table: `page_settings`
Single row holding the customizable options for the public-facing landing page.
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `page_title` text DEFAULT 'צהרונים וקייטנות קיטו מרום'
* `page_subtitle` text DEFAULT 'בחרו את האיזור המבוקש כדי להירשם'
* `intro_text` text
* `logo_url` text
* `hero_image_url` text
* `contact_phone` text
* `contact_email` text
* `footer_text` text
* `updated_at` timestamptz DEFAULT now()

### 3.3 Table: `registration_cards`
Stores the individual cards representing each camp or program registration link.
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `area_name` text NOT NULL (e.g., 'חריש')
* `display_title` text NOT NULL (e.g., 'צהרוני גני ילדים תשפ"ו')
* `description` text
* `image_url` text
* `target_url` text NOT NULL
* `sort_order` integer DEFAULT 0
* `is_active` boolean DEFAULT true
* `created_at` timestamptz DEFAULT now()
* `updated_at` timestamptz DEFAULT now()

### 3.4 Table: `audit_logs`
Basic read-only logging to track action histories (for auditing changes).
* `id` uuid PRIMARY KEY DEFAULT gen_random_uuid()
* `user_id` uuid REFERENCES `profiles`(`id`)
* `action` text NOT NULL (e.g., 'UPDATE_SETTINGS', 'CREATE_CARD')
* `entity_type` text NOT NULL (e.g., 'registration_cards')
* `entity_id` uuid NOT NULL
* `details` text
* `created_at` timestamptz DEFAULT now()

---

## 4. Security & Role Model

### 4.1 Row-Level Security (RLS) Policies
* **`page_settings`**:
  * Public (anonymous): `SELECT` allowed.
  * Authenticated: `SELECT`, `UPDATE` allowed if user's role is `admin` or `editor` and user profile `is_active` is `true`.
* **`registration_cards`**:
  * Public (anonymous): `SELECT` allowed only where `is_active = true`.
  * Authenticated: `SELECT`, `INSERT`, `UPDATE`, `DELETE` allowed if user's role is `admin` or `editor` and profile `is_active` is `true`.
* **`profiles`**:
  * Public (anonymous): Denied all.
  * Authenticated (Self): `SELECT` and `UPDATE` (limited fields like name) allowed.
  * Authenticated (Admin): `SELECT` and `UPDATE` allowed.
  * Authenticated (Service Role): Full access (bypasses RLS).

### 4.2 Server-Side Secure Operations (Netlify Functions)
Direct access to the Supabase Auth Administration API requires the high-privilege `SUPABASE_SERVICE_ROLE_KEY`. To prevent leaking this key, any management of user creation, role assignment, or deactivation must happen inside **Netlify Functions** (`/netlify/functions/manage-users.js`).
* The function will check the client's JWT token (sent in the Authorization header), verify the requesting user is an active `admin` by checking the database, and only then perform the request.

---

## 5. Required Environment Variables

To be defined locally in `.env` (ignored by Git) and in the Netlify Dashboard settings:
* `PUBLIC_SUPABASE_URL`: Public endpoint of the Supabase project.
* `PUBLIC_SUPABASE_ANON_KEY`: Safe, public anon key.
* `SUPABASE_SERVICE_ROLE_KEY`: **CRITICAL SECRET** - must ONLY be added to the Netlify Dashboard (never referenced in frontend code, used solely inside `/netlify/functions`).
