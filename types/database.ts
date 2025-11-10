export interface Database {
  public: {
    Tables: {
      live_games: {
        Row: {
          id: string
          league: string
          match: string
          network: string
          app: string
          link: string
          start_time: string
          is_live: boolean
        }
        Insert: {
          id?: string
          league: string
          match: string
          network: string
          app: string
          link: string
          start_time?: string
          is_live?: boolean
        }
        Update: {
          id?: string
          league?: string
          match?: string
          network?: string
          app?: string
          link?: string
          start_time?: string
          is_live?: boolean
        }
      }
      user_services: {
        Row: {
          id: string
          user_id: string
          service_name: string
          connected: boolean
        }
        Insert: {
          id?: string
          user_id: string
          service_name: string
          connected?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          service_name?: string
          connected?: boolean
        }
      }
      provider_tokens: {
        Row: {
          id: string
          user_id: string
          provider_name: string
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          provider_user_id: string | null
          provider_email: string | null
          provider_metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider_name: string
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          provider_user_id?: string | null
          provider_email?: string | null
          provider_metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider_name?: string
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          provider_user_id?: string | null
          provider_email?: string | null
          provider_metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      provider_content: {
        Row: {
          id: string
          provider_name: string
          content_id: string
          content_type: string
          title: string
          league: string | null
          teams: any
          start_time: string | null
          end_time: string | null
          deep_link: string | null
          thumbnail_url: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_name: string
          content_id: string
          content_type: string
          title: string
          league?: string | null
          teams?: any
          start_time?: string | null
          end_time?: string | null
          deep_link?: string | null
          thumbnail_url?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_name?: string
          content_id?: string
          content_type?: string
          title?: string
          league?: string | null
          teams?: any
          start_time?: string | null
          end_time?: string | null
          deep_link?: string | null
          thumbnail_url?: string | null
          metadata?: any
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

export type LiveGame = Database['public']['Tables']['live_games']['Row']
export type UserService = Database['public']['Tables']['user_services']['Row']