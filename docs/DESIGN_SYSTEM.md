# Design System — Contemporary Tropical Editorial

Redesigned 2026-11-04 so BOUND 2 ZANZIBAR has its own identity, clearly distinct from the owner's other brand (ZanziExplore: centred full-bleed hero, rounded cards and pills, Playfair Display / Plus Jakarta Sans, navy and sky blue).

## Brand character

An international travel magazine combined with a modern booking site: welcoming, clear, locally knowledgeable and dependable. It should appeal to residents and overseas visitors without feeling budget-only or luxury-only.

## Signature elements

- **Square corners** on the public site (`--radius: 0.125rem`); no pill shapes.
- **Hairline rules** (1px, ocean at 10–20% opacity) to separate content instead of shadows and boxes.
- **Numbered sections**: `SectionHeading` puts "01 — Destinations" on a hairline above a large serif title.
- **Editorial type**: very large serif headlines (`.display-xl`, `.display-lg`), italic accents, small letter-spaced labels (`.eyebrow`).
- **Asymmetric layouts**: split hero with a framed slideshow and an overlapping inset photo, a destination mosaic on a 12-column grid, staggered tour columns, and package "rows" with large day numerals.
- **Alternating section backgrounds**: ivory, sand, deep ocean and warm white, so consecutive sections never share a colour.

## Palette (tokens in `src/app/globals.css`)

| Token | Value | Use |
| --- | --- | --- |
| `ocean-deep` | `#0A2A38` | Primary text, primary buttons, dark sections |
| `ocean` | `#11485C` | Hover on dark surfaces |
| `turquoise` | `#2AA8A6` | Decorative accents only (not small text on light surfaces) |
| `turquoise-deep` | `#0E6E73` | Links, focus rings, small accent text (~5.5:1 on ivory) |
| `warm-white` | `#F8F4EC` | Page background |
| `ivory` | `#FBF8F2` | Cards, panels, light sections |
| `sand` / `sand-soft` | `#EADFC9` / `#F2EADB` | Alternate sections, highlight boxes |
| `gold` | `#C5A46D` | Champagne: decorative rules, gold buttons (navy text only) |
| `gold-deep` | `#83622A` | Small champagne text, labels, numerals (~5.1:1 on ivory) |
| `slate-brand` | `#56636C` | Muted text (~5.6:1 on ivory) |

Contrast was computed for every text pairing listed above (all pass WCAG AA).

## Typography

- Display: **Instrument Serif** (400, normal and italic), for headings, prices and numerals.
- Body/UI: **Instrument Sans**.
- Both are loaded with `next/font`.
- All-caps appears only in short labels (`.eyebrow`, nav, buttons on cards), never in body copy.

## Admin

The admin opts into a SaaS look through `.admin-scope`: softer corners (`0.625rem`), a cool neutral canvas, white cards, the sans font for headings, a deep-ocean sidebar, and a top bar with search and notifications. The same colour tokens apply, so the brand stays recognisable.

## Components

- **Header**: slim ocean top bar with real contact routes, then a solid ivory sticky header with uppercase navigation.
- **Mobile menu**: full-height ocean sheet with large serif links.
- **Footer**: closing statement with "Plan your journey" and WhatsApp actions, then navigation and contact columns.
- **Cards**: `TourCard` (default / `feature`), `PackageCard` (default / `row` with itinerary preview), `DestinationCard` (overlay with running number), `ArticleCard` (default / `lead`).
- **Tour page**: title with a facts grid, photo mosaic, sticky in-page navigation, and continuous sections (overview, itinerary, included, good to know, FAQs) beside a sticky booking panel.
- **Price display**: market/currency switcher; prices are never converted.
- **Sample content**: `SampleBadge` marks sample and illustrative content until the owner replaces it.

## Photography

Use genuine photography supplied by the owner or properly licensed sources (see `docs/PHOTO_CREDITS.md`). Never hotlink. Missing photos render a clearly labelled placeholder illustration. Alt text must not claim a location the photo can't confirm.

## Interaction

- Hover: slow image zoom, animated underlines and arrow nudges.
- A gentle fade-up on page change (`template.tsx`) and scroll reveal where the browser supports scroll-driven animations; content is always visible otherwise.
- All motion is disabled for visitors who prefer reduced motion.
- Visible focus rings, keyboard-accessible menus and dialogs, and intentional loading, empty and error states.
