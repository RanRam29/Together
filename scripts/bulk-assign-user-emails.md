# Bulk assign login emails to all users

Assigns `{phone_digits}@together.test` to every `auth.users` row missing a real email,
and ensures an `email` identity exists so GoTrue email+password login works.

## Pattern

| Phone           | Assigned email                    |
|-----------------|-----------------------------------|
| 972502222222    | 972502222222@together.test        |
| 0502222222      | 050222222222@together.test        |
| (no phone)      | user-{uuid}@together.test         |

Users who already have an email (e.g. `parent.demo@together.test`) are left unchanged;
only missing `email` identities are backfilled.

## Apply

**Local:**
```powershell
cd C:\toghther
npx supabase migration up
```

**Cloud (linked project):**
```powershell
npx supabase db push
```

**Re-run manually (idempotent):**
```sql
SELECT public.backfill_user_emails_from_phone();
```

## After backfill

1. In Staff → Users → user detail, set a password (or use existing seed password).
2. User signs in on the login screen with **Email + password**.

## Tests

```powershell
npx supabase test db supabase/tests/bulk_assign_user_emails_test.sql
```
