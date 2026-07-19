# 🗺️ תוכנית הטמעה מלאה — 41 מסכי Stitch → אפליקציית Together

> **מחבר:** ארכיטקט · **תאריך:** 2026-07-19 · **סטטוס:** טיוטה לאישור בעל המוצר
> **מקור עיצוב:** `stitch-screens/stitch_together_design_system/` (41 מסכים, "Warm Professionalism", RTL עברית, Tailwind+Rubik+Material Symbols)
> **מקורות אמת מחייבים:** `product/05-SCREENS.md` (מפרט מסכים) · `product/01-DECISIONS.md` (D1–D57) · `product/11-BUSINESS-PLAN.md` (שער Q4) · `product/10-ADMIN-SPEC.md` · `ARCHITECTURE_REVIEW.md`
> **מוסכמת ביצוע:** Antigravity=backend (RPC/RLS/migrations) · Cursor=mobile UI · ארכיטקט=תכנון+ביקורת+אימות מול קוד חי.

---

## 0. תמצית מנהלים

**האפליקציה כבר בנויה ברובה.** רוב 41 מסכי ה-Stitch כבר קיימים כ-routes ממומשים ב-`apps/mobile/app/` (Expo Router). מסכי ה-Stitch הם **שכבת עיצוב היעד** ("Warm Professionalism") שצריך להחיל על מסכים קיימים, לא בנייה מאפס.

לכן התוכנית היא **3 סוגי עבודה**, לא "לבנות 41 מסכים":
1. **Re-skin** — החלת עיצוב Stitch על route קיים ועובד (רוב המסכים).
2. **Gap-fill** — השלמת פונקציונליות חסרה במסך קיים לפי `05-SCREENS.md` + `09-DoD`.
3. **New** — מעט מסכים/מצבים חדשים.

**שני מסכי Stitch מסומנים 🔴 ואין לבנותם כפי שהם** — הם סותרים החלטות מוצר סופיות (ראו §5).

**שערי-על שלא זזים** (מ-`together-project-state`, `11-BUSINESS-PLAN`, DECISIONS): אין תשלומים לפני שער Q4 · אין צ'אט (D9) · אין בינה מלאכותית חיצונית (D30) · פרטיות מדורגת TIER 0–3 ב-RLS · הגנת צילום-מסך על תיק ילד (D44) · הסרת סיסמת `admin123` לפני בטא (D50/WP11§0) · אין פתיחה לציבור בלי גיבוי (חוסם פתוח במודע — לא להזכיר).

---

## 1. מיפוי מלא: 41 מסכי Stitch → מסך קנוני → route → סטטוס

> סטטוס: **✅ route קיים** (קובץ ממומש, דורש בעיקר re-skin+gap-check) · **🟡 חלקי** · **🆕 חדש** · **🔴 סותר החלטה**.

### כניסה ואימות
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 1 | `login_screen` | S-AUTH-01 | `(auth)/login.tsx` | ✅ |
| 2 | `verify_otp` | S-AUTH-02 | `(auth)/verify-otp.tsx` | ✅ |
| 3 | `forgot_password` | — | `(auth)/forgot-password.tsx` | ✅ |
| 4 | `reset_password` | — | `reset-password.tsx` | ✅ |
| 5 | `role_selection_1` | S-AUTH-03 | `(auth)/role-select.tsx` (מצב: טרם נבחר) | ✅ |
| 6 | `role_selection_2` | S-AUTH-03 | `(auth)/role-select.tsx` (מצב: משלבת נבחרה) | ✅ |
| 7 | `welcome_guide` | — | `how-to-use.tsx` | ✅ |

### הורה — אונבורדינג ילד
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 8 | `onboarding_questionnaire` | S-PAR-10 (מיכל) | `(auth)/onboarding.tsx` + `components/onboarding/` | 🟡 ליישר ל-P-02 (6 צעדים) |
| 9 | `child_onboarding_step1_intro` | S-PAR-10 · צעד 1 | onboarding | 🟡 |
| 10 | `child_onboarding_step2_school` | S-PAR-10 · צעד 2 | onboarding | 🟡 |
| 11 | `child_onboarding_step3_needs` | S-PAR-10 · צעד 3 | onboarding | 🟡 (משפט הרגעה לפני צעד 4) |
| 12 | `child_profile_noam` | S-PAR-09 | `(parent)/child-details.tsx` · `(tabs)/child-profile.tsx` | ✅ |

