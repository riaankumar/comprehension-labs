# Comprehension Labs

Single-page website built with Vite, React 18, TypeScript and Tailwind CSS.

The opening canvas renders a particle tree whose atoms follow reversible scroll-driven paths. One centered company name transitions into the page header. The website includes pointer interaction, a light/dark theme, a keyboard skip link, reduced-motion support and full content without JavaScript.

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
