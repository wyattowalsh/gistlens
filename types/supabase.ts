/**
 * Supabase Database Types
 * 
 * Type definitions for GistLens database tables
 * These types ensure type-safety when working with Supabase queries
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          github_username: string
          github_id: number
          avatar_url: string | null
          bio: string | null
          public_gists: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          github_username: string
          github_id: number
          avatar_url?: string | null
          bio?: string | null
          public_gists?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          github_username?: string
          github_id?: number
          avatar_url?: string | null
          bio?: string | null
          public_gists?: number
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
          created_at: string
        }
        Insert: {
          id: string
          session_token: string
          user_id: string
          expires: string
          created_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
        }
      }
      gist_history: {
        Row: {
          id: number
          user_id: string | null
          gist_id: string
          gist_owner: string | null
          gist_description: string | null
          file_count: number | null
          viewed_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          gist_id: string
          gist_owner?: string | null
          gist_description?: string | null
          file_count?: number | null
          viewed_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          gist_id?: string
          gist_owner?: string | null
          gist_description?: string | null
          file_count?: number | null
          viewed_at?: string
        }
      }
      custom_styles: {
        Row: {
          id: number
          user_id: string
          target: string
          css: string | null
          enabled: boolean
          last_modified: string
        }
        Insert: {
          id?: number
          user_id: string
          target: string
          css?: string | null
          enabled?: boolean
          last_modified?: string
        }
        Update: {
          id?: number
          user_id?: string
          target?: string
          css?: string | null
          enabled?: boolean
          last_modified?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          telemetry_enabled: boolean
          telemetry_api_key: string | null
          auto_preview_markdown: boolean
          default_theme: string
          show_line_numbers: boolean
          font_size: string
          enable_syntax_highlighting: boolean
          auto_load_gists: boolean
          history_limit: number
          compact_mode: boolean
          enable_animations: boolean
          wrap_long_lines: boolean
          icon_set: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          telemetry_enabled?: boolean
          telemetry_api_key?: string | null
          auto_preview_markdown?: boolean
          default_theme?: string
          show_line_numbers?: boolean
          font_size?: string
          enable_syntax_highlighting?: boolean
          auto_load_gists?: boolean
          history_limit?: number
          compact_mode?: boolean
          enable_animations?: boolean
          wrap_long_lines?: boolean
          icon_set?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          telemetry_enabled?: boolean
          telemetry_api_key?: string | null
          auto_preview_markdown?: boolean
          default_theme?: string
          show_line_numbers?: boolean
          font_size?: string
          enable_syntax_highlighting?: boolean
          auto_load_gists?: boolean
          history_limit?: number
          compact_mode?: boolean
          enable_animations?: boolean
          wrap_long_lines?: boolean
          icon_set?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['users']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type GistHistory = Database['public']['Tables']['gist_history']['Row']
export type CustomStyle = Database['public']['Tables']['custom_styles']['Row']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type GistHistoryInsert = Database['public']['Tables']['gist_history']['Insert']
export type CustomStyleInsert = Database['public']['Tables']['custom_styles']['Insert']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']
export type GistHistoryUpdate = Database['public']['Tables']['gist_history']['Update']
export type CustomStyleUpdate = Database['public']['Tables']['custom_styles']['Update']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']
