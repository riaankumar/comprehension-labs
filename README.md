# Comprehension Labs

Single-page website built with Vite, React 18, TypeScript and Tailwind CSS.

The opening canvas renders a particle tree whose atoms follow reversible scroll-driven paths. One centered company name transitions into the page header. The website includes pointer interaction, a light/dark theme, a keyboard skip link, reduced-motion support and full content without JavaScript.

The homepage story follows the approved October 7, 2026 [Website Tree Story](https://docs.google.com/document/d/1Aej2R1VhdNP40zuwJvtR-rKJ24JOBjY7Qd-X8ZmuLSU/edit?tab=t.jkn8t0wcko50) tab. The hero remains “Comprehension Labs” and “Human knowledge for more capable AI.” The approved paragraph and link fixture is in `test/fixtures/website-tree-story.json`; the browser suite verifies exact copy, regular-weight company description and contact destinations against it.

## Development

```sh
npm ci
npm run dev
```

The local development URL is http://127.0.0.1:8768/.

## Validation

```sh
npm run build
npx playwright install chromium
npm test
```

Run the development server before the browser suite. Set `SITE_URL` to check a different local server and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation. Browser checks cover responsive layout, wording, typography, reversible motion, pointer response, navigation, accessibility, touch, reduced motion and the no-JavaScript fallback.

## Deployment

Vercel builds with `npm ci` and `npm run build`, then serves `dist/`. Existing `/data`, `/approach`, `/research` and `/contact` links resolve to their sections in the same page. Navigation keeps these clean section URLs while scrolling within the page. Older fragment links remain supported.
