# Phase 4: Admin Panel UI Development - Kito Marom

This document specifies the internal Admin Panel built for Kito Marom staff to manage the parent landing page without touching code.

---

## 1. Administrative Security

All administrative screens are loaded under the `/admin` path and secured by three layers of validation:
1. **Client-Side Auth Guard (`ProtectedRoute`)**: Wraps admin component trees. If a user is not authenticated or their profile is marked as inactive, they are redirected to `/admin/login`.
2. **Database Row-Level Security (RLS)**: Gated by PostgreSQL. Even if a user bypasses the UI elements, all database requests will fail unless the authenticated session role has update permissions.
3. **Role-Based Routing (Admin-Only paths)**: Staff designated with the `editor` role can edit landing content and links but cannot see the "Team Settings" sidebar link (`/admin/users`) or access the user management dashboard.

---

## 2. Admin Workspace Flow

The panel is optimized for parent operations in **Hebrew RTL** using a responsive side navigation:

### 2.1 Staff Login (`/admin/login`)
* **Fields**: Email, Password.
* **First-Time Administrator Setup**: In case the system has no registered staff yet, a dedicated sign-up hook is provided. The trigger function in Supabase automatically upgrades the first registered user to `'admin'`, enabling instant bootstrapping.

### 2.2 Dashboard Overview (`/admin`)
* **Live Indicators**: Shows the total number of registration cards, active/inactive cards, and current header settings.
* **Quick Access Navigation**: Cards linking to "Page Settings", "Registration Links", and "Team Settings" (Admins only).

### 2.3 Page Settings Manager (`/admin/settings`)
* Enables custom branding:
  * **Main Title & Subtitle**: Customizable parental headings.
  * **Intro/Faq text**: General informational blocks.
  * **Visual Assets**: Direct text inputs for corporate Logo and Hero background URLs.
  * **Contacts**: Live updates for company phone lines and operational emails.

### 2.4 Registration Links CRUD (`/admin/cards`)
* **Cards Table**: Sortable table listing all current areas, display titles, target links, and statuses.
* **Order Management**: Modifying `sort_order` values dynamically sorts how parent cards arrange themselves.
* **Inline Form**: Toggle between adding a new area and editing existing links seamlessly.
* **Active Status Toggles**: Quickly enable or disable a card to show or hide it from the public page in one click.

### 2.5 Team Management (`/admin/users`) - Admin Only
* Displays profiles table.
* Enables Admin to invite/create editors, change user roles between `admin` and `editor`, or deactivate access instantly using the secure serverless Netlify endpoint.
