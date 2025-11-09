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