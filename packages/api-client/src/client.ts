import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

export type TypedSupabaseClient = SupabaseClient<Database>;

// For accepting clients from @supabase/ssr which have a slightly different type signature
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CompatibleSupabaseClient = any;

let supabaseClient: TypedSupabaseClient | null = null;

/**
 * Create or get the Supabase client
 * This should be called once at app initialization
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): TypedSupabaseClient {
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return supabaseClient;
}

/**
 * Get the existing Supabase client
 * Throws if client hasn't been initialized
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not initialized. Call createSupabaseClient first.'
    );
  }
  return supabaseClient;
}

/**
 * Create a Supabase client for server-side use (with service role key)
 * This should only be used in secure server environments
 */
export function createServerSupabaseClient(
  supabaseUrl: string,
  supabaseServiceKey: string
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
