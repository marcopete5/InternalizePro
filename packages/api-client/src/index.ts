// Client
export {
  createSupabaseClient,
  getSupabaseClient,
  createServerSupabaseClient,
  type TypedSupabaseClient,
} from './client';

// Database types
export type {
  Database,
  Tables,
  InsertTables,
  UpdateTables,
} from './types/database';

// Queries
export * from './queries';

// Mutations
export * from './mutations';
