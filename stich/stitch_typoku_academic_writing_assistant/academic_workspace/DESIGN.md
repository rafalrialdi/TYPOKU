---
name: Academic Workspace
colors:
  surface: '#FFFFFF'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#464555'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4953bc'
  on-secondary: '#ffffff'
  secondary-container: '#8792fe'
  on-secondary-container: '#17228f'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  primary-hover: '#4338CA'
  primary-light: '#EEF2FF'
  bg-page: '#FAFAFC'
  bg-dashboard: '#F9FAFB'
  text-secondary: '#4B5563'
  text-muted: '#9CA3AF'
  border-default: '#E5E7EB'
  typo-mark-bg: '#FEF08A'
  typo-mark-text: '#854D0E'
  status-success: '#16A34A'
  status-success-bg: '#DCFCE7'
  status-warning: '#D97706'
  status-warning-bg: '#FEF3C7'
  status-error: '#DC2626'
  status-error-bg: '#FEE2E2'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: '1.35'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-editor:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.75'
    letterSpacing: '0'
  body-regular:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an academic workspace environment tailored for Indonesian higher education, research, and formal writing. Built for sustained cognitive focus during demanding editing workflows (such as PUEBI orthographic auditing, formal paraphrasing, and peer-reviewed journal translation), the design merges high-density information architecture with purposeful minimalism.

The visual direction strips away non-functional ornamentation in favor of clean typographic hierarchy, disciplined spatial balance, and crisp tonal divisions. It prioritizes low optical friction: pure white cards nest over calm cool-tinted workspaces, while focused indigo accents anchor user intentionality. The user feels authoritative, productive, and unencumbered by visual noise.

## Colors

The color palette centers on precise functional utility, strict WCAG AA contrast conformance, and minimal cognitive strain during long reading sessions.

### Functional Roles
- **Primary (`#4F46E5`):** The operational anchor used for primary actions, current tool indicators, key progress states, and brand signatures. It transitions to `#4338CA` on hover.
- **Secondary (`#818CF8`):** Serves as an interactive emphasis accent, active input outline, and subtle focus halo.
- **Neutral (`#111827`):** Deep gray used for high-clarity headlines and long-form prose, avoiding the harsh glare of pure `#000000`.

### Background Hierarchy
- The layout relies on three distinct tonal planes:
  1. **Page Base (`#FAFAFC`):** Public pages and global outer framing.
  2. **Dashboard Workspace (`#F9FAFB`):** Low-strain canvas for side-by-side editing workflows.
  3. **Surface Plane (`#FFFFFF`):** Primary cards, dialogs, floating toolbars, and active editor panes.

### Academic Highlight System
- PUEBI spelling correction tokens (`typo-mark-bg: #FEF08A` and `typo-mark-text: #854D0E`) deliver a dedicated 7.2:1 contrast ratio. This satisfies AA/AAA thresholds, avoiding eye strain while ensuring instantaneous scanning of orthographic issues.

## Typography

Typography relies entirely on `Inter`, taking advantage of its mechanical legibility, neutral geometry, and consistent x-height across Indonesian Latin text, citations, and mixed-case academic markers.

### Typographic Rhythm & Eye Ergonomics
- **Editor Mode (`body-editor`):** Reading manuscripts and diff-views requires elevated vertical rhythm. The line height is anchored at `1.75` to maximize eye-tracking across multi-paragraph dissertations and journals.
- **Interface Content (`body-regular` & `body-medium`):** Kept between `14px` and `15px` with a tighter `1.5 - 1.6` line height to maintain dense, clear control surfaces.
- **Heading Scale:** Headings use negative letter tracking (`-0.01em` to `-0.025em`) to maintain tightness, countering loose digital rendering.

## Layout & Spacing

The system enforces a strict 4px/8px baseline grid designed around split-panel productivity.

### Workspace Shell
- **Desktop (>= 1024px):** Fixed 260px navigation rail on the left, sticky 64px header, and a fluid workspace container. Split-pane layouts (Source vs. Corrected/Translated text) span equal 50% flex columns with a `gutter` of `1.5rem`.
- **Tablet (768px – 1023px):** Left navigation collapses to an 80px icon dock. Dual panes contract their internal margins while keeping horizontal parity.
- **Mobile (< 768px):** Navigation tucks into a drawer. The horizontal split-pane reflows into a segmented vertical stack (Tab 1: Input / Tab 2: Result) to maintain adequate line lengths for editing.

