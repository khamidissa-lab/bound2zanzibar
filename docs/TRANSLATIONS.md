# Languages and translations

The public website is available in **English, French, German, Italian, Arabic and Turkish**. The admin is English only.

## Addresses

- English pages have no prefix (`/tours`). The other languages add their code: `/fr/tours`, `/de/tours`, `/it/tours`, `/ar/tours`, `/tr/tours`.
- `/en/...` redirects to the address without the prefix, so every page has one English address.
- The language menu in the header (and in the mobile menu) remembers the visitor's choice in a cookie.
- Arabic pages are laid out right to left and use Arabic fonts.
- Each page lists its other-language versions for search engines (hreflang tags and the sitemap).

## Two kinds of text

**1. Interface text** (menus, buttons, headings, forms, notices)

- Lives in `src/i18n/messages/en.ts`. The other languages are files next to it.
- Drafted with AI: `npm run i18n:ui`, or `npm run i18n:ui -- fr` for one language.
- Edits to these files go through a developer.

**2. Content** (tours, packages, destinations, travel-guide articles, tour categories)

- English is stored in the content tables. Each other language is a row in `content_translations`.
- **AI drafts:** `npm run i18n:content` drafts every missing translation of published content.
  - Add `-- --force` to redo existing AI drafts.
  - Translations already reviewed in the admin are never overwritten.
- **On the website:** AI drafts are shown with a "translated automatically — under review" note and a link to the English version.
- **Review in the admin:** go to **Admin → Translations**, or use the **Translations** link on any tour, package, destination or article edit page.
  - The editor shows the English text next to each translated field.
  - Saving marks the translation as **reviewed** and removes the note.
  - Empty fields show the English text.
- **Never translated:** prices, currencies, dates, slugs, photos and other business data.
- **Fallback:** any field without a translation shows in English.

Both scripts need `ANTHROPIC_API_KEY` in `.env.local`. The content script also needs `SUPABASE_SERVICE_ROLE_KEY`. Every AI answer is checked to have exactly the same structure as the English source before it is saved.

## Security

- Visitors can read translations of published content only.
- Only staff who can manage content can write translations (row-level security).
- Each save is recorded once in the activity log against the tour, package or article.
