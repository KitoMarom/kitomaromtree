import { createClient } from '@supabase/supabase-js';

function firstDefined(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function readDefaultKeyFromJson(value) {
  if (!value) return '';

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed?.default === 'string') return parsed.default;
    return firstDefined(...Object.values(parsed || {}));
  } catch {
    return '';
  }
}

export async function handler(event) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const supabaseUrl = firstDefined(
    process.env.SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_URL,
    process.env.VITE_PUBLIC_SUPABASE_URL
  );
  const supabaseServiceKey = firstDefined(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    readDefaultKeyFromJson(process.env.SUPABASE_SECRET_KEYS)
  );
  const missingVariables = [
    !supabaseUrl ? 'SUPABASE_URL / PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_URL' : null,
    !supabaseServiceKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: `חסרה הגדרת Supabase בצד השרת: ${missingVariables.join(', ')}. יצירת משתמשים מחייבת Service Role Key ב-Netlify Functions.`,
        missingVariables
      })
    };
  }

  // Extract auth token
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Missing or invalid Authorization header' })
    };
  }
  const token = authHeader.split(' ')[1];

  // Initialize clients
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  try {
    // 1. Verify User Token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
      };
    }

    // 2. Verify requesting user is an active Admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden: Profile not found' })
      };
    }

    if (!profile.is_active || profile.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden: Admins only' })
      };
    }

    // 3. Parse and route body action
    const body = JSON.parse(event.body || '{}');
    const { action } = body;

    if (!action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing parameter: action' })
      };
    }

    // --- Action: invite-user ---
    if (action === 'invite-user') {
      const { email, fullName, role, password } = body;

      if (!email || !fullName || !role) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing email, fullName or role parameter' })
        };
      }

      if (!['admin', 'editor'].includes(role)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid role parameter' })
        };
      }

      let authResult;
      
      if (password) {
        // Option A: Direct user creation with preset password (no email invite wait)
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role: role }
        });
        if (error) throw error;
        authResult = data.user;
      } else {
        // Option B: Standard Supabase Auth email invite flow
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: fullName, role: role }
        });
        if (error) throw error;
        authResult = data.user;
      }

      // Proactively ensure the user profile is written to the database with the correct metadata
      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authResult.id,
          full_name: fullName,
          email: email,
          role: role,
          is_active: true
        });

      if (dbError) {
        console.error('Database profile insert failed:', dbError);
      }

      // Log action
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'INVITE_USER',
        entity_type: 'profiles',
        entity_id: authResult.id,
        details: `Invited user ${email} as ${role}`
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'User invited successfully', user: authResult })
      };
    }

    // --- Action: update-user-role ---
    if (action === 'update-user-role') {
      const { targetUserId, newRole } = body;

      if (!targetUserId || !newRole) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing targetUserId or newRole parameter' })
        };
      }

      if (!['admin', 'editor'].includes(newRole)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid role parameter' })
        };
      }

      // Prevent admin from changing their own role (avoid lockout)
      if (targetUserId === user.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'You cannot change your own role' })
        };
      }

      // Update database profile
      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId);

      if (dbError) throw dbError;

      // Update Auth Metadata
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        user_metadata: { role: newRole }
      });
      if (authError) console.error('Auth metadata update failed:', authError);

      // Log action
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'UPDATE_USER_ROLE',
        entity_type: 'profiles',
        entity_id: targetUserId,
        details: `Updated user role to ${newRole}`
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'User role updated successfully' })
      };
    }

    // --- Action: deactivate-user ---
    if (action === 'deactivate-user') {
      const { targetUserId, isActive } = body;

      if (targetUserId === undefined || isActive === undefined) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing targetUserId or isActive parameter' })
        };
      }

      // Prevent admin from deactivating themselves
      if (targetUserId === user.id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'You cannot deactivate your own account' })
        };
      }

      // Update profile status
      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', targetUserId);

      if (dbError) throw dbError;

      // Log action
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entity_type: 'profiles',
        entity_id: targetUserId,
        details: `${isActive ? 'Activated' : 'Deactivated'} user account`
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: `User successfully ${isActive ? 'activated' : 'deactivated'}` })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Unknown action: ${action}` })
    };

  } catch (error) {
    console.error('Error handling request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
}
