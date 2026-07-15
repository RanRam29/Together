-- Reset the demo unverified professional so they can upload REAL documents.
-- Run once, then log in as pro.unverified@together.test and upload via the app.
--
-- Usage:
--   npx supabase db query --linked --file scripts/reset-demo-professional-docs.sql

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where phone = '972525555555';
  if v_user_id is null then
    raise notice 'User 972525555555 not found — skipping';
    return;
  end if;

  delete from public.document_uploads where owner_id = v_user_id;

  update public.professionals
  set verified = 'pending',
      assigned_supervisor_id = null,
      assigned_at = null,
      updated_at = now()
  where user_id = v_user_id;

  raise notice 'Reset complete for % — upload documents as pro.unverified@together.test', v_user_id;
end $$;
