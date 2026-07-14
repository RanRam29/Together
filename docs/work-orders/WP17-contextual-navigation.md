# WP17 — ניווט הקשרי ו"מה עכשיו?" (Next Best Action)

> **בעלות:** Cursor (אפליקציה), Antigravity (תיקוני push + אופציונלי cron), ארכיטקט (אישור D57).
> **מקור:** החלטת בעל המוצר (2026-07-14) — "חיים קלים": להנגיש את העמוד הנכון בזמן הנכון.
> **מעמד:** מאושר לביצוע. חבילה חוצת-תפקידים; אינה תלויה ב-WP12–WP15 אך משלימה אותן.
> **מדד הצפון:** שיעור פעולות "הצעד הבא" שמסתיימות בהצלחה תוך 2 דקות מפתיחה/התראה.

---

## 1. עיקרון-על

במקום שהמשתמש ינחש איזה טאב לפתוח, האפליקציה מחשבת **פעולה אחת בולטת** (Next Best Action — NBA) לפי:

| ממד | דוגמה |
|-----|--------|
| **תפקיד** | הורה / משלבת / לא מאומתת |
| **שלב במסע** | אונבורדינג · ממתין לאימות · אין match · match פעיל |
| **זמן** | שעה מקומית (`Asia/Jerusalem`), יום בשבוע |
| **מצב יומי** | צ'ק-אין · צ'ק-אאוט · יומן · בקשה ממתינה |
| **מקור כניסה** | פתיחה רגילה · לחיצה על push · חזרה אחרי overlay |

**כללי UX (מחייבים):**
1. **פעולה אחת ראשית** — כרטיס NBA אחד בראש; פעולות משניות קטנות מתחת (לא באותה חשיבות).
2. **הסבר קצר "למה עכשיו"** — משפט אחד (לפי `product/06-COPY-TONE`).
3. **לא לחזור על מה שנעשה** — אם היומן מולא, להציע "הוספת יומן נוסף" או להסתיר.
4. **לחיצה אחת → המסך הנכון** — עם `params` מלאים (`matchId`, `requestId`, `logId`).
5. **אין ציון מספרי, אין לחץ מלאכותי** — תזכורת ≠ אזהרה אדומה.

---

## 2. ארכיטקטורה (אפליקציה)

### 2.1 קבצים חדשים (יעד)

```
apps/mobile/
  lib/navigation/
    journey-stage.ts      # חישוב שלב במסע (טהור, ללא React)
    next-actions.ts       # getNextActions(role, stage, context) → NextAction[]
    resolve-landing.ts    # איזה טאב/מסך בפתיחה
  hooks/
    useNextActions.ts     # אוסף hooks קיימים → context
    useTabBadges.ts       # מונים לטאבים
  components/shared/
    NextActionCard.tsx    # כרטיס ראשי
    NextActionList.tsx    # אופציונלי: 2–3 פעולות משניות
```

### 2.2 טיפוסים

```typescript
type JourneyStage =
  | "onboarding_incomplete"
  | "awaiting_verification"      // משלבת
  | "verification_rejected"      // משלבת
  | "no_child_published"         // הורה
  | "no_active_match"
  | "awaiting_request_response"  // הורה — בקשה נשלחה
  | "request_needs_approval"     // הורה — interested
  | "pro_pending_requests"       // משלבת
  | "daily_ops_morning"          // משלבת — צ'ק-אין
  | "daily_ops_active"           // משלבת — במסגרת
  | "daily_ops_log"              // משלבת — יומן
  | "daily_ops_done"             // משלבת — הכל בוצע
  | "match_active_routine";      // ברירת מחדל עם match

type NextAction = {
  id: string;
  priority: number;           // 1 = הכי דחוף
  title: string;
  reason: string;             // "למה עכשיו"
  cta: string;
  href: string;               // expo-router pathname
  params?: Record<string, string>;
  variant: "purple" | "teal" | "amber";
  icon: "checkin" | "log" | "request" | "publish" | "docs" | "summary";
  badgeKey?: string;          // לסנכרון עם tab badge
};
```

### 2.3 מקורות נתונים (קיימים — לא DB חדש בשלב 1)

| Hook / Store | שדה רלוונטי |
|--------------|-------------|
| `useAuthStore` | `profile.role` |
| `useActiveMatchForParent/Professional` | `activeMatch` |
| `useMatchRequests` | `interested`, `pending`, `approved` |
| `useTodayCheckin` | `is_valid`, `checkout_at` |
| `useGetDailyLogs` | יומנים להיום (`log_date`) |
| `useMyProfessional` + `useVerificationGate` | `verified` |
| `useChildren` | `published`, count |
| `useParentStore` | `selectedChildId` |

