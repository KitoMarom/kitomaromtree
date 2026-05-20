# Phase 3: Netlify Functions and Secure Server Operations - Kito Marom

This document specifies the serverless API layer built inside Netlify to perform sensitive actions securely without exposing high-privilege credentials to the frontend.

---

## 1. Security Architecture

The client application accesses Supabase directly for standard operational tasks (fetching settings, editing cards) using the client-side Supabase client. These operations are validated and gated by **Row-Level Security (RLS)** in PostgreSQL.

However, actions related to user administration (inviting new staff members, assigning roles, deactivating profiles) require access to the high-privilege **Supabase GoTrue Admin API**, which uses the `SUPABASE_SERVICE_ROLE_KEY`.

### 1.1 The Rule of Least Privilege
* **No Client Leakage**: The `SUPABASE_SERVICE_ROLE_KEY` is **never** loaded into the browser environment.
* **Serverless Proxies**: Administrative operations are proxied through a secure **Netlify Function** running in a Node.js serverless environment.
* **Double Verification**:
  1. The serverless function parses the request `Authorization` header containing the user's JWT access token.
  2. The function asks Supabase Auth if the token is valid and fetches the user's ID.
  3. The function checks the database `public.profiles` table to verify if the requesting user's role is `'admin'` and their status is `is_active = true`.
  4. If all checks pass, it runs the admin operations using the Service Role client.

---

## 2. Serverless Endpoint Specification

The Unified Endpoint is configured at:
`POST /.netlify/functions/manage-users`

### 2.1 Request Headers
```http
Authorization: Bearer <user_jwt_access_token>
Content-Type: application/json
```

### 2.2 Action: Invite or Create a User (`invite-user`)
Sends an invitation or creates a staff user instantly with a predefined password.

#### Request Body:
```json
{
  "action": "invite-user",
  "email": "editor@kitomarom.co.il",
  "fullName": "שמעון לוי",
  "role": "editor",
  "password": "TemporarySecurePassword123" // Optional: If omitted, triggers standard email invitation flow
}
```

#### Successful Response (`200 OK`):
```json
{
  "message": "User invited successfully",
  "user": {
    "id": "c33190df-a92c-474c-b17a-db8ff2e3a105",
    "email": "editor@kitomarom.co.il",
    "user_metadata": {
      "full_name": "שמעון לוי",
      "role": "editor"
    }
  }
}
```

### 2.3 Action: Update User Role (`update-user-role`)
Upgrades an Editor to Admin or downgrades an Admin to Editor.
* *Note: Admins cannot change their own roles to prevent accidental admin lockout.*

#### Request Body:
```json
{
  "action": "update-user-role",
  "targetUserId": "c33190df-a92c-474c-b17a-db8ff2e3a105",
  "newRole": "admin"
}
```

#### Successful Response (`200 OK`):
```json
{
  "message": "User role updated successfully"
}
```

### 2.4 Action: Deactivate/Activate User (`deactivate-user`)
Blocks/unblocks a user's access to the system.
* *Note: Admins cannot deactivate their own accounts to prevent lockout.*

#### Request Body:
```json
{
  "action": "deactivate-user",
  "targetUserId": "c33190df-a92c-474c-b17a-db8ff2e3a105",
  "isActive": false
}
```

#### Successful Response (`200 OK`):
```json
{
  "message": "User successfully deactivated"
}
```

---

## 3. Deployment Configuration

Environment variables must be entered in the Netlify Dashboard settings under **Site configuration > Environment variables**:

1. `PUBLIC_SUPABASE_URL`: The Supabase project endpoint (e.g. `https://rzpnbfvqqtzskkksnpsu.supabase.co`).
2. `PUBLIC_SUPABASE_ANON_KEY`: The safe public anon key.
3. `SUPABASE_SERVICE_ROLE_KEY`: The private database service role key (Secret).