### הורה — בית, התאמות, בקשות
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 13 | `matches_feed` | S-PAR-01 | `(parent)/(tabs)/index.tsx` | ✅ |
| 14 | `no_matches_empty` | S-PAR-01 · empty | ↑ מצב ריק | ✅ |
| 15 | `match_detail_michal_levi` | S-PAR-02 | `(parent)/match-detail.tsx` | ✅ |
| 16 | `match_requests_1` | S-PAR-04 | `(parent)/(tabs)/requests.tsx` | ✅ |
| 17 | `match_requests_2` | S-PAR-04 · interested+מכתב | ↑ מצב | ✅ |
| 18 | `no_requests_empty` | S-PAR-04 · empty | ↑ מצב ריק | ✅ |
| 19 | `intro_details_dana` | S-PAR-06 | `(parent)/intro-detail.tsx` | ✅ |
| 20 | `info_disclosure_consent` | S-PAR-05 | sheet מעל requests / `match-permissions` | ✅ לאמת RPC `approve_request` |
| 21 | `started_working_together_success` | S-PAR-06 · הצלחה | `MatchCelebrationModal` (motion) | ✅ |

### הורה — עבודה משותפת (active-match)
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 22 | `daily_report_detail_noam` | S-PAR-07 · כרטיס יום | `(active-match)/daily-log-detail.tsx` | ✅ |
| 23 | `progress_report_noam` | WP13 / D53 | `(parent)/progress-report.tsx` | ✅ |
| 24 | `noam_profile_viewers` | S-PAR-07/08 · "מי צפה" | `ProfileViewsCard` | ✅ (רכיב) |
| 25 | `what_dana_sees_access` | S-PAR-08 | `(parent)/match-permissions.tsx` | ✅ |
| 26 | `leave_review` | S-SHARED-01 | `(active-match)/review.tsx` | ✅ (עיוור D14) |

### משלבת
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 27 | `home_feed_chen` | S-PRO-01 | `(professional)/index.tsx` | ✅ |
| 28 | `aide_dashboard` | S-PRO-01/06 | `(professional)/index.tsx` | ✅ |
| 29 | `aide_daily_schedule` | S-PRO-06 "היום שלי" | `(professional)/today.tsx` | ✅ |
| 30 | `aide_verification` | S-PRO-03 | `(professional)/pending.tsx` | ✅ |
| 31 | `profile_under_verification` | S-PRO-03 · מצב | `(professional)/pending.tsx` | ✅ |
| 32 | `my_documents` | S-PRO-02 | `(professional)/documents.tsx` | ✅ |
| 33 | `upload_required_documents` | S-PRO-02 · העלאה | ↑ מצב | ✅ |
| 34 | `edit_professional_profile` | S-PRO-08 | `(professional)/profile.tsx` | ✅ (חובה תמונה F-01) |
| 35 | `professional_profile_chen` | S-PRO-08 · תצוגה ציבורית | תצוגת פרופיל (=S-PAR-02 מצד הורה) | ✅ |
| 36 | `fill_daily_report_noam` | S-PRO-07 | `(active-match)/daily-log-form.tsx` | ✅ (≤60ש׳ D11) |
| 37 | `user_profile_chen` | S-PRO-08 / משותף | profile / settings | ✅ |

### משותף / הגדרות
| # | מסך Stitch | קנוני | Route | סטטוס |
|---|-----------|-------|-------|-------|
| 38 | `settings_main` | S-SHARED-02 | `settings.tsx` | ✅ |
| 39 | `notification_settings` | S-SHARED-02 · התראות | חלק מ-`settings.tsx` (מטריצת PRODUCT_UX §6) | 🟡 לאמת פר-קטגוריה + D46 |

