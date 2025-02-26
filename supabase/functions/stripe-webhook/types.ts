
export interface Database {
  public: {
    Tables: {
      quiz_results: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          is_purchased: boolean;
          purchase_status: string | null;
          purchase_date: string | null;
          access_method: string | null;
          guest_email: string | null;
          guest_access_token: string | null;
          guest_access_expires_at: string | null;
          stripe_session_id: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          is_purchased?: boolean;
          purchase_status?: string | null;
          purchase_date?: string | null;
          access_method?: string | null;
          guest_email?: string | null;
          guest_access_token?: string | null;
          guest_access_expires_at?: string | null;
          stripe_session_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          created_at?: string;
          is_purchased?: boolean;
          purchase_status?: string | null;
          purchase_date?: string | null;
          access_method?: string | null;
          guest_email?: string | null;
          guest_access_token?: string | null;
          guest_access_expires_at?: string | null;
          stripe_session_id?: string | null;
        };
      };
      purchase_tracking: {
        Row: {
          id: string;
          quiz_result_id: string;
          guest_email: string | null;
          status: string;
          created_at: string;
          completed_at: string | null;
          stripe_session_id: string | null;
        };
        Insert: {
          id?: string;
          quiz_result_id: string;
          guest_email?: string | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          stripe_session_id?: string | null;
        };
        Update: {
          id?: string;
          quiz_result_id?: string;
          guest_email?: string | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          stripe_session_id?: string | null;
        };
      };
      guest_purchases: {
        Row: {
          id: string;
          result_id: string;
          email: string;
          access_token: string;
          access_expires_at: string;
          status: string;
          stripe_session_id: string;
          purchase_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          result_id: string;
          email: string;
          access_token: string;
          access_expires_at: string;
          status?: string;
          stripe_session_id: string;
          purchase_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          result_id?: string;
          email?: string;
          access_token?: string;
          access_expires_at?: string;
          status?: string;
          stripe_session_id?: string;
          purchase_type?: string;
          created_at?: string;
        };
      };
    };
  };
}
