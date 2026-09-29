# Guerrilla Camp concept

A private, responsive fashion and partnership concept built with Vinext, React and the scaffold's Base UI / shadcn primitives.

## Run

```sh
npm install
npm run dev
```

Main routes: `/` and `/teams`.

The sample hoodie uses an illustrative $78 USD price and sizes. Buy now opens a demo checkout; it never collects payment or creates an order. The team brief form runs locally and copies the user's draft to their clipboard. Nothing is submitted to GC or stored by a server.

## Validate

```sh
npx oxlint app
npx tsc --noEmit
npm run build
```

The scaffold's full `npm run lint` also scans unused bundled UI components and currently reports upstream lint errors there. The authored app is checked separately; those bundled primitives are preserved.

Static output is `dist/client`. `.openai/hosting.json` binds the existing Sites project; do not register a duplicate project.

Logos and the approved slogan use founder-supplied artwork. Campaign photography and the proposed charcoal hoodie are AI-generated concepts. The sand garments are a supplied reference. The site's concept dialog records these distinctions for reviewers. Product specifications and retail/program terms need verification before any commerce launch.