### 🔴 סותרים החלטת מוצר — לא לבנות כפי שהם (ראו §5)
| # | מסך Stitch | קונפליקט |
|---|-----------|----------|
| 40 | `messages_inbox` | **D9 — אין צ'אט/הודעות בכלל.** "אף סוכן לא בונה תשתית messages." |
| 41 | `search_aides` ("חיפוש משלבות") | מודל המוצר הוא **התאמות מסודרות** (S-PAR-01), לא חיפוש חופשי. טעון הכרעה. |

**איורים (6 תיקיות, תמונה בלבד — נכסים, לא מסכים):** empty-state, celebration, magnifying-glass, verification, how-to-use, logo, `warm_professionalism` (טוקני עיצוב). → משמשים כ-assets ברכיבי `EmptyState`/`motion` הקיימים.

---

## 2. יסודות רוחביים (Foundation) — לפני מסכים בודדים

לפני re-skin פרטני, לוודא שכל המסכים יושבים על אותה שכבת עיצוב. אלה קודמים לכל מסך:

1. **טוקני "Warm Professionalism"** — לחלץ מ-`warm_professionalism` + מ-`code.html` (הפלטה כבר קיימת ב-RPC: `surface #fcf8ff`, primary purple `#534ab7`/`#584fbc`, secondary teal `#086b53`, tertiary `#824e00`, error `#ba1a1a`…). למקם ב-`packages/` / `apps/mobile/lib/constants` כמקור יחיד; NativeWind theme + `components/ui` (Button/Card/Badge/Avatar).
   - ⚠️ **חוב ידוע (מהלוח):** `components/ui/Avatar/Badge/Button/Card.tsx` תלויים ב-`tailwind-variants` שלא מותקן ושובר `tsc`. **להתקין או להסיר את התלות לפני כל commit.**
2. **טיפוגרפיה:** Rubik (קיים בקיט המובייל) — לוודא התאמה למשקלים ב-Stitch (300/400/500/700).
3. **RTL + i18n:** כל מחרוזת דרך `i18n/locales` (he/en) — אין טקסט קשיח. Stitch כבר `dir="rtl" lang="he"`.
4. **מצבי-חובה לכל מסך** (חוק רוחבי 05-SCREENS §6): loading=skeleton · empty=תבנית 3 חלקים (`EmptyState`) · error+retry · offline=banner+תור כתיבה. אלה **לא** מגיעים מ-Stitch (Stitch מצייר מצב "מלא" בלבד) — חובה להוסיף לכל מסך.
5. **ערכת אנימציה** (`components/motion/`) — כבר בנויה (BrandSpinner, SplashReveal, MatchCelebrationModal, SuccessCheck). לחבר לנקודות ה-re-skin.
6. **Material Symbols → אייקונים:** Stitch משתמש ב-Material Symbols; למפות לספריית האייקונים של המובייל (לא לטעון font חיצוני בנייטיב).

**קריטריון סיום ליסודות:** מסך אחד לדוגמה (login) מומר מלא לטוקנים החדשים, `tsc --noEmit` נקי, ואושר ויזואלית ע"י בעל המוצר — ואז ממשיכים לשאר.

---

## 3. תוכנית פר-זרימה (עם פונקציונליות מלאה)

לכל מסך: (א) re-skin לפי Stitch, (ב) לוודא את הפונקציונליות מ-`05-SCREENS.md`, (ג) לאמת RPC/RLS/Realtime, (ד) מצבי-חובה, (ה) `09-DoD`.

### 3.1 אימות ואונבורדינג
- **S-AUTH-01/02/03:** re-skin. ולידציית טלפון ישראלית (`lib/phone`), OTP 6 ספרות auto-submit + resend 30ש׳, בחירת תפקיד כותבת role ומנתבת. **בדיקת קבלה:** אין navigation לפני OTP; אחרי onboarding אין חזרה.
- **S-PAR-10 (אונבורדינג ילד, 3 מסכי Stitch):** ליישר ל-6 צעדי P-02, progress bar, **שמירת טיוטה אחרי כל צעד** (נטישה→חזרה מאותו צעד), משפט הרגעה לפני צעד רגיש (צרכים/אבחנה), מסך פרסום D6 בסוף. `published` נכתב רק מהמסך הייעודי.
- **welcome_guide/how-to-use:** re-skin בלבד.

