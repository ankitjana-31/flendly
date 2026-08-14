export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          username_normalized: string;
          username_changed_count: number;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          username_changed_count?: number;
          full_name?: string | null;
          email: string;
          avatar_url?: string | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          username_changed_count?: number;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      privacy_settings: {
        Row: {
          user_id: string;
          avatar_visibility: Database["public"]["Enums"]["visibility_level"];
          email_visibility: Database["public"]["Enums"]["visibility_level_restricted"];
          phone_visibility: Database["public"]["Enums"]["visibility_level_restricted"];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          avatar_visibility?: Database["public"]["Enums"]["visibility_level"];
          email_visibility?: Database["public"]["Enums"]["visibility_level_restricted"];
          phone_visibility?: Database["public"]["Enums"]["visibility_level_restricted"];
          updated_at?: string;
        };
        Update: {
          avatar_visibility?: Database["public"]["Enums"]["visibility_level"];
          email_visibility?: Database["public"]["Enums"]["visibility_level_restricted"];
          phone_visibility?: Database["public"]["Enums"]["visibility_level_restricted"];
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          direction: Database["public"]["Enums"]["request_direction"];
          status: Database["public"]["Enums"]["request_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          direction: Database["public"]["Enums"]["request_direction"];
          status?: Database["public"]["Enums"]["request_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: Database["public"]["Enums"]["request_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      loan_offers: {
        Row: {
          id: string;
          request_id: string;
          created_by: string;
          amount: string;
          interest_type: Database["public"]["Enums"]["interest_type"];
          interest_rate: string | null;
          interest_frequency:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          compounding:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          deadline: string;
          message: string | null;
          status: Database["public"]["Enums"]["offer_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          created_by: string;
          amount: string;
          interest_type: Database["public"]["Enums"]["interest_type"];
          interest_rate?: string | null;
          interest_frequency?:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          compounding?:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          deadline: string;
          message?: string | null;
          status?: Database["public"]["Enums"]["offer_status"];
          created_at?: string;
        };
        Update: {
          status?: Database["public"]["Enums"]["offer_status"];
        };
        Relationships: [];
      };
      loans: {
        Row: {
          id: string;
          request_id: string;
          accepted_offer_id: string;
          lender_id: string;
          borrower_id: string;
          principal_amount: string;
          interest_type: Database["public"]["Enums"]["interest_type"];
          interest_rate: string | null;
          interest_frequency:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          compounding:
            | Database["public"]["Enums"]["interest_frequency"]
            | null;
          start_date: string;
          due_date: string;
          status: Database["public"]["Enums"]["loan_status"];
          paid_off_date: string | null;
          reminder_3day_sent_at: string | null;
          reminder_due_sent_at: string | null;
          reminder_overdue_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          loan_id: string;
          payer_id: string;
          receiver_id: string;
          amount: string;
          interest_component: string;
          principal_component: string;
          overpaid_excess: string;
          payment_date: string;
          note: string | null;
          created_at: string;
        };
        Insert: Record<string, never>;
        Update: Record<string, never>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database["public"]["Enums"]["notification_type"];
          payload: Json;
          read_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: {
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      accept_offer: {
        Args: { p_offer_id: string };
        Returns: string;
      };
      decline_request: {
        Args: { p_request_id: string };
        Returns: void;
      };
      cancel_request: {
        Args: { p_request_id: string };
        Returns: void;
      };
      get_loan_ledger: {
        Args: { p_loan_id: string };
        Returns: Json;
      };
      record_payment: {
        Args: {
          p_loan_id: string;
          p_amount: number;
          p_payment_date: string;
          p_note?: string | null;
        };
        Returns: string;
      };
      get_profile_visible: {
        Args: { target_id: string };
        Returns: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string | null;
          phone_number: string | null;
        }[];
      };
      update_username: {
        Args: { p_new_username: string };
        Returns: void;
      };
      search_users: {
        Args: { p_query: string; p_limit?: number };
        Returns: {
          id: string;
          username: string;
          full_name: string | null;
        }[];
      };
    };
    Enums: {
      visibility_level: "everyone" | "participants" | "nobody";
      visibility_level_restricted: "only_me" | "participants";
      request_direction: "lend" | "borrow";
      request_status:
        | "PENDING"
        | "COUNTERED"
        | "ACCEPTED"
        | "DECLINED"
        | "CANCELLED";
      offer_status: "ACTIVE" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
      interest_type: "none" | "simple" | "compound";
      interest_frequency: "daily" | "monthly" | "yearly";
      loan_status: "ACTIVE" | "PAID";
      notification_type:
        | "new_request"
        | "counter_offer"
        | "offer_accepted"
        | "offer_declined"
        | "payment_recorded"
        | "deadline_reminder"
        | "overdue"
        | "fully_paid";
    };
    CompositeTypes: Record<string, never>;
  };
};
