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
      groups: {
        Row: {
          id: string
          code: string
          name: string
          group_target: number | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          group_target?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          group_target?: number | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          daily_target: number
          group_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar_url?: string | null
          daily_target?: number
          group_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          daily_target?: number
          group_id?: string | null
          created_at?: string
        }
      }
      logs: {
        Row: {
          id: string
          user_id: string
          date: string
          count: number
          sets_breakdown: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          count: number
          sets_breakdown?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          count?: number
          sets_breakdown?: Json | null
          created_at?: string
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