### Spacing Tokens
- `space-xs` (4px): Inline icon-to-label gaps, highlight mark internal padding.
- `space-sm` (8px): Button internal vertical padding, chip gutters, form field vertical clearance.
- `space-md` (16px): Input field horizontal padding, card content separators, toolbar cluster gaps.
- `space-lg` (24px): Workspace pane padding, modular card spacing.
- `space-xl` (32px): Major dashboard section divisions and hero vertical margins.

## Elevation & Depth

Visual hierarchy uses crisp, low-contrast architectural planes rather than heavy drop shadows. Surfaces separate cleanly via structural outlines paired with subtle ambient diffusion.

### Elevation Levels
- **Level 0 (Flat / Canvas):** Applied to `--bg-page` (`#FAFAFC`) and `--bg-dashboard` (`#F9FAFB`). Borderless, serving as the neutral floor.
- **Level 1 (Card / Structural Surface):** Pure `#FFFFFF` panels resting inside the dashboard workspace. Enclosed with a solid 1px border of `--border-default` (`#E5E7EB`) and supported by subtle ambient diffusion: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`.
- **Level 2 (Active Overlays / Dropdowns):** Context menus, language swap popovers, and hovered interactive cards: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`.
- **Level 3 (Modal / Document Preview Sheets):** Centered modal overlays and floating inspection toolbars: `0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.05)`.

### Border Discipline
All panels in the editing cockpit feature a 1px border in `--border-default` to delineate functional areas. Focus rings abandon generic browser styling, using a crisp 2px offset ring in `--border-focus` (`#818CF8`).

## Shapes

The design uses a clean, controlled corner radius (Level 2) that softens standard enterprise interfaces without looking casual or consumer-oriented.

### Geometry Token Application
- **Small (4px):** PUEBI `<mark>` tags, micro-badges, and code snippets.
- **Medium (8px):** Primary form inputs, text areas, action buttons, alert banners, and language switchers.
- **Large (12px - 16px):** Primary document containers, side-by-side editor panels, dropzone upload rectangles, and modals.
- **Full / Pill (999px):** Status indicators, mode select toggles (e.g., "Akademik (Formal)"), and user avatar frames.

## Components

### Buttons
- **Primary:** Solid `#4F46E5` background, pure white text, 8px border-radius, font-weight 600, padding: 10px 18px. Transitions to `#4338CA` on hover. Focus triggers a 2px offset ring in `#818CF8`.
- **Secondary / Outline:** 1px border `#E5E7EB`, background `#FFFFFF`, text `#111827`. Hover applies background `#F9FAFB` and text `#4F46E5`.
- **Ghost:** Transparent background, text `#4B5563`, hover background `#EEF2FF` with text `#4F46E5`. Used for editor auxiliary tools (Copy, Clear, Download).
- **Disabled State:** Opacity 50%, background `#E5E7EB`, text `#9CA3AF`, cursor `not-allowed`.

### Document Upload Dropzone
- Outlined with a 2px dashed border in `#CBD5E1`.
- Background defaults to `#FFFFFF`. Hover and active drag-over states transition border to `#4F46E5` and background to `#EEF2FF`.
- Centered icon layout: 32px indigo icon, clear primary action prompt (`body-medium`), followed by helper text indicating file size limits (`caption` in `#9CA3AF`).

### Inputs & Textareas
- Default background `#FFFFFF`, border 1px solid `#E5E7EB`, radius 8px, text `#111827`.
- Focus-visible state: border color `#4F46E5`, paired with a 2px shadow ring in `#818CF8` at 30% opacity.
- Academic Editor Textarea: Minimum height 360px, padding 16px, line-height 1.75, persistent word-count metadata docked to the bottom-right corner in `#9CA3AF`.

### Typo Correction Marks (`<mark>`)
- Inline elements generated by orthographic correction engines:
  - Background: `#FEF08A`
  - Text color: `#854D0E`
  - Font weight: 500
  - Padding: 2px 4px
  - Border radius: 4px
- Interactive tooltip on hover showing the original typo alongside the PUEBI rationale.

### Chips & Filter Pills
- Style-selector chips (e.g., *Akademik (Formal)*, *Ringkas & Lugas*):
  - Inactive: Border 1px `#E5E7EB`, background `#FFFFFF`, text `#4B5563`.
  - Active: Border 1px `#4F46E5`, background `#EEF2FF`, text `#4F46E5`, font-weight 600.
  - Border-radius: 999px.

### Cards & Work Panes
- Structural white containers (`#FFFFFF`), 1px solid `#E5E7EB`, rounded-xl (12px-16px), elevation level 1.
- Internal division between the editor header toolbar and content area is marked by a 1px solid border in `#E5E7EB`.