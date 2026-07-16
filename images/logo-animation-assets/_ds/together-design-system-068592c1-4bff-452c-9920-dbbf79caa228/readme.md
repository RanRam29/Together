# Beshiluv Design System

**בשילוב** (Beshiluv, "In Integration/Together") — tagline **תמיכה, שילוב, קהילה** ("support, integration, community") — is a mobile-first marketplace that matches parents of children with special needs to vetted professional aides ("**משלבות**" — integration aides / 1:1 shadow-teachers) for schools, kindergartens and daycare settings in Israel. Parents post a (privacy-tiered) profile of their child; verified aides browse or get matched; both sides go through an introduction → mutual-approval flow before any sensitive detail or contact info is shared; once working together, the aide does GPS check-ins and daily pedagogical logs that roll up into progress reports for the parent. A staff/admin surface handles aide verification, user support and platform analytics.

This design system was originally reverse-engineered from a GitHub codebase (product name "Together" / תמיד ביחד) and was then rebranded to **בשילוב** using a real logo and visual reference the user provided (a Google Stitch mockup). The rebrand introduced: the real logo (`assets/logo.png`), a plum/slate-blue/teal palette sampled from that logo (replacing the original purple/teal), real photo avatars (with initials-avatar fallback) on match/request/letter cards, direct percentage match badges, and a Messages/notifications surface — several of these intentionally diverge from the original codebase's documented decisions (no photos, no numeric score, minimal notifications), which are noted inline below where still relevant as *prior-state* context.

## Sources

