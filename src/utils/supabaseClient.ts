import { createClient, SupabaseClient } from '@supabase/supabase-js';

// @ts-ignore
const rawEnvUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://hzfuhtiyjrsfzisaoimw.supabase.co').trim();
// @ts-ignore
const rawEnvKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let rawUrl = rawEnvUrl;
let rawKey = rawEnvKey;

// Strip quotes if they were included literally
if (rawUrl.startsWith('"') && rawUrl.endsWith('"')) rawUrl = rawUrl.slice(1, -1).trim();
if (rawUrl.startsWith("'") && rawUrl.endsWith("'")) rawUrl = rawUrl.slice(1, -1).trim();
if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.slice(1, -1).trim();
if (rawKey.startsWith("'") && rawKey.endsWith("'")) rawKey = rawKey.slice(1, -1).trim();

// Auto-normalize if it's just a raw Supabase reference ID (e.g. "hzfuhtiyjrsfzisaoimw")
if (rawUrl && !rawUrl.includes('.') && !rawUrl.includes('/')) {
  console.log(`VITE_SUPABASE_URL appears to be a raw reference ID: "${rawUrl}". Resolving to: "https://${rawUrl}.supabase.co"`);
  rawUrl = `https://${rawUrl}.supabase.co`;
}

// Auto-prefix protocol if missing (e.g. "hzfuhtiyjrsfzisaoimw.supabase.co")
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
  console.log(`VITE_SUPABASE_URL "${rawUrl}" lacks active protocol. Resolving to: "https://${rawUrl}"`);
  rawUrl = `https://${rawUrl}`;
}

// Clean trailing slashes and /rest/v1/ path extensions
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();
rawUrl = rawUrl.replace(/\/+$/, '').trim();

// Log a proactive warning if the normalized URL suggests setup issues
if (!rawUrl) {
  console.warn('VITE_SUPABASE_URL is currently empty, undefined, or missing in development variables.');
} else if (!rawUrl.startsWith('https://') && !rawUrl.startsWith('http://')) {
  console.warn(`VITE_SUPABASE_URL "${rawUrl}" lacks a valid URL protocol prefix. Supabase client setup requires "https://" or "http://".`);
}

// Check if valid URL
const isValidSupaUrl = (url: string) => {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = 
  isValidSupaUrl(rawUrl) && 
  rawUrl !== 'https://placeholder-url.supabase.co' &&
  !!rawKey && 
  rawKey !== 'placeholder-key';

function createDummyClient(): any {
  const queryMethods: any = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    from: () => queryMethods,
  };

  const dummyHandler = {
    get: (target: any, prop: string | symbol): any => {
      // If we attempt to retrieve any functional block, return fluent offline fallback behaviors
      return (...args: any[]) => {
        console.warn(`Supabase offline fallback proxy executed for method: .${String(prop)}()`);
        return queryMethods;
      };
    }
  };
  return new Proxy({}, dummyHandler);
}

export let supabase: SupabaseClient;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(rawUrl, rawKey);
  } catch (err) {
    console.error('Failed to parse or configure Supabase client with variables safely:', err);
    supabase = createDummyClient() as unknown as SupabaseClient;
  }
} else {
  console.warn('Real Supabase credentials not found or invalid. App operating safely in offline-first/localStorage context.');
  supabase = createDummyClient() as unknown as SupabaseClient;
}
