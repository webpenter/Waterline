# Manual keyboard-only test script (§15 / Prompt 16)

Run this script with the mouse unplugged (or untouched) before every release,
once per major page. Automated axe checks cannot see focus order, trap
behaviour or operability — this script is the human half of the §15
acceptance. Record each pass (date, tester, route, result) in `DECISIONS.md`.

Keys: `Tab` / `Shift+Tab` move, `Enter` activates links and buttons,
`Space` toggles checkboxes and buttons, arrow keys operate selects, radio
groups and the gallery, `Esc` closes overlays.

## Global (every route)

1. Press `Tab` once from page load — the first focusable element must show a
   visible 2 px focus ring (`color.focus`). No element may ever receive focus
   invisibly.
2. Keep tabbing to the end of the page. Focus must never disappear, jump
   backwards illogically, or get stuck (no keyboard trap).
3. The tab order must follow the visual reading order.
4. Every element you can hover with a mouse must also be reachable by `Tab`
   and operable with `Enter`/`Space`.
5. Enable "reduce motion" in OS settings and reload — no animation may play.
6. Zoom to 200% — nothing may overlap or become unreachable.

## Home (`/en`)

1. `Tab` to the hero search form: water select, price select, boat-length
   input, then the submit button.
2. Choose "Sea" with the arrow keys, `Tab` to the submit button, press
   `Enter` — you must land on `/en/search?water=sea…` with results announced
   (the result count is an `aria-live` region).
3. `Tab` through the featured cards — each card is a single link with a
   visible ring around/inside the card.

## Search (`/en/search`)

1. The first `Tab` stop is the "Skip the map" link — press `Enter`; focus
   must land in the results list.
2. `Tab` through filter pills: each pill's remove control activates with
   `Enter` and removes exactly that filter; focus stays in the pill row.
3. Reach the sort select, change it with arrow keys — the URL updates and
   the result count re-announces without a full focus reset.
4. `Tab` to pagination and move a page forward and back with `Enter`;
   browser Back must restore the previous state.

## Listing (`/en/property/<slug>`)

1. `Tab` through the gallery grid — every image cell is skipped (images are
   not interactive) and the first interactive element after the gallery is
   real content, not a trap.
2. Reach the enquiry form. Fill it entirely by keyboard: name, email,
   `Tab` past phone, message, `Space` on the consent checkbox, `Enter` on
   submit. The success message must be announced (`role="status"`).
3. Submit the form empty instead: focus must move to the error summary;
   each summary entry is a link that moves focus to its field; each invalid
   field announces its error via `aria-describedby`.
4. The brochure and WhatsApp links activate with `Enter`.

## Landing (`/en/waterfront/<combo>`)

1. FAQ accordions are native `<details>` — `Tab` to each `<summary>`,
   toggle with `Enter`/`Space`.
2. The enquiry form behaves exactly as on the listing page.

## Journal (`/en/journal`, article page)

1. `Tab` through the index — each article title is one link.
2. On an article: the "All articles" breadcrumb is the first in-content stop.

## Contact / List-with-us

1. Complete the form keyboard-only as on the listing page, including the
   error-summary path.

## Admin login (`/admin/login`)

1. Email, password, submit — all reachable and operable; the error state
   after a wrong password is announced and focus is not lost.
