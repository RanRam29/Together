# 🚦 Together — לוח תיאום וסטטוס סוכנים

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
- **משימה נוכחית**: ✅ הושלם App Shell — Expo SDK 53 + NativeWind + Expo Router + i18n + Supabase client + Types.
- **הצעד הבא**: בניית מסכי Onboarding ורישום (הורה ומשלבת) לפי עיצובי Stitch.
- **חסימות**: אין. ממתין לייצוא קוד/HTML של מסכי Stitch (אופציונלי — אפשר לבנות מה-Screenshots).

---

## 📋 לוח משימות MVP

### 🗄️ תשתית ו-DB (אחריות: Antigravity)
- [x] הגדרת סכמה ראשונית (`001_initial_schema.sql`)
- [x] הגדרת מדיניות אבטחה (`002_rls_policies.sql`)
- [x] כתיבת פונקציות מנוע התאמה ו-check-in (`003_functions.sql`)
- [x] יצירת נתוני Seed לבדיקות (`seed.sql`)
- [x] הרצת מיגרציות ו-Seed בפרויקט Supabase בענן (`flrflktlltmqbiamljlm`)
- [ ] כתיבת בדיקות RLS אוטומטיות

### 🎨 עיצוב וחווית משתמש (אחריות: Antigravity)
- [x] יצירת Design System ב-Stitch
- [x] עיצוב 6 מסכי ליבה ב-Stitch וייצוא קוד

### 📱 אפליקציית מובייל (אחריות: Cursor)
- [x] אתחול פרויקט Expo SDK 53 ב-`apps/mobile`
- [x] הגדרת NativeWind (+ design tokens מהמפרט)
- [x] הגדרת Expo Router (כולל role-based routing ל-parent ו-professional)
- [x] הגדרת i18n (עברית ואנגלית עם תמיכת RTL)
- [x] חיבור Supabase JS Client והפקת Types (`@toghther/shared`)
- [ ] מסכי Onboarding ורישום (הורה / משלבת)
- [ ] מסכי בית הורה (התאמות)
- [ ] מסכי בית משלבת (בקשות ו-Browse)

---

## 🔄 נקודות סנכרון ואינטגרציה (תלויות דו-צדדיות)
1. **הפקת Types**: Cursor צריך להריץ `npm run types:generate` רק לאחר ש-Antigravity מריץ בהצלחה את ה-migrations בענן.
2. **חיבור מנוע התאמה**: ה-API של האפליקציה למנוע ההתאמה תלוי בפונקציה `get_matches_for_child` שכתב Antigravity.
