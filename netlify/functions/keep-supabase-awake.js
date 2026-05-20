function readEnv(name) {
  return globalThis.Netlify?.env?.get(name) || process.env[name] || '';
}

function firstEnvValue(names) {
  return names.map(readEnv).find((value) => value.trim())?.trim() || '';
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export default async function keepSupabaseAwake() {
  const supabaseUrl = firstEnvValue([
    'SUPABASE_URL',
    'PUBLIC_SUPABASE_URL',
    'VITE_PUBLIC_SUPABASE_URL'
  ]).replace(/\/+$/, '');
  const supabaseKey = firstEnvValue([
    'SUPABASE_SERVICE_ROLE_KEY',
    'PUBLIC_SUPABASE_ANON_KEY',
    'VITE_PUBLIC_SUPABASE_ANON_KEY'
  ]);

  const missingVariables = [
    !supabaseUrl ? 'SUPABASE_URL / VITE_PUBLIC_SUPABASE_URL' : null,
    !supabaseKey ? 'SUPABASE_SERVICE_ROLE_KEY / VITE_PUBLIC_SUPABASE_ANON_KEY' : null
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    console.error('Supabase keepalive ping skipped. Missing env:', missingVariables);
    return jsonResponse({ ok: false, missingVariables }, 500);
  }

  const startedAt = new Date().toISOString();
  const response = await fetch(`${supabaseUrl}/rest/v1/page_settings?select=id&limit=1`, {
    method: 'GET',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Supabase keepalive ping failed:', response.status, errorBody);
    return jsonResponse({
      ok: false,
      status: response.status,
      error: errorBody.slice(0, 300),
      startedAt
    }, 500);
  }

  console.log('Supabase keepalive ping succeeded:', startedAt);
  return jsonResponse({ ok: true, startedAt });
}

export const config = {
  schedule: '@daily'
};
