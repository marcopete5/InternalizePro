/**
 * Database types for Supabase
 *
 * These types should be generated from Supabase using:
 * pnpm db:types
 *
 * For now, we define them manually to match our schema.
 * Once Supabase is set up, regenerate these types.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          daily_review_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          daily_review_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          daily_review_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          is_archived: boolean;
          card_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          card_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string;
          is_archived?: boolean;
          card_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          user_id: string;
          card_type: string;
          front: string;
          back: string;
          notes: string | null;
          front_image_url: string | null;
          back_image_url: string | null;
          stability: number;
          difficulty: number;
          elapsed_days: number;
          scheduled_days: number;
          reps: number;
          lapses: number;
          state: string;
          last_review: string | null;
          due: string;
          quality_score: number | null;
          quality_feedback: string | null;
          is_suspended: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          user_id: string;
          card_type?: string;
          front: string;
          back: string;
          notes?: string | null;
          front_image_url?: string | null;
          back_image_url?: string | null;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          reps?: number;
          lapses?: number;
          state?: string;
          last_review?: string | null;
          due?: string;
          quality_score?: number | null;
          quality_feedback?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          user_id?: string;
          card_type?: string;
          front?: string;
          back?: string;
          notes?: string | null;
          front_image_url?: string | null;
          back_image_url?: string | null;
          stability?: number;
          difficulty?: number;
          elapsed_days?: number;
          scheduled_days?: number;
          reps?: number;
          lapses?: number;
          state?: string;
          last_review?: string | null;
          due?: string;
          quality_score?: number | null;
          quality_feedback?: string | null;
          is_suspended?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cards_deck_id_fkey";
            columns: ["deck_id"];
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cards_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      review_logs: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          rating: number;
          confidence: number | null;
          response_time_ms: number | null;
          stability_before: number | null;
          difficulty_before: number | null;
          state_before: string | null;
          scheduled_days: number;
          elapsed_days: number;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          rating: number;
          confidence?: number | null;
          response_time_ms?: number | null;
          stability_before?: number | null;
          difficulty_before?: number | null;
          state_before?: string | null;
          scheduled_days: number;
          elapsed_days: number;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          rating?: number;
          confidence?: number | null;
          response_time_ms?: number | null;
          stability_before?: number | null;
          difficulty_before?: number | null;
          state_before?: string | null;
          scheduled_days?: number;
          elapsed_days?: number;
          reviewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_logs_card_id_fkey";
            columns: ["card_id"];
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "review_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      connections: {
        Row: {
          id: string;
          user_id: string;
          source_card_id: string;
          target_card_id: string;
          connection_type: string;
          description: string | null;
          strength: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_card_id: string;
          target_card_id: string;
          connection_type?: string;
          description?: string | null;
          strength?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_card_id?: string;
          target_card_id?: string;
          connection_type?: string;
          description?: string | null;
          strength?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_source_card_id_fkey";
            columns: ["source_card_id"];
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_target_card_id_fkey";
            columns: ["target_card_id"];
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      elaborations: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          prompt: string;
          response: string;
          ai_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          prompt: string;
          response: string;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          prompt?: string;
          response?: string;
          ai_feedback?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "elaborations_card_id_fkey";
            columns: ["card_id"];
            referencedRelation: "cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "elaborations_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string | null;
          cards_reviewed: number;
          cards_new: number;
          cards_relearning: number;
          duration_seconds: number | null;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id?: string | null;
          cards_reviewed?: number;
          cards_new?: number;
          cards_relearning?: number;
          duration_seconds?: number | null;
          started_at?: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string | null;
          cards_reviewed?: number;
          cards_new?: number;
          cards_relearning?: number;
          duration_seconds?: number | null;
          started_at?: string;
          ended_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "study_sessions_deck_id_fkey";
            columns: ["deck_id"];
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_deck_card_count: {
        Args: { deck_id: string };
        Returns: undefined;
      };
      decrement_deck_card_count: {
        Args: { deck_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
