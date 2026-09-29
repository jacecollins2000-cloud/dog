# Progress — GC homepage v3

## Setup and limitations
- `/design-loop` is not installed in this environment (the Windows path in the brief doesn't exist here, and no skill of that name is registered).
  This run follows the workflow the brief describes: interview/preflight from the brief, reference teardown, `bar.md`, one builder, and three fresh critics (brief, system, craft) that must all pass the same frozen candidate.
- No ChatGPT or image-generation tool is callable. No imagery was generated; gaps are documented as generation briefs below.
- The Playwright Chromium here cannot decode H.264 MP4, so the film fails over to its fallback path in automated tests.
  Real Chrome, Safari and Firefox play MP4. Phone smoothness is not verified on physical devices.

## Baseline (source zip 2026-09-28 = live build)
- The zip says "including the published mobile polish". Live CSS on guerrillacamp.pages.dev matches it:
  the `.v2-values span` contrast clamp (.65 minimum) and the poster `fetchPriority="low"` + early decode are both present. No reconciliation gap.
- Renders: `scratchpad/shots/base-local/` (1440, 768, 390, 320).
  Interaction run: 50/54 with a 500ms anchor settle. The same suite with a 1.5s settle (identical to the one used on candidates) passes 54/54.
- Failures and defects found:
  - ~~B1 — Behind GC lands mid-transition.~~ **Retracted.** The 500ms check caught global smooth scrolling mid-flight. With a 1.5s settle the baseline lands on the fully lit values chapter (`shots/interact/base2-m390-anchorabout.png`).
  - **B2 — Film sources fail silently.** In a browser that can't decode MP4, the `<source>` errors never reach the `<video>`, so the page stays black until the safety timeout: lit after 5.1s (desktop) and 5.1s (390), reason `timeout`, no message. The product section also stays black until then.
  - **B3 — White-on-white mark on /teams.** The team close uses the white `gc-mark.svg` on white, so only the red "GC" shows.
  - **B4 — /teams uses another design system** (heavy Manrope, pill buttons, white header) and doesn't match the homepage.
  - **B5 — Grit everywhere.** Torn paper at 6 seams, two tape marquees, grain over the whole page, brush strokes behind every action, a concrete wall and halftone.
    The brief warns against "so gritty that it feels inexpensive or generic".
  - **B6 — Repeated layouts and actions.** "Explore the hoodie" appears three times. The Campaign and World headings share one composition. The values pin runs 270svh for one reveal.
  - The desktop menu failed to close on Escape once in the run; rechecked in validation.

## Approved brand rules vs. implementation conventions
Approved (brand brief, supplied files):
- "Live Different!!" keeps both exclamation marks.
- Core palette: Black, White, GC Red (Pantone 19-1664 TCX), GC White (Pantone 11-0601 TPC).
- The official gorilla face and GC mark are not to be redrawn.
- Tiger Rag Std is the heritage typeface for GUERRILLA CAMP and LIVE DIFFERENT!!. No webfont is available here, so the supplied wordmark and slogan artwork carry it.
- Grit × Premium. Voice: confident, direct, understated, "says less".
- Individuality within the troop.

Conventions inferred from the current build (changeable):
- Anton, DM Mono and Manrope.
- Warm paper `#eeebe4`, torn paper, tape marquees, brush-stroke buttons, concrete wall, halftone, grain.
- The 270svh values pin.

## Candidates

### C1 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C1`, served on :5175; source commit noted below)
Changes from baseline:
- **Journey:** film → hoodie → Behind GC manifesto (quiet beat, echo headline) → lights-on values (200svh, was 270) → campaign wall → the individual / the troop split → One Camp → painted sign-off → footer.
- **Grit budget:** the torn edge appears only at film→product, the seam in the lights-on chapter, and the wheat-paste campaign wall.
  Removed: both tape marquees, the full-page grain, torn edges at four other seams, and every brush-stroke button.
- **Palette:** GC White `#f4f5f0` surfaces and GC Red `#bf1932`, per the brief's Pantone references. The tear asset was recoloured to match.
- **Controls:** crisp, high-contrast buttons and underlined links everywhere, including the bag, checkout and brief dialogs.
- **Brand artwork:** the supplied full-colour mark was extracted from the vector PDF (`gc-mark-ink.svg`) for light surfaces (/teams close, sign-off).
  This fixes B3. The white mark is used only on dark surfaces.
- **/teams:** rebuilt on the same bar, footer, type and controls (fixes B4). Copy and disclosures unchanged.
- **Film:** VP9 WebM copies of both edits (MP4 stays first, with explicit codecs). The last `<source>` error lights the page and shows "Film unavailable. Campaign image shown." (fixes B2).
- **Removed:** the duplicate "Explore the hoodie" actions; the wall and world headings no longer share a composition.
Evidence:
- `shots/c1/` sections at 1440, 768, 390 and 320, plus menu, bag, checkout, complete, /teams and brief.
- Interaction suite 54/54 on the dev build and 54/54 on the frozen production build.
- No playable film: lit after 438ms (1440) and 318ms (390) with the fallback message, vs. ~5.1s black on the baseline.
- `npm run build` ok; `tsc` clean; arrival tests 30/30.
- `oxlint app`: 2 errors, both pre-existing (baseline had 17).

**C1 source commit:** `a28ddc4`.

**C1 verdicts — round 1 (three fresh critics, same frozen build):**
- **Brief: FAIL.**
  - Material: the hero "Shop the hoodie" action goes hidden and unclickable for ~2.4s of every 11.75s film loop, and keyboard focus drops to `<body>` at the loop restart. The rule was carried over from the baseline.
  - Everything else was verified independently: the 54/54 suite, anchors under 3s-delayed images, keyboard, reduced motion, overflow at four widths, disclosure accuracy, and posters requested at 32–44ms.
- **System: FAIL.**
  - Material: the motto lost its "!!" in `<title>` and in the hero region `aria-label`.
  - Material: the menu-foot gorilla mark was squeezed to 17×20px at 320px.
  - Minor: a leftover Barlow in checkout, generic greys in dialogs, old focus reds, the concept dialog's chrome and palette caption, and label drift.
- **Craft: FAIL.**
  - Bar 2 failed: the wall and troop headings were typeset identically, and the hero and manifesto each had two labels.
  - Bar 7 failed: the footer wordmark out-scaled the sign-off slogan.
  - Material: the wall comma collided with the next line; the wall and troop were interchangeable and repeated individuality/belonging; the page ended twice; the /teams H1 lines fused (a regression); the /teams bar link wrapped.

### C2 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C2`, served on :5176)
Changes from C1:
- **Hero:** the label and action stay visible and usable through every film loop once the page is lit; only the headline replays. The pause control now has a visible frame.
- **Motto:** "Live Different!!" keeps both marks in the title and the region label.
- **Menu:** the mark is fixed at 44px; menu numbers match the chapter numbers; nav labels are one "For teams".
- **System:** legacy red and ring tokens point to GC Red and ink, with one 2px focus ring. Dialogs use GC greys, product names are in Manrope, prices in mono. The concept dialog gets the eyebrow and bordered close, and its palette caption was corrected.
- **Campaign wall:** the heading is now a caption, "Three prints, pasted up.", with its disclosure beside it. The prints carry the chapter, and the empty foot is gone.
- **One label per chapter opening** (hero, manifesto).
- **Values:** the words are 11vw, lights-off opacity rises from .65 to .84, and the tear starts fully off-screen.
- **Ending:** the sign-off is full-screen and the largest brand moment; the footer is a compact colophon.
- **/teams:** the H1 leading is .9; the bar link is a short "Shop".
- **Phone:** One Camp is recropped so the copy reads over sky; the troop echo is balanced; the sign-off fits at 320px.
- **Anchor jumps:** the bar holds after a jump, so no strip of the previous section shows; posters show blank paper while loading.

Evidence:
- `shots/C2/` at 1440, 768, 390 and 320.
- Interaction suite 54/54 on the frozen build.
- No playable film: lit at 385ms (1440) and 342ms (390).
- Hero action across a full loop (140 samples at 100ms): hidden 0, focus lost 0. Frozen C1 on the same test: 22 hidden, 50 focus lost.
- Build ok; `tsc` clean; arrival tests 30/30; `oxlint` 2 errors, both pre-existing.

## Imagery audit and generation briefs
The asset library covers every chapter; no new imagery was required to ship.
No ChatGPT or image-generation tool was callable in this environment, so nothing was generated.
One gap would clearly strengthen the work; its brief is below for a future session.

**G1 — Matched diptych for "The individual / The troop" (replaces the two current halves).**
- **Why:** today's halves come from two shoots — a warm dusk courtside portrait beside a navy night huddle. The split reads as two photos, not one idea.
- **Subject:** the same outdoor concrete court at blue hour, shot from one camera position, in two frames.
  - Left: one adult athlete in the charcoal GC Hoodie, seated alone on the bleacher step, looking off-frame.
  - Right: four adult teammates in GC charcoal, black and cream pieces, close together on the same step, one arm over a shoulder.
- **Light and texture:** one practical court light, cool ambient sky, and a warm rim on the subjects. Natural skin, real fabric texture on the washed charcoal, no retouched gloss.
- **Composition:** 4:5 portrait. Subjects in the lower 60%, with clean sky or concrete in the upper 40% for type.
  The chest mark must be visible and unaltered: composite the supplied mark rather than letting a generator redraw it.
- **Crops:** desktop half-screen 720×900 (centre 50%); phone 390×400 (lower 55%, faces clear of the bottom 120px caption zone).
- **Deliverables:** WebP at 1122×1402 and 2244×2804, each under 180 KB at 1122w. Label them "Illustrative campaign" on the page.