---

## 3. מפת פעולות לפי תפקיד

### 3.1 משלבת (S-PRO-01, S-PRO-06)

| עדיפות | תנאי | כותרת (טיוטה) | יעד |
|--------|------|---------------|-----|
| 1 | `!verified` | "השלימי את האימות" | `/(professional)/documents` |
| 2 | בקשה `pending` (הכי ישנה) | "בקשה מחכה לתשובה" | `/(professional)/request-detail` + `requestId` |
| 3 | match פעיל, בוקר, אין צ'ק-אין היום | "הגעת למסגרת?" | `/(professional)/today` |
| 4 | צ'ק-אין תקף, אין checkout | "סיימת להיום?" | `/(professional)/today` (checkout) |
| 5 | אחה"צ או אחרי checkout, אין יומן היום | "איך היה היום?" | `/(active-match)/daily-log-form` |
| 6 | יש יומן היום | "הוספת יומן נוסף" (משני) | `daily-log-form` |
| 7 | אין match פעיל | "גלי ילדים שמחפשים ליווי" | `/(professional)/browse` |

**נחיתה בפתיחה (`resolve-landing`):** אם שלב ∈ `{daily_ops_morning, daily_ops_active, daily_ops_log}` → טאב `today` כברירת מחדל.

### 3.2 הורה (S-PAR-01, S-PAR-04, S-PAR-07)

| עדיפות | תנאי | כותרת (טיוטה) | יעד |
|--------|------|---------------|-----|
| 1 | בקשה `interested` | "{שם משלבת} מעוניינת — לאשר?" | `/(parent)/intro-detail` או sheet אישור |
| 2 | בקשה `pending` (נשלחה, ממתינה) | "הבקשה נשלחה — ממתינים לתשובה" | `/(parent)/(tabs)/requests` |
| 3 | match פעיל, אין צ'ק-אין תקף היום | "עדיין לא נרשמה הגעה היום" | `/(active-match)` |
| 4 | סיכום AI חדש (24h, לא נצפה) | "סיכום היום מוכן" | `/(active-match)/daily-log-detail` + `logId` |
| 5 | ילד לא פורסם | "פרסמי את הפרופיל כדי שמשלבות יראו" | `/(parent)/(tabs)/child-profile` |
| 6 | אין התאמות / אין בקשות | "גלי משלבות מתאימות" | `/(parent)/(tabs)` (matches) |

**נחיתה בפתיחה:** אם `request_needs_approval` → טאב `requests` או בית עם NBA בולט.

### 3.3 מקור כניסה: Push

כל handler ב-`lib/push-notifications.ts` חייב לנווט ל-**מסך + params**, לא לטאב גנרי.

| `type` (נוכחי) | נמען | יעד נכון | באג היום |
|----------------|------|----------|----------|
| `match_request` | משלבת | `request-detail` + `requestId` | → בית גנרי |
| `request_interested` | **הורה** | `requests` או `intro-detail` | → **בית משלבת (שגוי!)** |
| `request_declined` | **הורה** | `requests` | → **בית משלבת (שגוי!)** |
| `match_created` | משלבת | `/(active-match)` + `matchId` | ✓ חלקי |
| `checkin` | הורה | `/(active-match)` + `matchId` | ✓ |
| `daily_summary_ready` | הורה | `daily-log-detail` + `logId` | → hub בלבד |
| `daily_log_reminder` | משלבת | `daily-log-form` + `matchId` | → hub |
| `review_request` | הורה | `/(active-match)/review` | ✓ |

**דרישת שרת (Antigravity, אופציונלי בשלב 2):** לוודא ש-`data` ב-push כולל תמיד מזהים: `request_id`, `match_id`, `log_id` לפי סוג.

---

## 4. תוכנית ביצוע — 4 שלבים

### שלב א — תיקוני Quick Win (יום 1–2) · Cursor

**מטרה:** משתמש שחוזר מהתראה מגיע למקום הנכון.

| # | משימה | קבצים | קבלה |
|---|--------|--------|------|
| א.1 | תיקון ניתוב `request_interested` / `request_declined` להורה | `lib/push-notifications.ts` | לחיצה על push → `/(parent)/(tabs)/requests` |
| א.2 | `match_request` → `request-detail` עם `requestId` | אותו קובץ | מסך בקשה ספציפי נפתח |
| א.3 | `daily_log_reminder` → `daily-log-form` | אותו קובץ | טופס יומן נפתח ישירות |
| א.4 | `daily_summary_ready` → `daily-log-detail` עם `logId` | אותו קובץ + בדיקת payload בטריגר |
| א.5 | בדיקות ידניות: טבלת סעיף 3.3, שורה-שורה | `docs/TEST-CREDENTIALS.md` | E2E מתועד בלוח |

