import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PrivacySettings = Database["public"]["Tables"]["privacy_settings"]["Row"];
export type LoanRequest = Database["public"]["Tables"]["loan_requests"]["Row"];
export type LoanOffer = Database["public"]["Tables"]["loan_offers"]["Row"];
export type Loan = Database["public"]["Tables"]["loans"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type RequestDirection = Database["public"]["Enums"]["request_direction"];
export type RequestStatus = Database["public"]["Enums"]["request_status"];
export type OfferStatus = Database["public"]["Enums"]["offer_status"];
export type InterestType = Database["public"]["Enums"]["interest_type"];
export type InterestFrequency = Database["public"]["Enums"]["interest_frequency"];
export type LoanStatus = Database["public"]["Enums"]["loan_status"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];

export interface VisibleProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  phone_number: string | null;
}

export interface LedgerEntry {
  id?: string; // payment ID or undefined if start
  date: string;
  payer_id?: string;
  receiver_id?: string;
  amount: number;
  interest_component: number;
  principal_component: number;
  overpaid_excess: number;
  remaining_outstanding: number;
  remaining_principal: number;
  remaining_interest: number;
  note: string | null;
  type: "start" | "payment" | "accrual";
}

export interface LoanLedger {
  loan_id: string;
  status: LoanStatus;
  principal_amount: number;
  interest_type: InterestType;
  interest_rate: number | null;
  interest_frequency: InterestFrequency | null;
  compounding: InterestFrequency | null;
  start_date: string;
  due_date: string;
  lender_id: string;
  borrower_id: string;
  outstanding: number;
  principal: number;
  unpaid_interest: number;
  payments: Array<{
    id: string;
    payer_id: string;
    receiver_id: string;
    amount: number;
    interest_component: number;
    principal_component: number;
    overpaid_excess: number;
    payment_date: string;
    note: string | null;
    created_at: string;
  }>;
}

export interface DBProfileSummary {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface DBRequestOffer {
  id: string;
  amount: string;
  interest_type: "none" | "simple" | "compound";
  interest_rate: string | null;
  interest_frequency: "daily" | "monthly" | "yearly" | null;
  compounding: "daily" | "monthly" | "yearly" | null;
  deadline: string;
  message: string | null;
  status: "ACTIVE" | "SUPERSEDED" | "ACCEPTED" | "DECLINED";
  created_by: string;
  created_at: string;
}

export interface DBLoanRequest {
  id: string;
  direction: "lend" | "borrow";
  status: "PENDING" | "COUNTERED" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  sender_id: string;
  receiver_id: string;
  sender: DBProfileSummary | null;
  receiver: DBProfileSummary | null;
  loan_offers: DBRequestOffer[];
}

