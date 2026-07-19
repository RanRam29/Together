---
name: Warm Professionalism
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e2'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fc'
  surface-container: '#f0ecf6'
  surface-container-high: '#ebe6f0'
  surface-container-highest: '#e5e1eb'
  on-surface: '#1c1b22'
  on-surface-variant: '#474553'
  inverse-surface: '#312f37'
  inverse-on-surface: '#f3eff9'
  outline: '#787584'
  outline-variant: '#c8c4d5'
  surface-tint: '#584fbc'
  primary: '#3b309e'
  on-primary: '#ffffff'
  primary-container: '#534ab7'
  on-primary-container: '#d1ccff'
  inverse-primary: '#c5c0ff'
  secondary: '#086b53'
  on-secondary: '#ffffff'
  secondary-container: '#a0f3d4'
  on-secondary-container: '#167159'
  tertiary: '#623900'
  on-tertiary: '#ffffff'
  tertiary-container: '#824e00'
  on-tertiary-container: '#ffc78c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c5c0ff'
  on-primary-fixed: '#140067'
  on-primary-fixed-variant: '#3f35a3'
  secondary-fixed: '#a0f3d4'
  secondary-fixed-dim: '#84d6b9'
  on-secondary-fixed: '#002117'
  on-secondary-fixed-variant: '#00513e'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#fcf8ff'
  on-background: '#1c1b22'
  surface-variant: '#e5e1eb'
typography:
  display-lg:
    fontFamily: Rubik
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: Rubik
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Rubik
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Rubik
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Rubik
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Rubik
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Rubik
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 12px
---

## Brand & Style

The design system is centered on trust, empathy, and professional reliability. It caters to families seeking specialized care and aides providing essential services. The visual narrative balances the emotional weight of caregiving with the efficiency of a high-end marketplace.

The style is **Warm Minimalism**. It utilizes a tactile, paper-like foundation to feel grounded and organic, avoiding the sterile coldness of typical medical apps. The interface remains calm through generous whitespace and a restricted use of accent colors, ensuring that users navigating high-stakes decisions feel supported and focused. All layouts are optimized for **RTL (Right-to-Left)** reading patterns, prioritizing Hebrew legibility and flow.

## Colors

The palette is inspired by natural pigments—ink, paper, and earth tones.

- **Primary (Purple):** Used for primary actions, branding, and active states. It signals professional authority.
- **Success/Active (Teal):** Used for "Active Match" status and confirmed schedules.
- **Warning/Offline (Amber):** Used for status alerts that require attention but aren't critical errors.
- **Destructive/Error (Coral):** Reserved for system errors, missing information, or cancelation actions.
- **Neutral (Ink Series):** A tiered brown-grey scale for text hierarchy, avoiding the harshness of pure black.
- **Surface (Off-white):** The background mimics high-quality paper, reducing eye strain during extended use.

## Typography

This design system uses **Rubik** exclusively to provide a friendly yet structured appearance. Rubik's slightly rounded terminals lend a human touch to the RTL script.

- **Headlines:** Use Bold (700) for screen titles and Medium (500) for section headers to establish clear hierarchy.
- **Body Text:** Use Regular (400) for all descriptive content and messages to ensure maximum readability.
- **Labels:** Use Medium (500) at smaller scales for UI metadata, button text, and chips to maintain legibility against colored backgrounds.
- **RTL Alignment:** All text blocks must be right-aligned by default. Line heights are slightly increased to accommodate Hebrew diacritics and character height.

## Layout & Spacing

The design system follows a **strict 4px grid**. 

- **Mobile First:** The layout is optimized for narrow viewports (375px-414px).
- **Margins:** A standard 20px horizontal margin (`container-padding`) is applied to all screens to ensure content doesn't hit the edge of the device.
- **Vertical Rhythm:** Use 16px (`md`) for standard spacing between related elements and 32px (`xl`) for distinct sections.
- **RTL Mirroring:** All layouts are horizontally mirrored. Icons indicating "forward" must point to the left (←), and "back" buttons must point to the right (→).

## Elevation & Depth

To maintain the "Paper" aesthetic, this design system avoids standard drop shadows for flat UI elements.

- **Tonal Depth:** Depth is achieved through layering off-white surfaces over slightly darker backgrounds or using 1px borders (#E5E2DA).
- **Overlays:** Only temporary UI elements (Modals, Bottom Sheets, Action Sheets) use a soft, diffused shadow to indicate they exist on a separate plane.
- **Interaction:** Buttons do not elevate on tap; instead, they shift in background opacity or color intensity to indicate a press.

## Shapes

The shape language is soft and approachable, avoiding aggressive sharp corners.

- **Containers:** Cards, Input Fields, and Buttons all share a consistent **14px** corner radius.
- **Pills:** Chips and Status Badges use a full circular radius (999px) to distinguish them from interactive containers.
- **Consistent Enclosure:** Ensure that nested elements (like an image inside a card) follow the same corner radius or a slightly smaller one (10px) to maintain visual harmony.

## Components

### Buttons
- **Primary:** Solid Purple background with White text. Used for main actions (e.g., "המשך", "שליחת בקשה").
- **Secondary:** Outline (1px Purple) with Purple text. Used for alternative actions.
- **Success/Destructive:** Solid Teal or Coral for specific contextual actions (e.g., "אישור הגעה", "ביטול").
- **Shape:** 14px radius, 52px height for mobile tap targets.

### TextField
- **Structure:** Label in Ink-Medium (14px), Input box with 1px border (#E5E2DA), and 14px radius. 
- **States:** Focused state uses a 2px Purple border. Error state uses a 1px Coral border with Coral helper text.

### Chips & ChildSelector
- **Chips:** Used for filtering traits or selecting services. 1px border (#E5E2DA) when unselected, Solid Purple with White text when selected.
- **ChildSelector:** A horizontal scroll of chips with names/icons to switch profiles.

### Badges
- **Status Pills:** Small, non-interactive indicators (e.g., "חדש", "ממתין"). Uses a full pill shape with a low-opacity background of the status color (Teal, Amber, or Purple).

### Cards
- **Base Card:** White background, 1px #E5E2DA border, 14px radius.
- **MatchCard:** Includes the aide's photo (right-aligned), name, and a "Match %" indicator in Teal.
- **LetterCard:** Specifically for introductory messages, using a slightly more "handwritten" layout feel with higher vertical padding.
- **RequestCard:** Features a clear "Status Banner" at the top edge of the card.

### ScreenHeader
- **Eyebrow:** Small caps or 12px Medium text in Ink-Light.
- **Title:** 24px Bold in Ink-Dark.
- **Subtitle:** 16px Regular in Ink-Medium.

### Banners
- **Active-Match (Teal):** A full-width bar appearing at the top of the home screen when a session is live.
- **Offline (Amber):** Used for connectivity issues or when the user's profile is hidden from the marketplace.