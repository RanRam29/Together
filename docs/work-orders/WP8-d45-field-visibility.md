# WP8 — D45: מתגי "מה דנה רואה" — הרשאות פר-שדה, פר-זוג ילד-משלבת

> **מפרט ארכיטקט מחייב.** אין לסטות ממנו בלי שאלה בלוח. מקור ההחלטה: D45 ב-`product/01-DECISIONS.md`.
> תלות: אחרי אישור שלב 1 (סקירת v3). בעלות: Antigravity (סעיפים 1–5), Cursor (סעיף 6).

## עקרונות (מההחלטה, לא לפתוח מחדש)
1. השליטה היא **פר-שדה** ו**פר-זוג** (ילד ↔ משלבת) — לא פר-ילד גלובלית.
2. **"השהה גישה" = כיבוי כל המתגים בבת אחת** לאותו זוג. לא מנגנון נפרד, לא דגל נוסף. "חידוש" = הדלקת כולם מחדש (איפוס נקי — לא משחזרים מצב קודם).
3. ברירת מחדל: **הכל גלוי** (שימור ההתנהגות הקיימת; ההורה מקבל שליטה, לא חסימה).
4. המשלבת **לא יודעת** אילו שדות הוסתרו — שדה מוסתר חוזר כ-NULL, ללא סימון. אין לה גישת קריאה לטבלת ההרשאות (מניעת הסקת "מה מסתירים ממני").
5. שכבת ה-TIER נשארת כמו שהיא — המתגים הם **צמצום נוסף מעל** TIER 2/3, לא תחליף.

## 1. טבלה חדשה
```sql
CREATE TABLE public.child_field_visibility (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  hidden_fields   TEXT[] NOT NULL DEFAULT '{}',   -- ריק = הכל גלוי
  updated_by      UUID NOT NULL REFERENCES public.profiles(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (child_id, professional_id)
);
```
- מודל "רשימת מוסתרים" (לא רשימת גלויים): היעדר שורה או מערך ריק ⇒ הכל גלוי; אין צורך בזריעת שורות לכל match.
- רשימת המפתחות החוקיים — קבועה, נאכפת ב-RPC (לא CHECK, כדי שהוספת שדה עתידי לא תדרוש ALTER):
  `diagnosis_full, what_works, what_triggers, gender_preference, parent_contact, win_definition, notes`
  (`full_name` **אינו** ניתן להסתרה — בלי שם אין ליווי; אם ההורה לא רוצה לחשוף שם מלא, זה נעשה בשלב הבקשה, לא כאן.)

## 2. RLS
```sql
ALTER TABLE public.child_field_visibility ENABLE ROW LEVEL SECURITY;
-- קריאה: הורי הילד (ראשי/משני) ואדמין. במפורש: לא המשלבת.
CREATE POLICY cfv_parent_read ON public.child_field_visibility FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.children c WHERE c.id = child_id
            AND (c.parent_id = auth.uid() OR c.secondary_parent_id = auth.uid()))
    OR public.is_admin()
  );
-- כתיבה: אך ורק דרך ה-RPC (אין מדיניות INSERT/UPDATE/DELETE).
```

## 3. RPC יחיד לכתיבה
```sql
public.set_child_field_visibility(
  p_child_id UUID, p_professional_id UUID, p_hidden_fields TEXT[]
) RETURNS void
-- SECURITY DEFINER, SET search_path = public, pg_temp
```
לוגיקה מחייבת, לפי הסדר:
1. הרשאה: הקורא הוא `children.parent_id` **או** `secondary_parent_id` עם הרשאת `manage_visibility` ב-`secondary_parent_permissions` (אם המפתח לא קיים בהרשאות — נדחה). אחרת חריגה.
2. ולידציה: כל איבר ב-`p_hidden_fields` שייך לרשימת המפתחות החוקיים; כפילויות מוסרות. אחרת חריגה עם שם השדה הפסול.
3. חייב להתקיים match ביניהם בסטטוס `active`/`paused` (אין מתגים לזוג שאין לו קשר).
4. UPSERT על `(child_id, professional_id)` עם `updated_by = auth.uid()`.
5. רישום ל-`audit_log`: resource=`child_field_visibility`, action=`update`, metadata עם המערך החדש (המפתחות בלבד — לא תוכן רפואי).

"השהה גישה" מהאפליקציה = קריאה עם כל המפתחות; "חידוש" = קריאה עם `'{}'`. אין RPC נפרד.

## 4. אכיפה ב-`get_child_details` — לב המשימה
לשנות את הפונקציה (הגרסה החיה: `20260707111544` + עדכוני המשך) כך שאחרי בדיקת ה-TIER והרישום ל-audit:
- אם הקורא הוא professional: לשלוף `hidden_fields` עבור `(p_child_id, get_professional_id())` ולהחזיר `NULL` בכל עמודה ששמה במערך. מימוש פשוט: משתנה `v_hidden TEXT[]` ואז `CASE WHEN 'diagnosis_full' = ANY(v_hidden) THEN NULL ELSE cd.diagnosis_full END` וכן הלאה לכל שדה בר-הסתרה.
- הורה/אדמין — ללא שינוי.
- **אסור** לשנות את חתימת הפונקציה (האפליקציה תלויה בה).

## 5. בדיקות pgTAP (קובץ חדש `wp8_field_visibility_test.sql`)
1. ברירת מחדל: משלבת TIER2 רואה `diagnosis_full` מלא.
2. אחרי הסתרת `diagnosis_full`: אותה משלבת מקבלת NULL בשדה זה, ושדות אחרים מלאים.
3. משלבת אחרת של אותו ילד (זוג אחר) — לא מושפעת.
4. הורה רואה הכל גם כשהכל מוסתר; אדמין רואה הכל.
5. משלבת לא יכולה `SELECT` על `child_field_visibility` (0 שורות).
6. הורה זר / משלבת — נדחים ב-RPC; שדה פסול נדחה.
7. "השהה" (כל המפתחות) ⇒ כל השדות ברי-ההסתרה NULL, `full_name` נשאר.

## 6. Cursor — ממשק (אחרי שה-RPC בענן וה-types הופקו)
- מסך "מה {שם המשלבת} רואה" נפתח מתוך כרטיס ה-match הפעיל (צד הורה): רשימת מתגים לפי סדר השדות + כפתור "השהיית גישה זמנית" ו"חידוש גישה" — כפתור אחד שמתחלף לפי מצב (הכל-מוסתר ⇄ אחרת).
- קופי לפי `product/06-COPY-TONE.md` — טון חם, בלי שפה משפטית ("dana תראה" / "מוסתר מ-dana"), אישור קצר אחרי שמירה.
- אין מסך לצד המשלבת. אין שום אינדיקציה בצד שלה.
- אם להורה המשני אין `manage_visibility` — המסך במצב קריאה בלבד עם הסבר קצר.

## הגדרת גמר
pgTAP ‏7/7 ירוק · `tsc` נקי · types מופקים · אימות ידני של תרחיש 2 מול הענן · עדכון D45 ב-`01-DECISIONS.md` כ"מומש" + עדכון הלוח.
