# 🎬 בריף ל-Cursor: המשך יישום ערכת אנימציית הלוגו (2026-07-15)

היי Cursor!

בעל המוצר סיפק ערכת עיצוב אנימציה חדשה ("Beshiluv Logo Animation Kit") — קובץ מקור נמצא ב-`images/Beshiluv Logo Animation Kit (standalone).html` ו-`images/Logo animation assets.zip`. אני (הארכיטקט) בניתי את רוב הרכיבים ואת החיווט שלהם ישירות ב-`apps/mobile` באותה שיחה. **הכל עדיין לא commit** — זה ה-working tree החי שלך, אז יש כאן גם שינויים לא-קשורים שכבר היו פתוחים לפני שהתחלתי (למשל `daily-log-form.tsx`, `login.tsx`, `role-select.tsx` וכו') — אל תיגע בהם בלי לבדוק, הם לא חלק מהמשימה הזו.

## מה כבר בנוי ומחווט (ב-`apps/mobile/components/motion/` — חדש):

| רכיב | מה הוא עושה | איפה מחווט |
|---|---|---|
| `BrandSpinner.tsx` | ספינר טעינה — 3 נקודות (סגול/טורקיז/ענבר) מסתובבות | הוחלף `ActivityIndicator` בעומדים-לבד (לא בתוך כפתורים!) ברוב המסכים — ראה "מה עוד פתוח" למטה |
| `EmptyState.tsx` | לוגו מרחף + צל, `variant="compact"\|"full"` | הוחלף בטקסט-ריק בכמה מסכים (`matches.tsx`, `StaffQueryFeedback`, `ReviewsList`) |
| `SplashReveal.tsx` | חשיפת לוגו חד-פעמית (זוהר+טבעת+סקייל) ואז נשימה עדינה | מוזג ל-`AppProviders.tsx` כ"מסך הטעינה" האמיתי (fonts/i18n gate) — **גם הוספתי `expo-splash-screen` כ-plugin חדש ב-`app.json`** עם אותו לוגו/רקע, כדי שהמעבר מה-splash הנייטיבי ל-JS יהיה חלק |
| `MatchCelebrationModal.tsx` | מודל מסך-מלא: שני עיגולים מתקרבים + קונפטי + טקסט | הוחלף ה-`SentConfirmationOverlay` הישן במסך `intro-detail.tsx` ברגע `metricsConfirmed` (זה בדיוק רגע אישור ההתאמה) |
| `SuccessCheck.tsx` | SVG: טבעת מצטיירת + וי מצטייר, עם "פופ" קטן בסוף | מחווט **בתוך** `SentConfirmationOverlay.tsx` עצמו — כל קריאה קיימת ל-`showSuccess()` עם `icon="checkmark-circle"` (ברירת המחדל) מקבלת את זה אוטומטית, בלי לשנות אף call site |

כל האנימציות מכבדות `prefers-reduced-motion` (`isReduceMotionEnabled()` מ-`lib/motion.ts`, כבר קיים בקוד). צבעי המותג היחידים בשימוש: `colors.purple/teal/amber` מ-`lib/theme.ts` — לא הבאתי צבעים חדשים מה-mockup המקורי (שם היו גוונים אחרים שלא קיימים ב-`tailwind.config.js` היום).

**תלויות חדשות (כבר הותקנו, `package-lock.json` מעודכן):** `react-native-svg@15.11.2`, `expo-linear-gradient@~14.1.5` (עדיין לא בשימוש בפועל — אפשר להסיר אם לא תרצה להשתמש בו), `expo-splash-screen@~0.30.10`.

## מה עוד פתוח — שני sweep-ים רצים ברקע:

הפעלתי שני sub-agents שעובדים כרגע ב-**git worktrees נפרדים** (לא ב-working tree הראשי) על מכניקה חוזרת:
1. להחליף `ActivityIndicator` עצמאי (לא בתוך כפתור) ב-`BrandSpinner` בכל שאר המסכים.
2. לצבוע `RefreshControl` בכל מקום ב-`colors.purple` (`tintColor`+`colors`) — **בהתאם להחלטת בעל המוצר: רק צביעת המשיכה-לרענון בצבעי מותג, לא אנימציה מותאמת-אישית** (המגבלה הטכנית: `RefreshControl` נייטיבי לא תומך ב-JSX מותאם בזמן משיכה בלי לבנות מנגנון מחוות מותאם-אישית מאפס על 15 מסכים — לא שווה את הסיכון).
3. להחליף טקסט "אין פריטים" בודד ב-`EmptyState` היכן שברור שזה החלפה נקייה.

הכיסוי המלא (כולל מה שכבר סגרתי בעצמי): `ActivityIndicator` היה ב-35 קבצים, `RefreshControl` ב-15. כשהם יסיימו, אני **אמזג את השינויים בעצמי** ל-working tree הראשי (הם ב-`.claude/worktrees/agent-a0563f58b54243f6f` ו-`.claude/worktrees/agent-afbe3abebb3d5763b` אם אתה רוצה להציץ לפני שאני ממזג) — אתה לא צריך לחכות להם או לגעת בהם.

## המשימה שלך:

1. **בדיקה ויזואלית על device/simulator אמיתי** — אני לא הרצתי סימולטור מובייל אמיתי, רק typecheck (`npx tsc --noEmit` נקי, 0 שגיאות). תבדוק בפועל:
   - מסך הפתיחה (SplashReveal) — במיוחד עם build נייטיבי (לא Expo Go, כי ה-`expo-splash-screen` plugin דורש prebuild) שהמעבר בין ה-splash הנייטיבי לאנימציה חלק ולא מהבהב.
   - `MatchCelebrationModal` בזרימה האמיתית: `intro-detail.tsx` → "התחלנו לעבוד יחד!" → בחירת מדדים → אישור. תוודא ה-RTL של הטקסט וה-confetti נראים טוב.
   - `SuccessCheck` בכמה מהמסכים שקוראים ל-`showSuccess()` (שמירת יומן יומי, העלאת מסמך).
   - `BrandSpinner`/`EmptyState` בכמה מסכי staff.
2. **לוודא שה-sweep-ים (אחרי שאמזג) לא שברו כפתורים** — הכלל ששלחתי לסוכנים: לא לגעת ב-`ActivityIndicator` שבתוך כפתור/pressable (`components/ui/Form.tsx` לא היה אמור להיות בכלל ברשימה שלהם, אבל שווה עין).
3. אם יש מסכי empty-state שדילגתי עליהם (יש עוד כמה i18n keys כמו `todayNoCheckins`, `aiEmpty`, `profileViewsEmpty` שלא הגעתי אליהם) — תרגיש חופשי להשלים לפי אותה תבנית (`EmptyState variant="compact"`).

> *אני ממשיך לעקוב אחרי שני ה-sub-agents ואמזג כשיסיימו — תתחיל מסעיף 1 (בדיקה ויזואלית) כבר עכשיו על מה שכבר קיים.*
