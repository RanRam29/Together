# 🛑 סקירת ארכיטקט: `20260713030000_v3_hardening.sql` — נדרש תיקון לפני פריסה

> סטטוס: **חסימה. אין לדחוף לענן ואין לקמט עד סגירת סעיף 1.**
> הטיוטה טובה ברובה — סעיפים 2–7 להלן מאושרים. אבל בלוק `anonymize_user` הוא רגרסיה שמחזירה שלושה באגים שכבר תוקנו ואומתו.

## 1. 🔴 חובה: להחליף את בלוק `anonymize_user` כולו

הגרסה בטיוטה מבוססת על עותק ישן (מלפני `audit_fixes_v2` ו-`security_hardening_rls_auth`) ומחזירה:

| רגרסיה | ראיה | תוצאה |
|--------|------|-------|
| `WHERE author_id = p_user_id` על `reviews` | לטבלה יש `reviewer_id` בלבד (`001_initial_schema.sql:259`) — זה בדיוק הבאג שתוקן ב-`20260712235900` | **מחיקת חשבון תיכשל בזמן ריצה** — החוק (תיקון 13) מחייב שהיא תעבוד |
| `WHERE professional_id IN (...)` על `document_uploads` | לטבלה יש `owner_id` בלבד (`001_initial_schema.sql:278`) | כנ"ל — כשל בזמן ריצה |
| הוסרה מחיקת הקבצים הפיזית מ-`storage.objects` (נשארה רק מחיקת שורות) | ההערה בקוד: "requires bucket cleanup which is separate" — זו הפרת D28 שכבר נסגרה | מסמכי רישום פלילי/תעודות נשארים ב-bucket אחרי "מחיקה" |
| הוסר `PERFORM public.check_admin_mfa()` מנתיב האדמין | קיים בגרסה החיה (`20260713000000` שורות 207–212) — הקשחת H1 | אדמין בלי אימות דו-שלבי יכול למחוק כל חשבון |

**הוראת תיקון:** למחוק את כל הבלוק (שורות 330–416) ולהחליפו בהעתק מדויק של `anonymize_user` מ-`20260713000000_security_hardening_rls_auth.sql` (שורות 202–286) עם שינוי יחיד — בשלב 8 להוסיף `ended_at = now()`:

```sql
  -- 8. End any active matches (D14 needs ended_at for the 14-day path)
  UPDATE public.matches
  SET status = 'ended',
      ended_at = now()
  WHERE status = 'active'
    AND (...);   -- התנאי הקיים ללא שינוי
```

שום שינוי אחר בפונקציה. זו הפעם השנייה שעותק ישן של הפונקציה הזו חוזר — מעתה כל שינוי בה מתחיל מהגרסה במיגרציה האחרונה שנוגעת בה, לא מזיכרון.

## 2. 🟡 `get_matches_for_child` — להוסיף נעילת `search_path`

`CREATE OR REPLACE` מאפס את מאפייני הפונקציה, כך שהנעילה שהוחלה ב-M1 אובדת. לשנות את השורה האחרונה ל:

```sql
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```

## 3. 🟡 לצמצם את ההרשאות בסעיף 1.5

`GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated` רחב מדי: כל הכתיבה לשתי הטבלאות עוברת דרך RPC-ים בהרשאות בעלים, ו-RLS ממילא חוסם. עיקרון ההרשאה המינימלית:

```sql
GRANT SELECT ON public.match_hides TO authenticated;
GRANT SELECT ON public.match_days_off TO authenticated;
```

## מאושר כמות שהוא (לא לגעת)
- `DROP export_system_data` ✔️ (+ הבדיקה שהפונקציה איננה)
- החרגת `match_days_off` מ-`get_live_ops_alerts` ✔️ (הקירוב "יום חופשה בחלון 3 הימים מבטל התראה" מקובל ל-MVP)
- `mark_day_off`: ולידציית ±14 יום + סטטוס ✔️
- `hide_match_profile` + `mark_day_off`: נעילת `search_path` ✔️
- מדיניות `match_days_off` ו-Storage על `is_admin()` ✔️
- `get_matches_for_child` על `is_admin()` ✔️

## הגדרת גמר (ללא שינוי)
pgTAP ירוק מקומית (כולל `v3_hardening_test.sql` + בדיקה חדשה: `anonymize_user` רצה בהצלחה על משתמש בדיקה עם review ומסמך) · דחיפה לענן · עדכון הלוח.
