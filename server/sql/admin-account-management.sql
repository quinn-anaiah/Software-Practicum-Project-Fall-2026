-- Run once in the Supabase SQL Editor before using Admin account management.
-- This table records privileged account-management actions. It is intentionally
-- accessible only through the server's service-role client.

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_target_user_id_idx
  on public.admin_audit_log (target_user_id);

alter table public.admin_audit_log enable row level security;

revoke all on table public.admin_audit_log from anon, authenticated;
grant select, insert on table public.admin_audit_log to service_role;
