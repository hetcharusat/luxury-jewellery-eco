# Project memory

## Product intent & audience

- Luxury jewellery e-commerce storefront; inspired by Tanishq's premium editorial storytelling.
- Brand name used in build: **Praashi by Supal**.
- Audience: high-end jewellery shoppers expecting cinematic, editorial, production-grade UX.

## Brand personality & voice

- Premium, editorial, cinematic, sophisticated, elegant.
- Visual storytelling over utility-first commerce; sections should feel unforgettable rather than templated.
- Shifted from dark/cinematic mood to a lighter, brighter luxury editorial tone per user reference image.

## Visual design & UX direction

- Aesthetic: **light theme** — bright white surfaces, cream editorial sections, fine burgundy accents; softer, airier luxury presentation.
- Header: two-level bright white header with category-led navigation similar to reference image.
- Accent color: burgundy used for logo, icons, buttons, and navigation details.
- Hero: wide rounded campaign banner with cosmic jewellery styling (replaces former dark full-bleed hero).
- Product presentation: softer, lighter editorial framing.
- Interactions: scroll-reveal animations, parallax, sophisticated transitions retained.
- Commerce UX: category tabs/filtering, wishlist, quick-view modal, shopping bag drawer, responsive mobile nav retained.
- Content sections: new arrivals, journal/editorial, brand story, newsletter signup, luxury footer.
- Imagery: CSS-rendered original artwork (cosmic campaign scene) because image search was unavailable; real campaign photography to be swapped in later.

## Decisions, constraints & rationale

- Stack: Vite + React (JSX), Tailwind CSS, Lucide React icons; `@/` path alias maps to `src/`.
- No extra UI/icon/theme packages installed unless explicitly requested.
- Visual system pivoted from dark satin/gold to light white/burgundy per user's reference image; previous dark direction abandoned.
- Build validated: production build passes, type checks and lint clean.

## Open questions & assumptions

- Real jewellery/campaign photography intended to replace CSS-rendered artwork once image service is available.
- Brand name "Praashi by Supal" assumed from generated build; confirm if it should be user-defined.
- No backend/e-commerce integration yet; cart/wishlist are UI-only interactions.
- Reference image showed a specific layout/style; current implementation approximates it — further visual tweaks may be needed as more references or feedback are provided.