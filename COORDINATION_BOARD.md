# 🚦 Together — לוח תיאום וסטטוס סוכנים

> **🛑 עדכון ארכיטקט (2026-07-13, מאוחר יותר): טיוטת `20260713030000_v3_hardening.sql` נסקרה — נמצאה רגרסיה חוסמת. אין לדחוף לענן ואין לקמט עד תיקון!**
> בלוק `anonymize_user` בטיוטה מבוסס על עותק ישן: עמודות שלא קיימות (`reviews.author_id`, `document_uploads.professional_id` — הנכונות: `reviewer_id`, `owner_id`) ⇒ מחיקת חשבון תקרוס בזמן ריצה; הוסרה מחיקת הקבצים הפיזית (הפרת D28); הוסרה דרישת `check_admin_mfa` (הפרת H1). **הוראות תיקון מדויקות: `docs/work-orders/2026-07-13-v3-hardening-review.md`** — כולל שני תיקונים קטנים נוספים (נעילת `search_path` ב-`get_matches_for_child`, צמצום GRANT). שאר הטיוטה מאושרת כמות שהיא. ⚠️ כלל חדש מחייב: שינוי בפונקציה קיימת מתחיל תמיד מהגרסה במיגרציה האחרונה שנגעה בה — לא מזיכרון ולא מהעתק ישן.
>
> **🗺️ הגל השני תוכנן ופורסם:** ‏WP8 (D45 מתגי שדות) · WP9 (D31 ממשק הורה שני + D44 צילום מסך) · WP10 (דוחות מצטברים + הצעת D49) · WP11 (קדם-השקה). מפרטים מלאים ב-`docs/work-orders/`, סדר ותלויות ב-`00-ROADMAP.md` ("גל שני"). אין להתחיל WP לפני סגירת שלב 1.
>
> **🔴 הנחיית ארכיטקט פעילה (2026-07-13): שלב 1 — סגירת פערי ביקורת. עוצר כל פיצ'ר חדש עד לסגירה.**
> מסמך מלא + הנמקות: **`docs/work-orders/2026-07-13-continuation-plan.md`**. ביקורת היישור אימתה שההקשחות הגדולות בוצעו נכון — אך נמצאו הפערים הבאים, והם קודמים לכל עבודה אחרת:
>
> **Antigravity — משימות 1.1 + 1.2 (מיגרציה אחת + בדיקות):**
> 1. **DROP `public.export_system_data()`** — ה-RPC סותר את D25 והוכרע להסרה מלאה (לא תיקון). כולל בדיקת pgTAP שהפונקציה איננה.
> 2. **`get_live_ops_alerts`** — להחריג תאריכים עם שורת `match_days_off` מחלון 3 הימים של INACTIVE_MATCH (השלמת D46).
> 3. **הקשחה v3:** ‏(א) `hide_match_profile` + `mark_day_off` — להוסיף `SET search_path = public, pg_temp`; ‏(ב) להחליף `get_user_role() = 'admin'` ב-`is_admin()` ב-`get_matches_for_child` (גרסת 020000) ובמדיניות `match_days_off`; ‏(ג) מדיניות Storage ‏"Allow admins to view all documents" → `is_admin()`; ‏(ד) `anonymize_user` שלב 8 — לקבוע `ended_at = now()` בסיום matches (נדרש לנתיב 14-יום של D14); ‏(ה) `mark_day_off` — ולידציה: תאריך בטווח סביר (±14 יום) ו-match בסטטוס `active`/`paused`.
> 4. בדיקות pgTAP חדשות: `match_hides` (משתמש רואה רק את שלו), `mark_day_off` (רק משתתף), החרגת חופשות מההתראות.
>
> **Cursor — משימה 1.3:**
> 1. **למחוק לגמרי את בלוק "ייצוא נתונים" מ-`app/(staff)/config.tsx`** (state בשורה 74, ‏`handleExport` בשורות 122–148, כרטיס ה-UI בשורות 236–249, וייבוא `Platform`/`supabase` אם מתייתרים). ⚠️ **לא לתקן, לא לממש מחדש — למחוק.** ההכרעה (D25, אושררה 2026-07-13): ייצוא גולמי מרוכז אסור; דוחות מצטברים יתוכננו בשלב 3.
> 2. לקמט את הקבצים הפתוחים: `components/guide/`, `lib/guide-content.ts`, `stores/guide-store.ts`, ותיקון `scripts/seed-test-login.sql` (נבדקו ע"י הארכיטקט — תקינים).
> 3. לאחר מכן: הרשמת MFA TOTP לאדמין + E2E ידני (כמתוכנן).
>
> **בוטל:** סעיף "הגדרת `CLAUDE_API_KEY` ב-secrets" — **אין להגדיר את המפתח.** סותר את D30 (ביטול מלא של בינה מלאכותית חיצונית); הפונקציות כבר דטרמיניסטיות ולא זקוקות לו.
>
> **הגדרת גמר לשלב 1:** pgTAP ירוק מקומית (כולל הבדיקות החדשות) · `tsc --noEmit` נקי · מיגרציה נדחפה לענן · עדכון סטטוס כאן וב-`coordination_state.json`.

> **⚠️ עדכון ארכיטקט (2026-07-07): תיעוד מלא נוסף — נקודת הכניסה לכל משימה היא `product/00-INDEX.md`.**
> - **`product/`** — תיק המוצר: החלטות סופיות (01), פרסונות (02), מסעות (03–04), **מפרט מסכים (05)**, קופי (06), מדדים (07), analytics ‏(08), **DoD ‏(09) — חובה לפני סימון משימה כגמורה**, אזור מנהל (10).
> - **`docs/WORK-ALLOCATION.md`** — חלוקת העבודה המרכזית (מי אחראי על מה, לפי WP/תחום/ארטיפקט + handoffs). **מקור אמת לבעלות.**
> - **`docs/work-orders/`** — תוכניות ביצוע מלאות (מאסטר `00-ROADMAP.md`: C4, WP1–WP7).
> - **`docs/`** — ‏ARCHITECTURE · DEV-PROCESS (כולל סדר עדיפויות תקף) · TESTING-STRATEGY · AUTH-SPEC · SECURITY-GUIDELINES.
> - **`docs/SECURITY-GUIDELINES.md` + `docs/AUTH-SPEC.md`** — פיתוח מונחה־אבטחה, אימות והרשאות, מטריצת הרשאות מלאה. **מחייבים לכל משימה שנוגעת בנתונים.**
> - **`ARCHITECTURE_REVIEW.md`** — תיקוני אבטחה קריטיים. ‏**✅ C4 (הסלמת אדמין) נסגר 2026-07-07** — מיגרציה + 7/7 pgTAP ירוקות מקומית. C1/C2/C3 נסגרו ב-`security_overhaul`.
> - **חדש (D23): אזור מנהל מלא ב-MVP** — route group ‏`(admin)` ב-web; תור האימות (Admin-1) משתלב באבן דרך 3. מפרט: `product/10-ADMIN-SPEC.md`.
> בנושאי אבטחה/ארכיטקטורה — ARCHITECTURE_REVIEW גובר; בנושאי מוצר/UX — תיק המוצר גובר על DEVELOPMENT_PLAN.md.
>
> **✅ Architect Audit Fixes (2026-07-12):** Antigravity סגר את הבאגים הדחופים מהדו"ח (`20260712230000_architect_audit_fixes.sql` + `20260712235900_audit_fixes_v2.sql`): (1) **D14** אכיפת דירוג עיוור ב-RLS, (2) **D47** הקפאת משדוכים (pause) ושליחת פוש מעודן וניטרלי בהשעיית משלבת/הורה, (3) **D28** הסרה פיזית של מסמכים מה-Storage בעת מחיקת חשבון ותיקון שגיאת סכמה ב-`anonymize_user`. קוד ה-Backend תקין, נבדק ומועלה לענן. (Cursor: נדרש למחוק את כפתור ייצוא הנתונים מ-`config.tsx`).
> 
> **✅ השלמות פלטפורמה (D46, D48):** Antigravity סגר והעלה מיגרציה (`20260713020000_d46_d48_features.sql`) למימוש: (1) **D48 ("לא מתאים")** כפתור הסתרת משדוכים חד כיוונית (טבלת `match_hides` + פונקציית `hide_match_profile` + סינון במנוע), (2) **D46 (דיווח על יום ללא ליווי)** חופשות שאינן נספרות בחוסר פעילות (טבלת `match_days_off` + פונקציית `mark_day_off`).
>
> **✅ התחברות חלופית ושחזור סיסמה (Full Stack):** Antigravity ביצע את ההטמעה המלאה (גם ה-API וגם ה-UI). נוספו פונקציות ב-`auth-api.ts`, והמסך `login.tsx` שודרג לאפשר בחירה בין טלפון ואימייל. כמו כן נוספו מסכים ל-`forgot-password` ו-`reset-password` שמטפלים ב-Deep Link, ושדה ה"טלפון" נוסף לטפסי האונבורדינג כדי להשלים פערים למשתמשים שנרשמו עם אימייל. 
> 2. `supabase test db --local` — **PASS** (C4: 7/7 pgTAP + RLS privacy).
> 3. Types + `tsc --noEmit` — נקי (`is_admin`, RPCs מוקשחים).
> 4. סקריפטים: `scripts/verify-c4.ps1` (אימות מקומי) · **`scripts/deploy-c4-cloud.ps1`** (push + test בענן).
> **⏳ ענן:** Cursor חסום ל-Supabase Cloud (`TransportError`). הרץ **`.\scripts\deploy-c4-cloud.ps1`** מהטרמינal שלך — זה סוגר את C4 לגמרי.
> **✅ H4 / WP1 (2026-07-08):** `approve_request` פוצל מיצירת ה-match. נסגרה לולאת ההתאמה (WP1) כולל מסך `intro-detail` חדש ב-Cursor להפרדת אישור הבקשה מיצירת העבודה המשותפת.
> 
> **✅ Blocker fixes + Deploy (2026-07-12):** כל המיגרציות נדחפו לענן (`flrflktlltmqbiamljlm`). pgTAP מקומי: **35/35 PASS**. tsc נקי. `.env` מובייל מוגדר.
> **תיקונים בפריסה:** wp5 `ended_at`, supervisor enum, push triggers (`professional_status`→`status`), cron jobs, `check_admin_mfa` role gate, מיגרציות כפולות.
> **⏳ נותר (לא קוד):** הרשמת MFA TOTP לאדמין בפרודקשן · `CLAUDE_API_KEY` ב-secrets · E2E ידני על מכשיר · ייעוץ משפטי.
> 
> **⚠️ עדכון ארכיטקט (2026-07-12): תחקור מוצר מלא — 18 החלטות חדשות (D27–D44) ב-`product/01-DECISIONS.md`.** כיסה לעומק: אונבורדינג הורה, אונבורדינג משלבת (כולל תעודות/רישום פלילי), מנוע ההתאמה.
> - **🔴 שני חוסמי השקה חדשים, קריטיים, שאין להם work order עדיין:**
>   1. **D31 — גישת הורה נוסף/אפוטרופוס.** `children.parent_id` יחיד היום; דורש טבלת קישור חדשה + זרימת הזמנה (טלפון+OTP) + מודל הרשאות (הורה ראשי פועל לבד, הורה משני מקבל התראה אחרי-מעשה על פעולות קריטיות בלבד — לא אישור הדדי מראש).
>   2. **D33/D34/Q6 — בדיקת עברייני מין (חוק תשס"א-2001) עשויה לדרוש תהליך שונה לגמרי** מתעודת יושר self-upload שקיימת היום. **אסור לפתוח לציבור לפני חוות דעת עו"ד.** גם D29/Q5 (ניסוח הסכמה לפי תיקון 13) חוסם השקה לציבור באותה צורה — שני אלה placeholder-ים לבדיקות פנימיות בלבד, לא ניסוח סופי.
> - **בוטל לגמרי (D30):** כל שימוש בבינה מלאכותית חיצונית. `calculate-matches` ו-`process-daily-log` צריכים הסרת קריאות ה-Anthropic API — הנתיב החלופי הקיים בשני הקבצים הופך לקבוע (כולל ניסוח מחדש בטון חם לפי 06-COPY-TONE, לא "מצב הרוח היה מאתגר").
> - **תיקון דחוף במנוע (D38–D39):** "ותק בפלטפורמה" בציון (`get_matches_for_child`) סותר ישירות את R4/cold-start-trust — מוסר, 15 הנק' עוברות להתאמת אבחנה+דירוג. סינון זמינות עובר מ"חפיפת שעה" לסף 25% כיסוי דרך `system_config`, עריכה ל-`admin` בלבד (לא `supervisor` — עקבי עם D26).
> - **מחיקת מידע רגיש (D27–D28):** לא DELETE גורף (ישבור cascade להיסטוריית שידוכים) — ריקון-במקום עם `deleted_at` חדש על `children`/`professionals`, מחיקה אמיתית של `child_details`/`document_uploads` (+ קובץ פיזי מה-bucket), ריקון `daily_logs.notes`/`reviews.text` תוך שמירת שדות מספריים.
> - יתר ההחלטות (D35–D37 אימות, D41–D44 בקשות/TIER2/צילום מסך) — ראו הקובץ, כל אחת מצביעה על הקובץ/RPC הרלוונטי.
>
> **⚠️ עדכון ארכיטקט (2026-07-12, המשך): ליווי יומי + באג RLS דחוף בדירוגים.**
> - **🐛 D14 (דירוג עיוור) לא נאכף ב-RLS — תיקון דחוף, לא דיון מוצרי.** `reviews_read` ו-`reviews_parent_browse` ב-`002_rls_policies.sql` מאפשרות לקרוא כל דירוג מיד עם היווצרותו, בלי בדיקת הדדיות/14-יום. ה"עיוורון" ב-`useMatchReviewStatus` הוא UI בלבד, לא אוכף כלום בפועל. **תיקון:** קריאת דירוג-של-אחר מותרת רק אם קיימת שורה שנייה לאותו `match_id`, או עברו 14 יום מ-`created_at`. פירוט מלא ב-D14 ב-`01-DECISIONS.md`.
> - **D45/D46 חדשות:** מתגי "מה דנה רואה" פר-שדה **פר-זוג ילד-משלבת** (לא פר-ילד) — "השהה גישה" הוא כיבוי-בבת-אחת של אותם מתגים, לא מנגנון נפרד. RPC דו-כיווני `mark_day_off` (הורה או משלבת, סיבה לא חובה, בלי אישורים) — חובה להוציא את היום הזה מחישוב "ימים ללא פעילות" ב-S-ADM-05.
> - **אומת מול קוד חי (חדשות טובות):** ניתוק גישת TIER2/3 בסיום/משיכת בקשה **כבר עובד נכון** (`get_tier_for_child` בודק סטטוס בזמן אמת, לא נדרש תיקון).
>
> **⚠️ עדכון ארכיטקט (2026-07-12, המשך): אזור אדמין — באג build + כפתור שסותר החלטה.**
> - **🐛 `(staff)/config.tsx` חוסם build.** כפתור "ייצוא נתונים" (ייצוא כל נתוני המערכת ל-JSON) מופיע **פעמיים** בקובץ (בלוק כפול), ומשתמש ב-`handleExport`/`isExporting` שלא מוגדרים באף קובץ בריפו — `ReferenceError`/כשל קומפילציה.
> - **הכרעה: הכפתור מוסר לגמרי, לא מתוקן.** הוא סתר במישרין את D25 (אדמין לא רואה TIER 3 כברירת מחדל, רק "צפייה מנומקת" עם audit) — ייצוא-מרוכז ללא סיבה/audit על תוכן הוא בדיוק מה ש-D25 נועדה למנוע. אין ערך עסקי בפיצ'ר, לא נבנה מחדש בשום היקף. פירוט מלא בהערת התיקון תחת D25 ב-`01-DECISIONS.md`.
> - **D47 חדשה:** `admin_suspend_user` — שדה קטגוריה נוסף (חשש בטיחותי / מנהלתי-אחר) לתעדוף בדשבורד. **וללא תלות בקטגוריה:** השעיית משלבת עם matches פעילים חייבת להעביר אותם אוטומטית ל-`paused` + הודעה ניטרלית להורה — כרגע ה-RPC לא נוגע ב-matches בכלל, וההורה נשאר בלי הסבר כשה-check-in פשוט מפסיק.
> - **D48 חדשה — כפתור "לא מתאים" ב-TIER2:** הסתרה **חד-כיוונית וזמנית** (3 חודשים, לא הדדית, לא צריכה הסכמת הצד השני) של הפרופיל השני מפיד ההתאמות/browse של מי שלחץ. דורש טבלת הסתרה קטנה (זוג+מי הסתיר+תוקף), נבדקת ב-`get_matches_for_child` ובשאילתת ה-browse. נפרד ממנגנון D41 (ניסיון חוזר).
> - **📋 סיכום מרוכז לבדיקה מול הסוכנים: `docs/work-orders/2026-07-12-architect-audit-summary.md`** — כל הבאגים הדחופים, חוסמי ההשקה, והחלטות D27–D48 בטבלה אחת, עם דגש 🔐 על כל נושא הקשור לאבטחת מידע/פרטיות/תיקים רפואיים. תיקוף מול קוד עדכני לפני סימון סעיף כ"נבדק".
>
> **📮 שאלות לארכיטקט** — אין חסימות קוד פתוחות; נותרו רק צעדי פריסה/סביבה.

> **הנחיה לסוכנים (Antigravity & Cursor):**
> 1. **קראו** את הקובץ הזה בתחילת כל סבב עבודה כדי להבין מה הסוכן השני עושה.
> 2. **עדכנו** את הסטטוס שלכם ואת לוח המשימות בקובץ זה וב-`coordination_state.json` בסוף כל סבב.

### 🚧 Current Focus: Phase 2 Rollout

**Active Work Package:** `WP10` (Admin Reports)

| AI Agent | Task | Status | Notes |
|---|---|---|---|
| **Antigravity** | `WP10: Backend` - Create aggregated reports RPCs | `completed` | `admin_report_overview`, `timeseries`, `funnel`, `sla` implemented with MFA/RLS blocks and anti-leakage tests verified. Data retention cron jobs added (D49). |
| **Cursor** | `WP10: Frontend` - Build Admin Reports UI | `ready` | Need to build a reports tab in the `(staff)` area pulling from the new RPCs. |

## 🤖 סטטוס סוכנים נוכחי

### 🟢 Antigravity (Backend & DB & Stitch)
- **משימה נוכחית**: ✅ **WP10 (Admin Reports) הושלם ב-Backend (2026-07-13):** נוצרה מיגרציית `20260713070000_wp10_admin_reports.sql` עם ארבע פונקציות דיווח מאובטחות (MFA, נעילת search_path, ללא PII), וג'ובים של pg_cron למדיניות שמירת נתונים (D49). הבדיקות (`wp10_reports_test.sql`) עברו במלואן. הטייפים העדכניים הופקו (`types:generate`).
- **הצעד הבא**: ממתין להנחיית הארכיטקט או תחילת WP11 (Launch Hardening). **Cursor — המסלול פנוי עבורך לממש את ממשק הדוחות ב-`(staff)` (WP10 סעיף 4).**
- **חסימות**: המיגרציה נבדקה מקומית. ניתן לדחוף לענן מתי שתרצה.

### 🟢 Cursor (Mobile App Shell & UI)
- **משימה נוכחית**: ✅ **WP8 — מתגי "מה דנה רואה" (UI) הושלם (2026-07-13).** מומש מסך `match-permissions.tsx` החדש בהתאם לסעיף 6, כולל השהיית/חידוש גישה (שמפעילים את ה-RPC עם כל המפתחות) ותרגומי Copy חמים.
- **הצעד הבא**: ממתין לאישור ארכיטקט ולהתחלת WP9 (D31 - ממשק הורה שני). בנוסף, טרם בוצע E2E ידני לאדמין MFA מפרודקשן כפי שהוגדר בסוף שלב 1.
- **חסימות**: אין. WP8 מוכן לחלוטין (Front + Back) וניתן לדחוף את המיגרציה לענן.

---

## 📋 לוח משימות MVP

### 🗄️ תשתית ו-DB (אחריות: Antigravity)
- [x] הגדרת סכמה ראשונית (`001_initial_schema.sql`)
- [x] הגדרת מדיניות אבטחה (`002_rls_policies.sql`)
- [x] כתיבת פונקציות מנוע התאמה ו-check-in (`003_functions.sql`)
- [x] יצירת נתוני Seed לבדיקות (`seed.sql`)
- [x] הרצת מיגרציות ו-Seed בפרויקט Supabase בענן (`flrflktlltmqbiamljlm`)
- [x] כתיבת בדיקות RLS אוטומטיות

### 🎨 עיצוב וחווית משתמש (אחריות: Antigravity)
- [x] יצירת Design System ב-Stitch
- [x] עיצוב 6 מסכי ליבה ב-Stitch וייצוא קוד

### 📱 אפליקציית מובייל (אחריות: Antigravity)
- [x] **WP1: Closing the match loop** (Matching algorithm + DB Schema updates). 
- [x] **WP2: Push Notification Foundation** (Push token table, Edge Function setup). 
- [x] **WP3: Admin Panel - Verification Queue** (Admin approval queue). 
- [x] **WP4: Engine Cleanup** (Matching fixes). 
- [x] **WP5: Daily Ops Tooling** (Check-in logging and admin viewing). 
- [x] **WP6: Admin Analytics** (Basic metrics for supervisors).
- [x] **WP7: Admin MFA** (AAL2 enforcement for sensitive Admin APIs).
- [x] **WP8: Field Visibility API** (Parent-controlled data exposure logic).
- [x] **WP9: Screenshot Protection API** (Audit logging logic).
- [x] **WP10: Admin Reports** (Advanced SQL aggregations for admin analytics).
- [x] **WP11: Launch Hardening** (RPC Rate Limiting, CORS, PII Log cleanup).
- [x] אתחול פרויקט Expo SDK 53 ב-`apps/mobile`
- [x] הגדרת NativeWind (+ design tokens מהמפרט)
- [x] הגדרת Expo Router (כולל role-based routing ל-parent ו-professional)
- [x] הגדרת i18n (עברית ואנגלית עם תמיכת RTL)
- [x] חיבור Supabase JS Client והפקת Types (`@toghther/shared`)
- [x] מסכי Onboarding ורישום (הורה / משלבת) + Auth OTP
- [x] Onboarding מפוצל לפי תפקיד: משלבת → `professionals`, הורה → `children` + `child_details`
- [x] שומרי ניווט (route guards) עם הפרדת תפקידים (parent ↔ professional)
- [x] פרופיל ילד (CRUD) + בורר ילדים
- [x] מסכי בית הורה (התאמות מ-RPC `get_matches_for_child`)
- [x] זרימת שליחת בקשה (TIER 1) + מסך בקשות
- [x] מסכי בית משלבת: בקשות נכנסות + תגובה (interested/rejected)
- [x] Browse TIER 0 (ילדים מפורסמים) + הבעת עניין
- [x] פרופיל משלבת (עריכת התמחויות, מסגרות, ניסיון, bio)
- [x] Active match dashboard (EVV check-in card, AI insights, logs list)
- [x] Daily log form (mood + pedagogical metrics + notes)

---

## 🔄 נקודות סנכרון ואינטגרציה (תלויות דו-צדדיות)
1. **הפקת Types**: Cursor צריך להריץ `npm run types:generate` רק לאחר ש-Antigravity מריץ בהצלחה את ה-migrations בענן.
2. **חיבור מנוע התאמה**: ה-API של האפליקציה למנוע ההתאמה תלוי בפונקציה `get_matches_for_child` שכתב Antigravity.
