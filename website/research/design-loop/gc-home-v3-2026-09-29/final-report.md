# GC homepage v3: final report (2026-10-01)

## Result
- **Final candidate:** C16, commit `63628d2` on branch `claude/sweet-archimedes-cljnef`. The source of `website/app` and `website/public` has not changed since.
- **Verdict:** the brief, system and craft critics all passed the same unchanged frozen build in **round 16**.
- **Critics:** every round used three fresh critics with no stake in the work. Some reviews were cut off by usage limits and are marked "–" below:
  - Round 3: the brief review had not landed when C3 failed.
  - Round 6: the brief and craft reviews never landed.
  - Rounds 11 and 15: reviews were re-run on the same unchanged candidate.
- **Not done, by instruction:** no pull request, no deploy and no new hosting project. Publishing is a separate step.

| Round | Brief | System | Craft |
|---|---|---|---|
| C1 | FAIL | FAIL | FAIL |
| C2 | PASS | FAIL | FAIL |
| C3 | – | PASS | FAIL |
| C4 | FAIL | FAIL | FAIL |
| C5 | PASS | FAIL | FAIL |
| C6 | – | FAIL | – |
| C7 | FAIL | PASS | FAIL |
| C8 | FAIL | PASS | FAIL |
| C9 | FAIL | PASS | FAIL |
| C10 | PASS | PASS | FAIL |
| C11 | PASS | PASS | FAIL |
| C12 | PASS | PASS | FAIL |
| C13 | PASS | PASS | FAIL |
| C14 | PASS | PASS | FAIL |
| C15 | FAIL | PASS | FAIL |
| **C16** | **PASS** | **PASS** | **PASS** |

`progress.md` has, for every round:
- what changed;
- each critic's material failures and minor notes;
- the split between approved brand rules and the conventions inferred for this build.

## What the visitor gets
**Homepage `/`**, one chapter at a time:
1. **Opening film:** the supplied "Live Different!!" slogan artwork and one action, "Shop the hoodie".
2. **01 The piece:** the hoodie, with the gallery, sizes, bag and demo checkout, and every concept disclosure under the action.
3. **02 Behind GC:** a black manifesto beat.
4. **03 The mark:** STRENGTH. PROTECTION. LOYALTY. over a halftone print that tears away to the colour photograph.
5. **Campaign wall:** three prints on concrete.
6. **Troop split:** "A mind of your own" / "People in your corner".
7. **One Camp:** the teams program, marked as in development.
8. **Sign-off:** the slogan artwork and one closing action.

**`/teams`:** the program page with a team-brief builder (create, copy, edit).

## Validation of C16
- **Build checks:**
  - `npm run build`: exit 0.
  - `npx tsc --noEmit`: exit 0.
  - `node --test tests/arrival-bootstrap.test.mjs`: 30 pass, 0 fail.
  - `npx oxlint app`: 1 error, which predates this work (`site.tsx` react-compiler EffectSetState). The untouched baseline reports 17.
- **Interactions:** 54/54 at 1440, 390 and 320. Covers the menu, sizes, the no-size error, add to bag, the bag, checkout, finish, the bag emptying, anchors, the /teams brief and overflow.
- **Focus and inert:** 80/80 at 1440, 390, 320 and 768. Every dialog traps and returns focus, and the page is inert behind each overlay.
- **Reduced motion and keyboard:** 16/16 at 320×640, 390×844, 768×1024 and 1440×900, on / and /teams.
  - Reduced motion (fresh session, no motion query): page lit, film paused, nothing hidden, no overflow.
  - Keyboard: every stop shows a ring and settles in view.
- **About this concept:** 18/18 sizes on both pages, including phones held sideways and short desktop windows.
- **Demo checkout confirmation:** heading and focused next step visible together at 8/8 sizes.
- **Phone product section:** after the hero action, Add to bag is in view at 11/11 phone, tablet and sideways sizes. There is deliberately no sticky dock.
- **Rendered colours:** the overlay colour audit found 0 colours off the GC tokens.
- **Network:** 165 responses with 0 failures. Without a playable film the page lights in under 2s.
- **Opening film:** the hero action stayed hit-testable in 140 of 140 samples per width across loops.
- **Slow networks:** the page lights at ~6.9s on fast 3G, ~5.0s on slow 4G and ~14.0s on slow 3G. Any input lights it sooner.

The critics also ran their own browser checks. Their lists are summarised in `progress.md`.

## Before / after
- `final/before-after-desktop-1440.jpg` and `final/before-after-phone-390.jpg`: the live build of 2026-09-28 against C16, chapter by chapter.
  - The live build's film is H.264 only, which the test Chromium cannot decode, so its opening shows the fallback frame.
- `final/c16-*.jpg`: selected C16 screens (desktop hero, values and troop; tablet hero; phone product, values and 320 sign-off).

## Local preview
```
cd website
npm install
npm run dev                 # http://localhost:5173
# or the production static build, as reviewed:
npm run build
npx serve dist/client       # / and /teams
```
- Add `?motion=full&intro=1` to replay the full opening on every load.
- `npm start` runs the Cloudflare worker locally through wrangler, which is not needed for a preview.

## Limitations
**Imagery**
- Every person and campaign photograph is an AI-generated concept. The About dialog says so.
- No generative image or video tool was reachable in this session. New imagery was made only by local retouching and recomposition:
  - the three campaign prints;
  - the One Camp desert ridge;
  - the wide values photograph, whose left half is a synthesised shadowed room;
  - the huddle crescent removal.
- Three generation briefs (G1–G3 in `progress.md`) are ready for when Kling or image generation is connected. They need the tools connected at claude.ai/customize/connectors, or API keys added in the environment settings, and then a new session.
- City skylines still appear in the film's opening, the values window and the court photograph, which sits oddly with "Nevada".
- Composited chest marks look flat, and some leave generator residue.
- The lights-off halftone turns the mark's red GC grey.
- Two reds sit side by side: the supplied artwork red and the `#bf1932` token.

**Accessibility and UI**
- Against the brightest pixels under a word, the values headline dips to ~2.6–2.8:1 at some scroll positions. The median is ≥ 10:1, on 64–224px type with a shadow.
- The red wordmark measures ~2.9:1 on the black bar.
- Hover states stick after a tap, because there is no `(hover: hover)` guard.
- On a session's first load, the hero action is hidden for ~2.4s of the dark opening. This is by design; Menu, Bag and Shop stay usable, and any input lights the page.
- Labels are inconsistent: "Shop" in the bar, "The hoodie" in the menu and footer. The two accordion styles differ, and focus-ring offsets vary.

**Copy**
- Athletic roots are shown in the imagery but never stated in the copy.
- The disclaimers repeat in every chapter.

**Code**
- Legacy leftovers remain:
  - the unused ProductPreview sheet;
  - `refinement.css`;
  - unused assets `gc-brush-a.png`, `gc-brush-b.png`, `gc-mark-600.webp`, `gc-tear-h.png` and `team-bleachers-v1.webp`.

**Not verified**
- Physical phones, Safari and Firefox were not tested.
- MP4 playback is unverified, because the test Chromium plays only the WebM sources.
- The critics' full reports and the screenshot evidence packs lived in the session scratchpad, which is not kept. Their verdicts and findings are summarised in `progress.md`.
