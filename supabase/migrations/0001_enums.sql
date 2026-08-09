create extension if not exists pgcrypto with schema extensions;

create type public.visibility_level as enum ('everyone', 'participants', 'nobody');
create type public.visibility_level_restricted as enum ('only_me', 'participants');
create type public.request_direction as enum ('lend', 'borrow');
create type public.request_status as enum ('PENDING', 'COUNTERED', 'ACCEPTED', 'DECLINED', 'CANCELLED');
create type public.offer_status as enum ('ACTIVE', 'SUPERSEDED', 'ACCEPTED', 'DECLINED');
create type public.interest_type as enum ('none', 'simple', 'compound');
create type public.interest_frequency as enum ('daily', 'monthly', 'yearly');
create type public.loan_status as enum ('ACTIVE', 'PAID');
create type public.notification_type as enum (
  'new_request',
  'counter_offer',
  'offer_accepted',
  'offer_declined',
  'payment_recorded',
  'deadline_reminder',
  'overdue',
  'fully_paid'
);