### 3.2 הורה — התאמות ובקשות
- **S-PAR-01 (matches_feed):** כותרת "המשלבות שמתאימות ל{childName}" + בורר ילדים. כרטיס: תמונה, שם+מאומתת✓, תגית D3, מרחק "~X ק"מ", ניסיון, הסבר תאימות מה-cache. **אין ציון מספרי בשום מקום.** מצבים ריקים: אין-משלבות→waitlist+מתג push · אין-ילד→onboarding · מכסה מלאה D7→banner.
- **S-PAR-02 (match_detail):** פרופיל מלא, דירוג D4 (רק אם ≥3 ביקורות) + ביקורות. CTA "שלח/י בקשת היכרות" או סטטוס בקשה קיים. **אין פרטי קשר בשום שדה** (גם אם בביו).
- **S-PAR-03 (sheet שליחה):** TierDisclosureSheet "מה ייחשף" (TIER 1) → הודעה אישית ≤300 → RPC. אכיפת D7; double-tap לא שולח פעמיים.
- **S-PAR-04 (requests, 2 מצבי Stitch):** StatusPill · interested→LetterCard מלא + "אשר/י והמשיכו" / "לא מתאים" · Realtime · בקשת browse של משלבת מופיעה כ"{proName} הביעה עניין…".
- **S-PAR-05 (info_disclosure_consent):** גילוי מלא + אישור מפורש → RPC `approve_request`. אין אישור בלי לראות רשימת חשיפה.
- **S-PAR-06 (intro_details + success):** טלפון גדול + חיוג/וואטסאפ (TIER 2, D9 — זו החלופה לצ'אט) + "התחלנו לעבוד יחד 🎉"/"לא התאים".

### 3.3 הורה — עבודה משותפת
- **S-PAR-07 (active-match + daily-log-detail):** ראש=סטטוס היום · פיד יומן (כרטיס/יום: מצב רוח, מדדים, סיכום **תבניתי-דטרמיניסטי** D30) · TrendChart (לא לפני 3 ימים) · קישורים ל-S-PAR-08 ו-"מי צפה". יום ללא שאלון=כרטיס שקט; סיכום שטרם נוצר="בהכנה".
- **progress_report (WP13/D53):** מספרים בלבד, **בלי אבחנה**, פר-match: ימי נוכחות (check-ins is_valid, אזור זמן Asia/Jerusalem), ימי חופש (D46 שורה נפרדת), ספירת דיווחים, ממוצע מצב רוח, דליים שבועיים. `report_version:1`. הרשאה: parent_id **או** secondary_parent_id (D31).
- **S-PAR-08 (what_dana_sees / match-permissions):** מתגים פר-שדה (WP8) · השהה גישה (paused) · סיום (ended+reason, פותח דירוג אחרי 24ש׳). revoke משתקף מיידית ב-Realtime.
- **noam_profile_viewers:** `ProfileViewsCard` בראש S-PAR-07/08.

### 3.4 משלבת
- **S-PRO-03 (aide_verification / profile_under_verification):** מסך בית זמני — progress, "עד 2 ימי עסקים", הצעות בינתיים. ניווט לילדים/בקשות **חסום**. אימות מרחוק (Realtime/push) מחליף בלי restart.
- **S-PRO-02 (my_documents / upload_required_documents):** checklist 3 מסמכים + סטטוס פר-מסמך + העלאה (מצלמה/קובץ, דחיסה). ל-bucket **פרטי בלבד**. נדחה→סיבה+"העלי מחדש".
- **S-PRO-01 (home_feed_chen / aide_dashboard):** כרטיס בקשה F-04, נתוני ילד **אך ורק מה-RPC המדורג** (אחרי C2), בלי אבחנה מלאה. ריק→תבנית 3 חלקים + הפניה ל-browse.
- **S-PRO-04 (מכתב היכרות):** פרומפט + דוגמה מתקפלת + מונה 100–500 → RPC `respond_to_request`. טיוטה נשמרת; אי אפשר לשלוח ריק.
- **S-PRO-06 (aide_daily_schedule / today):** כרטיס פר-match: בוקר "הגעתי" (CTA ענק, בקשת מיקום D22) · אחה"צ "איך היה?". geofence-fail→retry בלי checkin שגוי; offline→כפתור מנוטרל.
- **S-PRO-07 (fill_daily_report):** מצב רוח (5 אימוג׳י חובה) → ≤3 סליידרים → הערה → שליחה. **≤60 שניות** (D11). upsert, רטרואקטיבי 48ש׳.
- **S-PRO-08 (edit/professional_profile / user_profile):** תמונה חובה (F-01), ביו מונחה, זמינות שבועית ויזואלית. אי אפשר submit בלי תמונה+התמחות+זמינות.
- **S-PRO-09 (תיק הילד למשלבת):** נגיש מ-today → "תיק {childName}". קריאה יחידה `get_child_details(match_id)`, מציג רק שדות שאינם NULL (D45 — לא רומז שהוסתר). **הגנת צילום מסך D44** (`usePreventScreenCapture` / `useScreenshotProtection`). ⚠️ מפרט מציין שזה היה פער — לוודא שקיים קורא בצד המשלבת.

### 3.5 משותף
- **S-SHARED-01 (leave_review):** 3 קריטריונים כוכבים + טקסט, **עיוור D14** (נחשף כששני הצדדים דירגו).
- **S-SHARED-02 (settings_main / notification_settings):** שפה he/en · התראות פר-קטגוריה (מטריצת PRODUCT_UX §6, כולל D46 חופשות) · פרטיות (מחיקת חשבון — אישור כפול, `anonymize_user`) · אודות/קשר.
- **S-SHARED-03 (NextActionCard, WP17):** כרטיס "מה עכשיו?" בראש בתי הבית — כבר בעבודה (WP17 שלב ב/ג pending). לחבר לעיצוב Stitch.

### 3.6 סטטף / אדמין (web-only)
- מסכי Stitch לא כוללים אדמין — אלה נשארים `(staff)/*` (קיימים: dashboard, verification, users, children, matches, audit, ops, analytics, config). **פער ידוע:** קבוצת `(admin)` ריקה (_layout בלבד); ניתוב role='admin' חוזר ל-role-select. **החלטה נדרשת:** לאחד `(admin)`↔`(staff)` או לממש D23 (אזור admin ב-Expo web). לא חלק מ-re-skin ה-Stitch.

---

## 4. שכבת Backend — מה כבר קיים ומה לאמת

רוב ה-RPC/RLS קיימים (C1–C3/H1 נסגרו, D14/D27/D28/D30/D31/D45 מומשו — אומת 2026-07-12/13). לכל מסך, לאמת מול קוד חי (לא מול הלוח — יש דפוס "הושלם" כפול שלא נכנס לקוד):

- **RPCs מרכזיים לאמת קורא באפליקציה:** `approve_request`, `respond_to_request`, `get_child_details`, `get_child_progress_report`, `anonymize_user`, מנוע ההתאמה (cache הסבר-תאימות).
- **RLS/פרטיות:** TIER 0–3, WP8 field toggles (`manage_visibility`), D31 הורה שני.
- **חוסמים שלא נסגרים בקוד:** admin123 (D50) · אין גיבוי (החלטת מוצר — לא להזכיר) · בדיקת עברייני מין (חוק תשס"א-2001, טעון עו"ד) · הסכמת מידע רגיש (תיקון 13, אוגוסט 2025) · גישת הורה נוסף — לפני פתיחה לציבור.

---

## 5. ✅ שני מסכי Stitch שסתרו החלטות — הוכרעו (בעל המוצר, 2026-07-19)

Stitch (Gemini) ייצר שני מסכים שסתרו החלטות מוצר. בעל המוצר הכריע:

1. **`messages_inbox` — ❌ לא נבנה. מכבד D9 ("אין צ'אט. בכלל").**
   התקשורת נשארת TIER 2 → חיוג/וואטסאפ אחרי היכרות. המסך מוסר מההיקף; אין לבנות תשתית messages. (מחזק את D9 הקיימת — אין החלטה חדשה נדרשת.)

2. **`search_aides` — ✅ פילטרים על ההתאמות (S-PAR-01), לא קטלוג חופשי.**
   לממש כשכבת פילטרים (עיר/התמחות/זמינות) מעל מסך ההתאמות הקיים, בלי לשבור את מודל האוצרות (אין ציון, אין קטלוג חופשי). → **החלטה חדשה לרישום כ-D ב-01-DECISIONS.**

---

## 6. סדר ביצוע מוצע (גלים)

**היקף שהוכרע (2026-07-19):** כל 39 המסכים (למעט `messages_inbox` שהוסר) בגל הראשון — re-skin מלא + פונקציונליות מלאה לפני בטא. הגלים G0–G4 הם **סדר הביצוע** בתוך ההיקף הזה, לא צמצום היקף. מיושר לעבודה הקיימת בלוח (WP12–WP17 בתהליך). ה-re-skin משתלב, לא מחליף.

| גל | תוכן | בעלים | תלות |
|----|------|-------|------|
| **G0 — יסודות** | טוקני Warm Professionalism + `components/ui` (תיקון `tailwind-variants`) + מסך login לדוגמה מלא | Cursor + ארכיטקט | פותח הכל |
| **G1 — נתיב קריטי הורה** | S-AUTH-01/02/03, S-PAR-10 (אונבורדינג), S-PAR-01, S-PAR-02, S-PAR-04, S-PAR-05, S-PAR-06 | Cursor | G0 |
| **G2 — נתיב קריטי משלבת** | S-PRO-03, S-PRO-02, S-PRO-01, S-PRO-04, S-PRO-08, S-PRO-09 | Cursor + Antigravity (RPC) | G0 |
| **G3 — עבודה משותפת** | S-PAR-07, S-PAR-08, S-PRO-06, S-PRO-07, progress_report (WP13), leave_review | שניהם | G1+G2 |
| **G4 — שימור וליטוש** | WP12/14/15/16, NextActionCard (WP17 ב/ג), settings+התראות, `search_aides`=פילטרים על S-PAR-01 | שניהם | G3 |
| **G5 — פתוח יחיד** | איחוד admin/staff (D23) — לא חלק מ-re-skin ה-Stitch | בעל המוצר → ארכיטקט | אחרי הכרעה |

**שער בין גלים:** `tsc --noEmit` נקי · `npm run test:navigation` ירוק · אימות ויזואלי של בעל המוצר על device (לא ניתן מ-Cursor) · אימות ארכיטקט מול קוד חי לפי `09-DoD`.

---

## 7. Definition of Done פר-מסך (תמצית מ-09-DoD)

מסך נחשב "בוצע" רק כאשר: re-skin תואם Stitch · כל 4 מצבי-החובה קיימים · אין טקסט קשיח (i18n) · RTL תקין · CTA ראשי אחד · פעולה הרסנית אינה כפתור ראשי · pull-to-refresh+pagination ברשימות · RPC/RLS אומתו מול קוד חי · אין ציון מספרי בהתאמות · אין פרטי קשר לפני TIER 2 · הגנת צילום-מסך היכן שנדרש (D44) · `tsc` נקי · אושר ויזואלית.

---

## 8. הכרעות בעל המוצר (2026-07-19) + פתוח שנותר

**הוכרע:**
1. ✅ **`messages_inbox`** — לא לבנות (מכבד D9). הוסר מההיקף.
2. ✅ **`search_aides`** — פילטרים על S-PAR-01 (לרישום כ-D חדשה).
3. ✅ **היקף** — כל 39 המסכים בגל הראשון (לא רק נתיב קריטי).

**נותר פתוח (לא חוסם את G0–G4):**
4. **admin/staff** — לאחד ל-`(staff)` הקיים, או לממש `(admin)` נפרד (D23)? — הכרעה נדרשת לפני G5.

**צעדי המשך מיידיים לארכיטקט:** לרשום את החלטת `search_aides` כ-D ב-`01-DECISIONS.md`, לפרסם בריף G0 ל-Cursor (יסודות + `tailwind-variants`), ולעדכן את `COORDINATION_BOARD.md`.
