export type SelfTrackType = "lent" | "borrowed";
export type SelfTrackStatus = "active" | "settled";

export type SelfTrackRecord = {
  id: string;
  user_id: string;
  type: SelfTrackType;
  person_name: string;
  amount: string;
  record_date: string;
  note: string | null;
  status: SelfTrackStatus;
  created_at: string;
  updated_at: string;
};

export type SelfTrackPayment = {
  id: string;
  self_track_id: string;
  amount: string;
  payment_date: string;
  note: string | null;
  created_at: string;
};

export type SelfTrackWithPayments = SelfTrackRecord & {
  payments: SelfTrackPayment[];
  remaining: number;
};
