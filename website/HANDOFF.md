# Guerrilla Camp ? current code handoff

Snapshot: 2026-09-28, including the published mobile polish.
Live reference: https://guerrillacamp.pages.dev/preview

## Start here
Node.js >=22.13.0. Run `npm ci`, then `npm run dev`.
Run the dev server once before typechecking so route types can be generated.
Production: `npm run build`; static website output: `dist/client`.
Arrival tests: `node --test tests/arrival-bootstrap.test.mjs`.

## Main design files
- `app/site.tsx`: homepage composition and shopping state.
- `app/v2/home-v2.tsx` and `app/v2/v2.css`: current homepage chapters and visual design.
- `app/campaign-hero.tsx`: film opening.
- `app/product-feature.tsx` and its CSS: hoodie gallery and size selection.
- `app/use-scroll-progress.ts`: scroll animation helpers.
- `public/assets`: all website artwork, photos, fonts and video.

## Design handoff for Claude
Improve the CURRENT homepage rather than rebuilding an older iteration. Preserve Guerrilla Camp's supplied gorilla/GC mark, brush wordmark, Live Different!! slogan, strength/protection/loyalty identity and lights-on film opening. Current design uses black/paper/red, oversized condensed type, torn paper, tape and campaign posters. Keep the working mobile gallery, bag and demo checkout. Orders are not open; product price/sizes are examples; do not invent product or delivery promises.

Latest published polish: reveal headlines have stronger minimum contrast; poster images fetch early with low priority and decode before arrival. Normal phone emulation is largely fluid, but CPU-throttled frame drops remain. Actual iPhone/Safari smoothness has not been verified.

This includes source, configuration, original lockfile, tests and required assets. Generated builds, installed dependencies, Git history, review screenshots, logs and authentication state are omitted. `.openai/hosting.json` is nonsecret build configuration required by the existing Vite scaffold; it is not Cloudflare authentication.

## Homepage v3 (2026-10-01)
The homepage is now `app/v3/home-v3.tsx` and `app/v3/v3.css`; the design loop, critic verdicts and final report are in `research/design-loop/gc-home-v3-2026-09-29/` (not served).

## Motion
Every visit runs the full film and all animation, whatever the device's reduced-motion setting (the user's direction, 2026-10-01).
`?motion=system` (kept for the browser session) restores the device-preference path for testing; `?motion=full` clears it.
Scroll-linked chapters and the header share one animation frame (`onScrollFrame` in `app/use-scroll-progress.ts`): all reads, then all writes.

## Deploy (Cloudflare Pages)
The user asked (2026-10-01) for a new free Pages project for v3 rather than replacing `guerrillacamp` (https://guerrillacamp.pages.dev, the previous build).
`public/_redirects` is in Cloudflare format (`/preview` → full opening, 302).
Needs `CLOUDFLARE_API_TOKEN` (Account › Cloudflare Pages › Edit) and `CLOUDFLARE_ACCOUNT_ID` in the environment, then:
```
npm run build
npx wrangler pages project create guerrilla-camp --production-branch main   # once
npx wrangler pages deploy dist/client --project-name guerrilla-camp --branch main
```
Every deployment stays in the project's history and can be restored from the Cloudflare dashboard (Deployments › Rollback).
