# Together — Mobile App

React Native (Expo SDK 53) client for parents and professionals.

## Stack

- Expo Router (file-based navigation)
- NativeWind 4.1 + Tailwind CSS
- Zustand + TanStack Query
- Supabase JS Client
- i18next (Hebrew + English, RTL)

## Setup

```bash
# From repo root
cp apps/mobile/.env.example apps/mobile/.env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
npm run dev
```

## Route groups

| Group | Role | Screens |
|-------|------|---------|
| `(auth)` | — | login, role-select, onboarding |
| `(parent)` | parent | home, child-profile, requests |
| `(professional)` | professional | home, profile, browse |
| `(active-match)` | both | check-in, daily log (week 5–7) |

## Notes

- Do not edit `supabase/` — owned by Antigravity
- Types will move to `packages/shared/` once `supabase gen types` is wired
