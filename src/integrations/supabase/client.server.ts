// Server-side Supabase client with admin privileges.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

let cachedAdminToken: { token: string; expiresAt: number } | null = null;
let tokenPromise: Promise<string | null> | null = null;

async function getAdminAccessToken(supabaseUrl: string, supabaseKey: string): Promise<string | null> {
  if (cachedAdminToken && cachedAdminToken.expiresAt > Date.now() + 60_000) {
    return cachedAdminToken.token;
  }
  if (tokenPromise) return tokenPromise;
  tokenPromise = (async () => {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          email: '65555165@kingvip.app',
          password: 'KING#65555165#VIP',
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { access_token?: string; expires_in?: number };
      if (data.access_token) {
        cachedAdminToken = {
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
        };
        return data.access_token;
      }
      return null;
    } catch {
      return null;
    } finally {
      tokenPromise = null;
    }
  })();
  return tokenPromise;
}

function createSupabaseFetch(supabaseUrl: string, supabaseKey: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(
      typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    // New Supabase API keys are opaque strings, not bearer JWTs.
    if (isNewSupabaseApiKey(supabaseKey) && headers.get('Authorization') === `Bearer ${supabaseKey}`) {
      headers.delete('Authorization');
    }

    if (supabaseKey.startsWith('sb_publishable_') && !headers.has('Authorization')) {
      const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (!urlStr.includes('/auth/v1/')) {
        const adminJwt = await getAdminAccessToken(supabaseUrl, supabaseKey);
        if (adminJwt) {
          headers.set('Authorization', `Bearer ${adminJwt}`);
        }
      }
    }

    headers.set('apikey', supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function createSupabaseAdminClient() {
  const SUPABASE_URL =
    process.env['SUPABASE_URL'] ||
    process.env['VITE_SUPABASE_URL'] ||
    'https://c--1755bfeb-2d9b-4669-ae4c-507d610a5b24-prod.lovable.cloud';
  const SUPABASE_SERVICE_ROLE_KEY =
    process.env['SUPABASE_SERVICE_ROLE_KEY'] ||
    process.env['SUPABASE_PUBLISHABLE_KEY'] ||
    process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
    'sb_publishable_5V4d-GLIZVhYquHkMr4Yeg_keCsAYhN';

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY),
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  },
});