- GitHub repo: [RanRam29/Together](https://github.com/RanRam29/Together) (branch `main`) — read in full for this design system: `apps/mobile/tailwind.config.js`, `apps/mobile/lib/theme.ts`, `apps/mobile/components/**`, `apps/mobile/app/**`, `apps/mobile/i18n/locales/he.json`, `apps/mobile/app.json`, and the product dossier under `product/` (personas, screen specs, copy/tone guide, business plan) and `docs/` (architecture, security, auth).
- Explore the repo further for anything not covered here — RLS/auth details, the Supabase schema, the full screen-by-screen spec (`product/05-SCREENS.md`), and the admin/staff surfaces this system only partially covers.

## Components

Organized by concern under `components/<group>/`. Each is a standalone `.jsx` + `.d.ts` + `.prompt.md`, one design-system card per directory.

**forms/** — `Button` (solid/outline, purple/teal/coral tones), `TextField` (labeled input w/ error + password toggle), `OtpInput` (6-digit SMS code)

**selection/** — `ChipSelect` (single-select pill group, purple), `MultiChipSelect` (multi-select pill group, teal), `SwitchToggle` (toggle, bare or as a labeled settings row)

**feedback/** — `Badge` (status/quality/SLA pill in 5 tones), `StarRating` (5-star input/display), `Banner` (teal active-match banner, amber offline strip)

**cards/** — `Card` (base bordered surface), `PlaceholderCard` (empty/error state), `MetricCard` (dashboard stat tile), `MatchCard` (parent's aide-discovery card), `LetterCard` (celebratory intro-letter card), `RequestCard` (aide's incoming-request card)

**layout/** — `ScreenHeader` (eyebrow/title/subtitle header), `RoleCard` (big selectable choice card), `ChildSelector` (horizontal child-switcher chips)

### Coverage note

The source codebase defines ~45 components across `apps/mobile/components/{ui,shared,parent,professional,admin,active-match,onboarding}/`. This system covers the general-purpose primitives (above) plus the two most representative screen-card families (Match/Letter/Request). It does **not** yet have dedicated primitives for the admin/staff surface (`AdminMfaModal`, `FunnelChart`, `DocumentViewer`, `StaffNav`, `VerificationChecklist`, …) or the active-match daily-log widgets (`MoodPicker`, `MetricStepper`, `TrendChart`, `CheckinCard`, …) — **ask if you'd like these built out**; the repo has full source for all of them.

## UI Kits

- **`ui_kits/parent-app/`** — login → OTP → role select → home (matches feed with LetterCard + MatchCard + child switcher) → child profile tab → requests tab.
- **`ui_kits/professional-app/`** — pending-verification screen → home (incoming RequestCard + active-match banner) → browse tab → documents tab.

Both are click-through recreations composed entirely from the components above; the admin/staff web surface was not built as a third kit (see Coverage note) — ask if you'd like it added.

## Content Fundamentals

Hebrew (RTL) is the source language (English is a secondary locale); every string lives in `i18n/locales/he.json` behind `screen.element.state` keys — never hardcoded.

- **Warm but not saccharine.** "נמצא יחד את המשלבת המתאימה" (we'll find the right aide together) ✓ — "אנחנו כאן בשבילך במסע הקשה" (we're here for you on this hard journey) ✗ — reads as condescending.
- **The child's name everywhere.** Copy says "המשלבות שמתאימות לנועם" (aides matching Noam), never "the child." Interpolated names ({childName}, {proName}) are always parameters, never string-concatenated, so gender/plural agreement in Hebrew doesn't break.
- **Second person, gender-aware.** Parents get gender-neutral phrasing ("שלחו בקשה"); aides default to feminine grammatical gender (reflecting the field's real demographics) with a neutral fallback when a user is tagged "משלב" (male aide).
- **Never blame the user.** "לא הצלחנו לשמור — ננסה שוב?" (we couldn't save — try again?) ✓, never "שגיאה: קלט לא תקין" (error: invalid input) ✗.
- **Professional respect for aides.** "את מגיבה לבקשה" (you're responding to a request) not "נבחרת" (you were chosen); a declined aide reads "לא זמינה כרגע" (not available right now), never "נדחית" (rejected).
- **No jargon in front of users.** Internal terms TIER 0/1/2/3, match, RLS, geofence, verified never appear as-is — see the internal→user-facing glossary in `product/06-COPY-TONE.md` (e.g. TIER 2 → "שלב ההיכרות", geofence → not shown at all, only its failure copy is).
- **Emoji: rare, load-bearing only.** Two confirmed uses in the whole product: "התחלנו לעבוד יחד! 🎉" (celebration on match activation) and "אשמח להכיר 💜" (an aide's browse-card interest CTA). Not used decoratively elsewhere.
- **Empty states are always 3 parts:** what's the state (one sentence) → what you can do about it (one sentence) → one action button. Same shape for error states, but paired with a retry action instead.
- **Sensitive-action confirmations** state what will happen and what becomes visible, then a verb-phrased primary button ("אשר/י והמשיכו להיכרות" — approve and continue to introduction) — never a bare "are you sure?".

## Visual Foundations

- **Palette:** a warm off-white paper background (`#FBFAF7`, never pure white) with white/`#F4F2EC` surfaces, ink-brown text (not black: `#24221E`/`#5F5C55`/`#918D84`), and four semantic accents each with a DEFAULT/bg/ink triplet — **purple** (`#534AB7`, primary brand action — buttons, links, selected chips), **teal** (`#0F6E56`, verified/active/positive), **amber** (`#BA7517`, pending/SLA-warning), **coral** (`#D85A30`, destructive/error only — never a primary CTA color).
- **Type:** Rubik (400/500/700) is the only typeface — humanist sans with excellent Hebrew glyph support, no serif or mono anywhere in the UI. Six sizes cover the whole app, 30px down to 12px; the type is comfortably large for a caregiving context, never below 12px even for meta text.
- **Spacing:** a strict 4px scale (4–64px). No idiosyncratic in-between values found in source.
- **Backgrounds:** flat color only. No photography, no illustration, no gradients, no repeating patterns or textures anywhere in the product — this is a deliberately calm, low-stimulation surface for a stressed audience (parents of kids with high support needs).
- **Corner radii:** exactly two — a single deliberate "card" radius (14px, used for every card/button/input) and full pills (chips, badges, avatars). No 4px/8px/full-only "in-between" radii exist in source.
- **Cards:** 1px solid border (`#E5E2DA`) + 14px radius + flat white/cream fill. **No drop shadows anywhere** — the border is the only definition device; elevation as a concept doesn't exist in this system. The one exception is a 2px purple border on the celebratory LetterCard.
- **Shadows:** effectively none in the product UI; reserve a soft shadow only for true overlays (modals/sheets), never for resting cards.
- **Buttons:** solid fill for primary actions (purple default, teal for accept/positive), full-bleed border-only for secondary/cancel actions. Disabled and loading both render as 60% opacity — loading additionally swaps the label for a spinner, never both at once.
- **Hover/press states:** the mobile app has no hover (touch-first); press state is a hard opacity drop to ~90% (`active:opacity-90`) plus a light haptic tick, and on native a subtle spring scale-down to 0.97. No color-shift or shrink-to-nothing effects. Chips/switches follow the same opacity-drop convention.
- **Animation:** intentionally minimal and functional — card entrances stagger in with a gentle fade+slide-up (spring, damping 18, ~80ms stagger per row), and exactly one animation is used for delight: the LetterCard "someone's interested" card zooms in with a success haptic. No looping/decorative animation; everything respects `prefers-reduced-motion`.
- **Transparency/blur:** almost never used — the sole instance is a translucent white pill (`bg-white/20`) for the action button sitting on top of the solid teal active-match banner, for contrast without a shadow.
- **Layout rules:** one primary CTA per screen; destructive actions are never the primary button; every list is pull-to-refresh + paginated; every screen has defined loading (skeleton, not a spinner), empty, error and offline states.
- **RTL:** Hebrew is right-to-left; bidirectional content (times, numbers, foreign names) is wrapped LTR inline; directional icons (chevrons/back) flip with direction, emoji and numerals do not.

## Iconography

The app uses **Ionicons** (`@expo/vector-icons`, `Ionicons` set) exclusively for UI chrome — outline style throughout (settings-outline, people-outline, person-outline, mail-outline, chevron-forward/back, eye-outline/eye-off-outline). No custom icon font, no SVG icon library, and no PNG icon sprite exists in the codebase. Tab bar icons and header action buttons are the only icon usage; everything else (status, quality, category) is communicated with text/color badges instead of icons. Emoji is used only in the two load-bearing copy strings noted above (🎉, 💜) — never as a substitute for an icon or as decoration.

**Substitution flag:** since Ionicons isn't bundled here, this system's card/kit HTML uses plain-text/unicode stand-ins (⚙, ‹) for the couple of icon instances shown. For production work, link Ionicons (or its web equivalent, e.g. the `ionicons` npm/CDN package) directly — same outline style, same glyphs (`settings-outline`, `chevron-back/forward`, `eye-outline`, `eye-off-outline`, `people-outline`, `person-outline`, `mail-outline`).

## Brand Assets

**A logo now exists** (user-provided): three linked figures — purple, slate-blue, teal — over the wordmark "בשילוב" and tagline "תמיכה, שילוב, קהילה", transparent background. Saved to `assets/logo.png`; shown in `guidelines/brand-wordmark.card.html` and `guidelines/brand-assets-note.card.html`, and placed in both UI kit headers.

Earlier note (superseded): no logo existed in the source GitHub repo — `assets/icon.png` (blue "A" mark) and `assets/logo-glow.png` (soft blue glow) were generic Expo-scaffold assets, not brand marks, and are no longer used as such.


## Index

```
styles.css                     — root stylesheet (@import list only)
tokens/
  colors.css                   — neutrals + purple/teal/amber/coral triplets
  typography.css               — Rubik font-face + type scale
  spacing.css                  — 4px spacing scale + radii + shadow tokens
components/
  forms/        Button, TextField, OtpInput
  selection/    ChipSelect, MultiChipSelect, SwitchToggle
  feedback/     Badge, StarRating, Banner
  cards/        Card, PlaceholderCard, MetricCard, MatchCard, LetterCard, RequestCard
  layout/       ScreenHeader, RoleCard, ChildSelector
guidelines/
  colors-*.card.html           — neutrals, purple, teal, amber, coral swatches
  type-*.card.html             — type scale, weights
  spacing-*.card.html          — spacing scale, corner radii
  brand-*.card.html            — wordmark, asset note
ui_kits/
  parent-app/                  — Parent product click-through
  professional-app/            — Aide product click-through
assets/
  logo-glow.png, android-icon-background.png  — decorative assets found in repo
SKILL.md                       — Claude Code / Agent Skills-compatible entry point
```
