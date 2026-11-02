# Design System — Tropical Modern

## Brand character
Welcoming, clear, locally knowledgeable, adventurous and dependable. The design should appeal to residents and overseas visitors without feeling either budget-only or luxury-only.

## Palette
- Deep Ocean `#073B4C`
- Ocean Blue `#0B6073`
- Turquoise `#19A7A1`
- Warm White `#FAFAF7`
- Sand `#EDE3D2`
- Muted Slate `#64748B`
- Champagne Gold `#C6A15B` (sparingly)

Implement as CSS variables and Tailwind theme tokens. Check contrast for text and interactive controls.

## Typography
Use a distinctive but readable pairing. Example: a refined display face for large headings and a highly legible sans-serif for body/UI. Load fonts using Next.js font optimization. Do not overuse all-caps.

## Layout
- Mobile-first
- Max content width around 1200–1320px
- Generous section spacing
- Large photography-led hero
- Consistent card radius and shadows
- Clear visual hierarchy
- Sticky or compact header only if it does not obstruct content

## Components
- Header/navigation and mobile menu
- Primary, secondary and text buttons
- Search/discovery panel
- Tour card and package card
- Destination card
- Price display with market/currency selector
- Rating/testimonial card (only verified or sample-labelled)
- Booking form
- Breadcrumbs
- FAQ accordion
- Footer
- Admin sidebar, metric cards, data tables, filters and dialogs

## Photography
Use genuine licensed business photography supplied by the owner or properly licensed image sources. Do not hotlink random images in production. Use local placeholders or clearly marked temporary images during development. Provide descriptive alt text.

## Interaction
- Subtle hover and focus states
- Keyboard accessible menus/dialogs
- Visible focus ring
- Reduced-motion support
- Skeletons or clear loading indicators where appropriate
- Empty and error states should look intentional
