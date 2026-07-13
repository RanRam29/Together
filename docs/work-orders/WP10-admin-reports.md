# WP10 — דוחות אדמין מצטברים (שלב 3) — התחליף הכשר לייצוא שנמחק

> בעלות: Antigravity (סעיפים 1–3), Cursor (סעיף 4). תלות: שלב 1 סגור. מקור: תוכנית ההמשך 2026-07-13, שלב 3.

## עיקרון-על (D25, מחייב)
**דוחות מצטברים בלבד. אסור שדוח יחזיר:** שם, טלפון, כתובת, טקסט חופשי (`notes`/`bio`/`text`), אבחנה, או כל שדה מ-`child_details`. צפייה פרטנית חריגה נעשית אך ורק דרך `admin_log_reasoned_view` הקיים (סיבה חובה + audit) — לא דרך דוחות. כל RPC דוח: `is_admin()` + `check_admin_mfa()` + ‏`SET search_path` + רישום `audit_log` ‏(resource=`report`, action=שם הדוח, metadata=הפרמטרים).

## 1. ארבעה RPC-ים (מיגרציה אחת)

### 1.1 `admin_report_overview() RETURNS jsonb`
תמונת מצב רגעית — ספירות בלבד: משתמשים פעילים לפי תפקיד (ללא מחוקים), matches לפי סטטוס, בקשות פתוחות לפי סטטוס, משלבות בתור אימות לפי `verified`, ממוצע ימי-המתנה בתור, מספר דיווחים יומיים ב-7 הימים האחרונים, מספר אירועי `screenshot_detected` ב-30 יום.

### 1.2 `admin_report_timeseries(p_metric text, p_from date, p_to date) RETURNS TABLE(bucket date, value numeric)`
דלי יומי. רשימת מדדים סגורה (whitelist — כל ערך אחר ⇒ חריגה):
`new_users` · `new_children_published` · `new_requests` · `new_matches` · `ended_matches` · `daily_logs` · `checkins` · `day_offs`.
ולידציה: `p_from <= p_to`, טווח מקסימלי 366 יום.

### 1.3 `admin_report_funnel(p_from date, p_to date) RETURNS jsonb`
משפך הבקשות בטווח: נשלחו → interested → approved → הפכו ל-match → פעילים כיום → הסתיימו, + אחוזי המרה בין שלבים. מבוסס ספירות על `match_requests`/`matches` בלבד.

### 1.4 `admin_report_verification_sla() RETURNS TABLE(week date, submitted int, verified int, avg_days_to_verdict numeric)`
לפי שבוע, 12 שבועות אחורה: כמה הוגשו, כמה אושרו, וזמן ממוצע מהגשה להכרעה (`professionals.created_at→verified_at`; דחיות נספרות דרך `document_uploads.rejection_note IS NOT NULL`).

## 2. בדיקות pgTAP (`wp10_reports_test.sql`)
1. לא-אדמין נדחה בכל ארבעת ה-RPC-ים; אדמין בלי AAL2 נדחה (`check_admin_mfa`).
2. מדד לא ברשימה ⇒ חריגה; טווח הפוך ⇒ חריגה.
3. על נתוני seed: `overview` מחזיר ספירות נכונות; `timeseries('new_matches',…)` תואם ספירה ישירה.
4. **בדיקת אי-דליפה:** ההחזר של כל RPC (כטקסט) אינו מכיל אף `first_name`/`display_name`/`phone` מנתוני ה-seed.

## 3. הצעת החלטה D49 — מדיניות שמירת נתונים (לאישור בעל המוצר, לא לממש לפני)
| נתון | הצעה | נימוק |
|------|------|-------|
| `analytics_events` | מחיקה אחרי 12 חודשים (cron חודשי) | תפעולי בלבד, מזעור מידע לפי תיקון 13 |
| `checkins` (מיקום!) | לעמעם קואורדינטות אחרי 6 חודשים (להשאיר זמן+match) | מיקום ילד = רגיש במיוחד; הערך התפעולי קצר-טווח |
| `daily_logs` | נשמר (ערך פדגוגי להורה); `notes` כבר מרוקן במחיקת חשבון | — |
| `audit_log` | 24 חודשים | איזון ראייתי/מזעור |

לאחר אישור: Antigravity מוסיף cron + מעדכן `01-DECISIONS.md`.

## 4. Cursor — מסך "דוחות" באזור הניהול
- לשונית חדשה ב-`(staff)`: כרטיסי overview למעלה, גרף קו ל-timeseries עם בורר מדד וטווח, משפך, וטבלת SLA. ספריית גרפים קיימת בפרויקט אם יש; אחרת `react-native-svg` פשוט — לא להוסיף תלות כבדה.
- אין בשום מסך דוח שם/פרט מזהה. אם חסר נתון — מצב ריק ("אין עדיין נתונים"), לא שגיאה.
- שער MFA: משתמשים ב-hook הקיים (`mfa.handleRpcError`) כמו ב-`config.tsx`.

## הגדרת גמר
pgTAP ירוק כולל בדיקת אי-הדליפה · `tsc` נקי · צילום מסך של ארבעת הרכיבים מול נתוני בדיקה בענן · עדכון הלוח.
