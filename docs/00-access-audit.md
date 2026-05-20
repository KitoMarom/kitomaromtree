# Phase 0: Access and Repository Audit - Kito Marom Registration Links

This document details the initial access and repository audit for the Kito Marom registration links system.

## 1. Access Status Summary

### 1.1 GitHub Access
* **Status**: **SUCCESS**
* **Details**: Full read/write access to the remote repository `jobskitomarom/kitomaromtree` is verified.
* **Findings**: The repository has been successfully cloned and initialized locally. It is currently a completely empty repository (contains no files other than the `.agents` folder and `skills-lock.json`).

### 1.2 Supabase Access
* **Status**: **AWAITING USER OAUTH / AUTHENTICATION**
* **Details**: The remote MCP server is configured in `C:\Users\David\.gemini\antigravity\mcp_config.json` with the project reference `rzpnbfvqqtzskkksnpsu`. However, the server is not yet accessible in the active context, meaning the system is waiting for OAuth/Authentication approval.
* **Action Required**: The user needs to verify that the Supabase MCP server is authenticated in Antigravity.

### 1.3 Netlify Readiness
* **Status**: **NOT CONFIGURABLE YET (PENDING APP SETUP)**
* **Details**: The repository is empty, so no `netlify.toml` or serverless functions exist yet. No automated Netlify API integration is present, meaning deployment configuration and environment variables must be managed through the Netlify dashboard or a simple local `netlify.toml`.
* **Action Required**: Once code is written, environment variables (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) must be added manually in the Netlify project settings.

---

## 2. Existing Project Stack & Directory Structure

* **Root Path**: `c:\Users\David\Desktop\ריל מרקטינג\קיטו מרום\kitomaromtree`
* **Current Files**:
  * `.agents/` (Local agents configuration and installed skills)
  * `skills-lock.json` (Skills lock file)
  * `.git/` (Initialized Git repository)
* **Framework**: None yet (empty repository).
* **Package Manager**: None yet.

---

## 3. Required User Actions (Critical)

To enable full integration with your Supabase backend via the Supabase MCP server, please perform the following steps:

1. **Verify MCP Configuration**:
   Ensure `C:\Users\David\.gemini\antigravity\mcp_config.json` contains:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "serverUrl": "https://mcp.supabase.com/mcp?project_ref=rzpnbfvqqtzskkksnpsu"
       }
     }
   }
   ```
   *(We have already written this file for you).*

2. **Authenticate with Supabase**:
   * Open **Agent Settings** in Antigravity with `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac).
   * Navigate to the **Customizations** tab.
   * Locate the **Supabase** MCP server and click the **Authenticate** button to complete the OAuth flow.
   * If already authenticated, try refreshing the server configs by clicking the `···` menu at the top of the Agent pane > **MCP Servers** > **Manage MCP Servers** > **Refresh server configs**.

---

## 4. Proposed Next Steps (Phase 1)

Since the repository is completely empty, we have a clean canvas to build a highly responsive, clean, and modern system.

### Recommended Stack:
* **Frontend Framework**: **React (Vite)**
  * *Why*: Extremely fast, highly reactive, and provides simple client-side routing and state management for the Admin panel's CRUD operations.
* **Styling**: **Vanilla CSS** with a custom-designed modern, purple-accented, clean layout to fully support Hebrew RTL, responsive grids, and premium parental registration cards.
* **Hosting/Serverless**: **Netlify** with a simple `netlify.toml` and Netlify Functions for secure, role-based backend calls.
* **Database**: **Supabase** (Auth, Database, Storage, and Row-Level Security).

---

### Phase 1 Plan Outline:
1. Define the React (Vite) directory structure.
2. Outline specific database tables (`profiles`, `page_settings`, `registration_cards`, `audit_log`) and RLS rules.
3. Design the Hebrew RTL visual layout for Kito Marom parents.
4. Establish the exact API endpoints and role-based guards.
