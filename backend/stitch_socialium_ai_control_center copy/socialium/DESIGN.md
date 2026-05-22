---
name: Socialium
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 24px
---

## Brand & Style
The design system is engineered for high-performance AI and automation platforms. It centers on a **Minimalist-Modern** aesthetic that balances technical precision with high-end editorial elegance. The visual language evokes a sense of "intelligence behind the glass," utilizing deep canvases, subtle translucency, and vibrant kinetic energy through its primary accents.

The target audience consists of power users and creators who require a focused, low-friction environment. The UI should feel exceptionally responsive and premium, prioritizing content and data visualization over heavy decorative elements.

## Colors
The palette is rooted in a deep, monochromatic foundation to allow the brand gradients to signify action and intelligence. 

- **Primary & Gradients:** Use Indigo and Violet primarily for interactive states and AI-driven features. The Pink accent is reserved for highlights or high-energy notifications.
- **Surface Strategy:** In dark mode, surfaces rely on subtle opacity shifts (`0.03`) rather than solid grays to maintain depth.
- **Accents:** Success, Warning, and Error colors follow standard semantic conventions but use highly saturated values to remain legible against the dark background.

## Typography
This design system utilizes **Plus Jakarta Sans** (as a high-quality alternative to Cal Sans for web versatility) for headings to provide a modern, geometric character that feels both professional and approachable. **Inter** is utilized for all functional and body text to ensure maximum legibility at small scales.

- **Headings:** Use tight letter spacing for large displays to maintain a cohesive, "locked-in" look.
- **Body:** Standardized at 14px for density, which is essential for data-heavy automation dashboards.
- **Labels:** Use medium weights for buttons and navigation items to differentiate them from static body text.

## Layout & Spacing
The layout follows a strict **8px grid system**, ensuring all components and containers align perfectly to a consistent mathematical rhythm.

- **Grid Model:** A 12-column fluid grid is used for desktop layouts, transitioning to a single-column stack on mobile.
- **Padding:** Use 16px (`md`) for internal card padding and 24px (`lg`) for section spacing.
- **Consistency:** All margins and gutters should be multiples of 8. Avoid odd-pixel values to maintain the "precision" brand pillar.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Z-Index Hierarchy:** 
  - Level 0: Background (`#0a0a14`).
  - Level 1: Cards/Modules (Semi-transparent `0.03` fill with a `0.07` white border).
  - Level 2: Overlays/Modals (Solid color with a slight backdrop blur of 12px and a soft ambient shadow).
- **Glassmorphism:** Use background blurs sparingly on navigation bars and floating menus to create a sense of verticality and sophisticated texture.

## Shapes
The shape language is defined by the **16px radius** (`rounded-lg`) for major containers and cards. This large radius softens the technical nature of the AI theme, making the interface feel more organic and inviting.

- **Containers:** 16px (1rem) for cards and main content areas.
- **Interactive Elements:** 8px (0.5rem) for buttons and input fields to provide a clear visual distinction from the outer containers.
- **Small Elements:** 4px (0.25rem) for tags and tooltips.

## Components
- **Buttons:** Primary buttons use a linear gradient from Indigo to Violet. Ghost buttons use the `0.07` border. All buttons have a hover state that increases the brightness or opacity slightly.
- **Input Fields:** Minimal design with a 1px border. On focus, the border transitions to Indigo with a subtle outer glow (0px 0px 0px 2px rgba(99, 102, 241, 0.2)).
- **Cards:** Defined by the `0.03` white fill (in dark mode) and `16px` radius. Content within cards should follow the 8px spacing rule.
- **AI Indicators:** Use a subtle "pulse" animation or a Violet-to-Pink gradient stroke to denote active AI processing or automated suggestions.
- **Lists:** Clean rows with 1px bottom borders. Hover states should use the `0.03` white fill to highlight the active row.
- **Chips/Tags:** Rounded-full (pill-shaped) with a background color matching the accent but at 10% opacity for a soft, integrated look.