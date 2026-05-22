---
name: Socialium Light
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#9a25ae'
  on-secondary: '#ffffff'
  secondary-container: '#ed76fd'
  on-secondary-container: '#69007a'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#ffd6fe'
  secondary-fixed-dim: '#f9abff'
  on-secondary-fixed: '#35003f'
  on-secondary-fixed-variant: '#7b008f'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
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
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system embodies a "Minimalist-Elegant" aesthetic, prioritizing clarity, breathability, and premium finishes. It is designed for high-end social networking where content is king and the interface acts as a sophisticated gallery. 

The visual language balances the airy openness of wide white spaces with the richness of a singular, vibrant focal point—the signature Indigo-to-Violet gradient. The emotional response is one of calm, organized intelligence and effortless modern luxury. Every interaction should feel light yet deliberate, using subtle motion and refined depth to guide the user through a curated digital environment.

## Colors

The palette is anchored by a high-clarity neutral foundation. **#FFFFFF** is reserved for primary content containers to ensure maximum lift, while **#F8F9FA** and **#F1F3F5** are utilized for background layering and secondary UI elements to define structure without the need for heavy lines.

The **Indigo-to-Violet gradient** serves as the system's primary "Action" color. It must be used sparingly to maintain its impact—reserved for primary CTAs, active states, and brand-critical icons. Text contrast is strictly maintained using a deep charcoal hierarchy, ensuring AAA accessibility for body copy against the light surfaces.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels to maintain a contemporary, friendly, yet professional tone. The typographic scale is designed with a strong emphasis on vertical rhythm and negative space.

Headlines use semi-bold and bold weights with tighter letter-spacing to create a "locked-in," editorial feel. Body text is set with generous line-height to ensure comfort during long reading sessions. For mobile devices, headline sizes scale down to prevent awkward word-breaks while maintaining visual hierarchy through weight.

## Layout & Spacing

The layout is built on a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 8px spacing rhythm ensures consistency across all components and containers.

We employ a "content-first" layout philosophy where margins are generous (#lg or #xl) to prevent the UI from feeling cramped. Elements should be grouped using proximity; related items should use #xs or #sm spacing, while distinct sections of a page are separated by #xl or larger to create clear mental models of the information architecture.

## Elevation & Depth

Depth in this design system is achieved through "Soft Stacking." Instead of harsh shadows, we use high-diffusion, low-opacity ambient shadows combined with refined 1px borders in #F1F3F5.

- **Level 0 (Background):** #F8F9FA. No shadow.
- **Level 1 (Cards/Surface):** #FFFFFF. Border: 1px #F1F3F5. Shadow: 0px 2px 4px rgba(0,0,0,0.02).
- **Level 2 (Popovers/Dropdowns):** #FFFFFF. Shadow: 0px 8px 16px rgba(0,0,0,0.06).
- **Level 3 (Modals):** #FFFFFF. Shadow: 0px 16px 32px rgba(0,0,0,0.08).

The use of backdrop blurs (10px - 20px) on sticky headers and navigation bars is encouraged to maintain a sense of context and "richness" as users scroll through content.

## Shapes

The shape language is defined by **Round Eight** (0.5rem / 8px base). This provides a soft, approachable feel that remains structured enough for professional contexts.

- **Standard Components:** 8px (Buttons, Inputs, Small Cards).
- **Large Containers:** 16px (Main feed cards, Modals).
- **Interactive Elements:** Pill-shapes (32px+) are reserved specifically for tags, chips, and search bars to distinguish them from actionable buttons.

## Components

### Buttons
Primary buttons utilize the Indigo-to-Violet gradient (linear-gradient(135deg, #6750A4 0%, #9C27B0 100%)) with white text. Secondary buttons use a #F1F3F5 background with #212529 text. All buttons have a height of 48px for optimal touch targets.

### Input Fields
Inputs feature a #F8F9FA background and a 1px #F1F3F5 border. On focus, the border transitions to the primary Indigo color with a 2px soft outer glow.

### Cards
Cards are the primary container. They must be #FFFFFF with an 8px or 16px corner radius. Padding within cards should be a minimum of 24px (#lg) to maintain the elegant, minimalist aesthetic.

### Chips & Tags
These use pill-shaped rounding. Active chips should use a light tint of the primary color (e.g., Indigo at 10% opacity) with the primary Indigo color for the text.

### Lists
List items are separated by a subtle 1px divider (#F1F3F5). Hover states for list items should use a simple #F8F9FA background shift rather than an elevation change.