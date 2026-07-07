# 🚦 Together — לוח תיאום וסטטוס סוכנים

> **⚠️ עדכון ארכיטקט (2026-07-07): תיעוד מלא נוסף — נקודת הכניסה לכל משימה היא `product/00-INDEX.md`.**
> - **`product/`** — תיק המוצר: החלטות סופיות (01), פרסונות (02), מסעות (03–04), **מפרט מסכים (05)**, קופי (06), מדדים (07), analytics ‏(08), **DoD ‏(09) — חובה לפני סימון משימה כגמורה**, אזור מנהל (10).
> - **`docs/WORK-ALLOCATION.md`** — חלוקת העבודה המרכזית (מי אחראי על מה, לפי WP/תחום/ארטיפקט + handoffs). **מקור אמת לבעלות.**
> - **`docs/work-orders/`** — תוכניות ביצוע מלאות (מאסטר `00-ROADMAP.md`: C4, WP1–WP7).
> - **`docs/`** — ‏ARCHITECTURE · DEV-PROCESS (כולל סדר עדיפויות תקף) · TESTING-STRATEGY · AUTH-SPEC · SECURITY-GUIDELINES.
> - **`docs/SECURITY-GUIDELINES.md` + `docs/AUTH-SPEC.md`** — פיתוח מונחה־אבטחה, אימות והרשאות, מטריצת הרשאות מלאה. **מחייבים לכל משימה שנוגעת בנתונים.**
> - **`ARCHITECTURE_REVIEW.md`** — תיקוני אבטחה קריטיים שקודמים לכל פיתוח אחר. **חדש 🔴 C4: כל משתמש יכול למנות עצמו אדמין** (‏`profiles_own_update` בלי WITH CHECK על role) — התיקון הראשון בתור. בנוסף C1 (self-approve), C2/C3 (חשיפת children + audit).
> - **חדש (D23): אזור מנהל מלא ב-MVP** — route group ‏`(admin)` ב-web; תור האימות (Admin-1) משתלב באבן דרך 3. מפרט: `product/10-ADMIN-SPEC.md`.
> בנושאי אבטחה/ארכיטקטורה — ARCHITECTURE_REVIEW גובר; בנושאי מוצר/UX — תיק המוצר גובר על DEVELOPMENT_PLAN.md.
>
> **🟡 C4 — תיקון נכתב ע"י הארכיטקט (ממתין לאימות/דחיפה):** `supabase/migrations/20260707120000_c4_protect_profile_role.sql` + `supabase/tests/c4_role_escalation_test.sql`. טריגר שמקפיא `role`/`id` למשתמש מאומת + `is_admin()` מוקשח + הקשחת Storage. **טרם אומת מקומית (Docker) ולא נדחף לענן (חסר SUPABASE_DB_PASSWORD).** הרצה נדרשת: `supabase db reset` + `supabase db query --file supabase/tests/c4_role_escalation_test.sql`, ואז `supabase db push --linked`.
> **🟠 finding חדש H4 (ARCHITECTURE_REVIEW):** `approve_request` יוצר match פעיל מיד — סטייה מ-D10. **לטיפול דו-צדדי אחרי C4** (משפיע על מסכי Cursor שכבר נבנו). אל תתקנו לבד — נתאם.
>
> **📮 שאלות לארכיטקט** (סוכן שנתקל בשאלה מוצרית פתוחה — רושם כאן וממשיך במשימה אחרת):
> - (אין כרגע)

> **הנחיה לסוכנים (Antigravity & Cursor):**
> 1. **קראו** את הקובץ הזה בתחילת כל סבב עבודה כדי להבין מה הסוכן השני עושה.
> 2. **עדכנו** את הסטטוס שלכם ואת לוח המשימות בקובץ זה וב-`coordination_state.json` בסוף כל סבב עבודה.
> 3. **אל תגעו** במשימות המשויכות לסוכן השני ללא תיאום.

---

## 🤖 סטטוס סוכנים נוכחי

### 🟢 Antigravity (Backend & DB & Stitch)
- **משימה נוכחית**: סיום תשתית DB ו-Seed בענן. מתחיל Stitch Design System.
- **הצעד הבא**: Stitch Design System + 6 מסכי ליבה.
- **חסימות**: אין.

### 🟡 Cursor (Mobile App Shell & UI)
- **משימה נוכחית**: ✅ הרחבת ה-flow עם פיצ'רים משלימים:
  - **העלאת מסמכי אימות בפועל** — `expo-document-picker` + `expo-image-picker` הותקנו והוגדרו ב-`app.json`. מסך המסמכים של המשלבת מבצע pick → upload ל-`documents` bucket (path `<user_id>/<ts>-<name>`) → יצירת רשומה ב-`document_uploads`. מגבלת 5MB, הודעות שגיאה מלאות.
  - **צפייה בביקורות** — רכיבי `ReviewsList` ו-`ReviewsSummary` שקוראים ל-`useGetReviewsForProfessional`. משולבים במסך `match-detail` כדי שההורה יראה דירוגים ופידבקים לפני שליחת בקשה.
  - **End Match flow** — כפתור "סיום התאמה" בתחתית לוח הבקרה של active-match. עדכון `matches.status = 'ended'` ופתיחה אוטומטית של מסך `review` עם `matchId` + `professionalId`.
- **הצעד הבא**: תכולה נוספת כשארשם עדיפויות: (1) הצגת דירוג המשלבת גם על כרטיסי ההתאמה בבית ההורה; (2) חיבור עמוקה ל-`get_child_details` RPC (עם audit) עבור משלבת שרוצה לקרוא פרטים עשירים של ילד ב-TIER 2+; (3) התראות push.
- **חסימות**: `supabase gen types typescript --linked` עדיין נכשל ב-`TransportError` — ה-Cloud לא נגיש מהמכונה. Cast זמני על 4 קריאות RPC/view עד שה-types יסונכרנו.

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

### 📱 אפליקציית מובייל (אחריות: Cursor)
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