**אין מיגרציה בשלב א** — רק אם `log_id` חסר בטריגר, תיקון קטן ב-SQL (Antigravity).

---

### שלב ב — מנוע NBA + כרטיס (שבוע 1) · Cursor

| # | משימה | קבצים | קבלה |
|---|--------|--------|------|
| ב.1 | `journey-stage.ts` + `next-actions.ts` עם יחידות בדיקה | `lib/navigation/*` | Jest: 15+ תרחישים (בוקר/אחה"צ, הורה/משלבת) |
| ב.2 | `useNextActions` — חיבור hooks | `hooks/useNextActions.ts` | לא מריץ שאילתות כפולות (reuse query cache) |
| ב.3 | `NextActionCard` — RTL, variants לפי design tokens | `components/shared/NextActionCard.tsx` | Purple/Teal/Amber, Rubik, נגישות |
| ב.4 | שילוב בבית משלבת | `(professional)/index.tsx` | כרטיס מעל ActiveMatchBanner; באנר משני אם יש NBA דחוף יותר |
| ב.5 | שילוב ב"היום שלי" | `(professional)/today.tsx` | כרטיס מחליף/משלים לוגיקת questionnaire הקיימת |
| ב.6 | שילוב בבית הורה | `(parent)/(tabs)/index.tsx` | כרטיס מעל LetterCard; עדיפות ל-interested |
| ב.7 | i18n | `he.json`, `en.json` | מפתחות `nba.*` — בלי מחרוזות קשיחות |
| ב.8 | אירועים | `08-ANALYTICS-EVENTS.md` + `track()` | `nba_shown`, `nba_tapped`, `nba_dismissed` |

**קבלת שלב ב:** משלבת בוקר בלי צ'ק-אין רואה כרטיס אחד ברור; הורה עם `interested` רואה אישור; לחיצה מגיעה למסך הנכון.

---

### שלב ג — Badges + נחיתה חכמה (שבוע 2) · Cursor

| # | משימה | קבצים | קבלה |
|---|--------|--------|------|
| ג.1 | `useTabBadges` | `hooks/useTabBadges.ts` | מונים: בקשות interested, יומן/צ'ק-אין חסר |
| ג.2 | Badge על טאבים | `(parent)/(tabs)/_layout.tsx`, `(professional)/_layout.tsx` | נקודה/מספר על אייקון (RTL-safe) |
| ג.3 | `resolve-landing.ts` | `lib/navigation/resolve-landing.ts` | אחרי login / resume: `router.replace` לטאב הנכון **פעם אחת** לסשן |
| ג.4 | שמירת "כבר נחתתי" | `AsyncStorage` key `landing_resolved_{date}` | לא לולאת redirect |
| ג.5 | הגדרות: `settings.tsx` backFallback לפי role | `settings.tsx` | משלבת חוזרת ל-pro tabs |

**קבלת שלב ג:** פתיחת אפליקציה בבוקר (משלבת עם match) → נחיתה ב"היום שלי"; badge על בקשות.

---

### שלב ד — ליטוש + מדידה (שבוע 3) · Cursor + Antigravity

| # | משימה | בעלים | קבלה |
|---|--------|--------|------|
| ד.1 | איחוד כפילויות UI (באנר + NBA + LetterCard) | Cursor | לא יותר מ-2 כרטיסי פעולה באותו מסך |
| ד.2 | מסך "ממתין לתשובה" להורה אחרי שליחת בקשה | Cursor | overlay כבר קיים — להוסיף כרטיס מתמשך בבית |
| ד.3 | Pro בלי match: CTA ל-browse + בקשות ממתינות | Cursor | לא empty state ריק |
| ד.4 | Handler ל-`match_paused` (אם רלוונטי) | Cursor | הודעה + מסך מתאים |
| ד.5 | בדיקת payload בכל טריגרי push | Antigravity | SQL audit + תיקון חסרים |
| ד.6 | דשבורד פנימי: % NBA tapped / shown | Antigravity | שאילתה על `analytics_events` |

---

## 5. אירועי אנליטיקה (להוסיף ל-`product/08-ANALYTICS-EVENTS.md`)

| אירוע | properties | מודד |
|-------|-----------|------|
| `nba_shown` | `action_id`, `stage`, `screen`, `priority` | כמה פעמים הצענו פעולה |
| `nba_tapped` | `action_id`, `stage`, `screen` | conversion הצעה→פעולה |
| `nba_dismissed` | `action_id`, `screen` | רעש מיותר (אם יש dismiss) |
| `push_opened` | `type`, `routed_to` | האם deep link הגיע ליעד |
| `landing_redirect` | `from`, `to_tab`, `stage` | נחיתה חכמה |

**KPI חדש (גל שלישי):** `nba_tapped` / `nba_shown` בשבוע ≥ 40% למשלבות עם match פעיל.

---

## 6. החלטה מוצעת — D57 (לאישור בעל המוצר)

| # | הצעה | נימוק |
|---|-------|--------|
| D57 | מנגנון NBA הוא **שכבת UI מעל הניווט הקיים** — לא מחליף טאבים ולא מסתיר גישה חופשית לכל המסכים | משתמשים מנוסים לא "נכללים"; מפחית חיכוך למתחילים |
| D57.1 | נחיתה אוטומטית לטאב אחרת **פעם אחת ליום** לכל היותר, עם אפשרות ביטול ב-settings (ברירת מחדל: מופעל) | מונע תחושת "האפליקציה שולטת בי" |
| D57.2 | push תמיד מוביל למסך ספציפי, לא לבית גנרי | זה לב "העמוד הנכון בזמן הנכון" מחוץ לאפליקציה |

---

## 7. בדיקות

### 7.1 יחידה (Jest) — `packages/matching` או `apps/mobile/__tests__`

- `getNextActions` — לפחות 20 cases מטבלה בסעיף 3.
- `resolveLandingTab` — 8 cases.

### 7.2 E2E ידני (חובה לסגירת WP)

תבנית לכל תרחיש:

1. משתמש + מצב DB (או seed)
2. פעולה (פתיחה / push)
3. מסך צפוי
4. צילום / הערה

| ID | תרחיש | תפקיד |
|----|--------|--------|
| E2E-NBA-01 | בוקר, match פעיל, אין check-in → NBA צ'ק-אין → today | משלבת |
| E2E-NBA-02 | 15:00, check-out בוצע, אין log → NBA יומן → form | משלבת |
| E2E-NBA-03 | interested קיים → NBA אישור → intro-detail | הורה |
| E2E-NBA-04 | push `request_interested` → requests (לא pro home) | הורה |
| E2E-NBA-05 | push `daily_log_reminder` → daily-log-form | משלבת |
| E2E-NBA-06 | פתיחה בבוקר → נחיתה ב-today tab | משלבת |
| E2E-NBA-07 | badge על requests כשיש interested | הורה |

### 7.3 רגרסיה

- `npm run typecheck` ב-`apps/mobile`
- `expo export --platform web` (Vercel build)
- אין שבירת `useProtectedRoute`

---

## 8. תלויות וסיכונים

| תלות | הערה |
|------|------|
| WP5 (אופרציה יומית) | צ'ק-אין + יומן — **קיים** |
| WP2 (push) | טריגרים קיימים; תיקון client + אולי payload |
| WP8–WP10 UI | **לא חוסם** — NBA עובד בלי זה |
| WP16 (היגיינת התראות) | משלים; שעות שקט לא חוסמות שלב א |

| סיכון | מitiגציה |
|--------|-----------|
| יותר מדי redirects | `landing_resolved` + opt-out ב-settings |
| כפילות עם ActiveMatchBanner | שלב ד — איחוד ויזואלי |
| ביצועים (הרבה hooks) | `useNextActions` משתמש ב-query cache קיים |
| push ב-web | deep link רק native; web — fallback להודעה ב-NBA |

---

## 9. סדר עבודה מומלץ (ללוח התיאום)

```
שלב א (תיקון push) ──▶ שלב ב (NBA core) ──▶ שלב ג (badges+landing) ──▶ שלב ד (ליטוש)
         │                      │
         └────────── במקביל: אישור D57 מבעל המוצר
```

**הערכת מאמץ:** ~3 שבועות Cursor (במקביל ל-WP12/14 UI), ~0.5 יום Antigravity לביקורת push payloads.

---

## 10. הגדרת סיום (DoD)

- [ ] כל שורות טבלת push (סעיף 3.3) עוברות E2E
- [ ] `NextActionCard` ב-3 מסכים: pro home, pro today, parent home
- [ ] Tab badges פעילים לשני התפקידים
- [ ] 5 אירועי אנליטיקה חדשים נרשמים ב-08
- [ ] D57 מתועד ב-`product/01-DECISIONS.md` (אחרי אישור)
- [ ] עדכון `COORDINATION_BOARD.md` — WP17 → `completed`
- [ ] אין רגרסיה ב-build Vercel

---

*נוצר: 2026-07-14 · Cursor · עבור Antigravity, ארכיטקט, ובעל המוצר.*
