# Together — Mobile Build & Deploy (Internal)

מדריך צעד-אחר-צעד להוצאת build פנימי (APK ל-Android, TestFlight-ready IPA ל-iOS) של אפליקציית Together עם EAS Build.

> ⚠️ הפקודות מיועדות ל-**PowerShell ב-Windows** (המכונה של Cursor). כשמריצים ב-macOS/Linux, אל תשתמשו ב-`;` כמפריד — החליפו ל-`&&`.

---

## תנאים מוקדמים

1. חשבון Expo/EAS (קיים).
2. [Expo CLI](https://docs.expo.dev/more/expo-cli/) ו-[EAS CLI](https://docs.expo.dev/build/setup/) מותקנים:
   ```powershell
   npm install -g eas-cli
   ```
3. פרטי Supabase Cloud של הפרויקט (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) — מ-`supabase status` או מ-Dashboard.
4. (Android APK) — לא נדרשות credentials, EAS יחתום אוטומטית.
5. (iOS Ad-hoc) — נדרש Apple Developer Account + UDIDs של המכשירים לבודקים.

---

## שלב 1 — התחברות ואינות פרויקט

```powershell
cd C:\toghther\apps\mobile
eas login
```

הזן שם משתמש/סיסמה של Expo. אחרי הצלחה — הרץ:

```powershell
eas init --id
```

הפקודה תיצור פרויקט חדש ב-EAS ותכתוב את `projectId` ל-`app.json`. אם יש כבר פרויקט קיים, בחר בו.

**לאחר הרצה**, ודא ש-`app.json` שלך מכיל:
```json
"extra": { "eas": { "projectId": "abcd1234-..." } },
"owner": "your-expo-username"
```

## שלב 2 — הגדרת EAS Secrets ל-Supabase

`EXPO_PUBLIC_*` משתני סביבה חייבים להיות זמינים בזמן ה-build כי הם מסולעים לתוך ה-bundle של האפליקציה. הדרך המומלצת: **EAS Secrets** (מוצפנים בענן, לא נכנסים ל-git).

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://flrflktlltmqbiamljlm.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<PASTE_YOUR_ANON_KEY_HERE>"
```

לבדיקה:
```powershell
eas secret:list
```

> ⚠️ ה-`anon` key הוא public-safe (RLS מגן עליו). לעולם **לא** להכניס `service_role` key לאפליקציה.

## שלב 3 — ודא שכל ה-migrations פרוסים ל-Supabase Cloud

לפני build, ודא שהמיגרציות האחרונות (`20260707111544_security_overhaul.sql` וכו') דחוקות לענן:

```powershell
cd C:\toghther
npx supabase db push
```

בדוק שהטבלאות והפונקציות קיימות:
- `matches`, `checkins`, `daily_logs`, `document_uploads`, `reviews`
- RPCs: `approve_request`, `respond_to_request`, `get_matches_for_child`, `verify_checkin`, `get_child_details`
- View: `children_tier0`
- Storage bucket: `documents`

## שלב 4 — Preview Build (APK ל-Android)

Preview הוא Build פנימי חתום — אפשר להעלות ישירות למכשירי בודקים.

```powershell
cd C:\toghther\apps\mobile
eas build --profile preview --platform android
```

- ~10–15 דקות בענן
- בסוף תקבל URL ל-APK — הורדה ישירה, שליחה בוואטסאפ / התקנה ידנית

## שלב 5 — Preview Build ל-iOS (Ad-hoc)

לצורך התקנה על iPhones של בודקים ישירות (בלי TestFlight):

```powershell
eas device:create   # פותח קישור לרישום UDID של כל בודק
eas build --profile preview --platform ios
```

- EAS יבקש Apple ID והרשאות
- לאחר יצירת ה-IPA, שלח את קישור ההתקנה לבודקים
- לחלופין, `eas build --profile preview-simulator --platform ios` ליצירת simulator build ללא credentials

## שלב 6 — TestFlight (iOS, אופציונלי — הפצה רחבה יותר)

```powershell
eas build --profile production --platform ios
eas submit --profile production --platform ios --latest
```

## שלב 7 — Google Play Internal Testing (Android, אופציונלי)

```powershell
eas build --profile production --platform android
eas submit --profile production --platform android --latest
```

---

## פקודות שימושיות

```powershell
eas build:list                      # רשימת builds
eas build:view <build-id>           # פרטי build ספציפי
eas build:cancel                    # ביטול build פעיל
eas channel:list                    # ניהול channels ל-OTA updates
eas update --branch preview         # Over-The-Air update (בלי rebuild)
```

## Runtime Preview ב-Cursor

לבדיקה מהירה ללא build פורמלי:
```powershell
cd C:\toghther\apps\mobile
$env:EXPO_PUBLIC_SUPABASE_URL="https://flrflktlltmqbiamljlm.supabase.co"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
npx expo start --tunnel
```

לאחר מכן, פתח את **Expo Go** במכשיר וסרוק את ה-QR.

## הערות סופיות

- **Version bumping**: `production` profile ב-`eas.json` מוגדר עם `autoIncrement: true` — EAS יעלה אוטומטית את `versionCode` (Android) ו-`buildNumber` (iOS) בין builds.
- **OTA updates**: אחרי release ראשון, שינויי JS-only (בלי חבילות native חדשות) אפשר לדחוף כ-OTA עם `eas update` בלי לחכות לחנויות.
- **מעקב אחרי crashes**: הוסף Sentry או Bugsnag בגרסה הבאה (`expo install sentry-expo`).
- **DB Types blocker**: `supabase gen types typescript --linked` דורש רשת יציבה ל-Supabase Cloud. אם עלית מ-Windows/פרוקסי — הרץ מ-Cloud Shell של Supabase או Codespace.
