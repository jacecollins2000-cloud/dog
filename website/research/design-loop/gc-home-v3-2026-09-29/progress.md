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

**C2 source commit:** `83cae3b`.

**C2 verdicts — round 2 (three new critics):**
- **Brief: PASS.**
  - No material failures.
  - Minor notes: focus dropped to `<body>` after checkout Escape; the bar was hidden after a cross-page jump; a strip under the bar after an anchor jump; the play/pause label was wrong when the film failed; borderline caption contrast on concrete; no "illustrative" tag in the gallery; a slow-film re-dark carried over from the baseline.
- **System: FAIL.**
  - Material: the favicon was the white-only mark, which is illegible on light tabs (carried over from the baseline).
  - Minor: menu numbering gaps, label formats, off-token colours, "GC Partnership Program" naming, the corporate tagline, and the 30% ghosted mark.
- **Craft: FAIL.**
  - Material: a halftone band stayed at the left edge of the lit values chapter (a C2 regression in the seam path).
  - Material: the hero headline vanished for ~2.5s every film loop.
  - Material: the manifesto, wall and troop heads shared one template (bar 2).
  - Material: the tablet split sliced faces.
  - Material: the phone manifesto was not a full-viewport beat (bar 4).

### C3 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C3`, served on :5177)
Changes from C2:
- **Seam:** the path ends flush (measured: lit layer left edge 0, lip off-screen at 1440, 768, 390 and 320; lip off-screen left at the start).
- **Hero:** the headline, label and action rest visible through every loop once lit. The action sits above the headline's line boxes (a hit-test regression found and fixed before freezing).
- **Chapter heads:** a centred wall caption, a full-width belonging statement, and one label on the values chapter (the lights-on/off labels were removed).
- **Troop halves:** equal, with no hover resize. They stack on tablets and portrait screens, and the phone gradient is deeper under the captions.
- **Phone manifesto:** 100svh. The values photograph now sits so the face clears the words.
- **Sign-off:** paints once on arrival and rests painted. On phone the mark is 128px.
- **System fixes:** the favicon uses the full-colour mark; the menu is an unnumbered list; one "NN / Name" label format; dialog eyebrows match; the values mark is at full opacity; tokens for text over photos; /teams is titled "For teams", without the tagline or program naming.
- **Brief notes:**
  - Focus returns to the bag button after checkout closes.
  - The bar holds after cross-page and in-page jumps, and anchors land flush with no foreign strip.
  - The film control is hidden when the film fails.
  - Poster captions sit on chips.
  - An illustrative-images line was added to the product facts.
Evidence:
- `shots/C3/` at four widths.
- Interaction suite 54/54 on the frozen build.
- No film: lit at 464ms / 294ms.
- Hero action across a loop: 0 hidden, 0 focus lost, clickable at 1440, 768, 390 and 320.
- Anchors land at top 0 with the bar visible and no foreign strip.
- Build ok; `tsc` clean; arrival tests 30/30; `oxlint` 2 errors, both pre-existing.
Not changed:
- The slow-film re-dark: a film that starts more than 4s late replays the intro if the visitor hasn't interacted. This is the tested baseline arrival logic.

**C3 source commit:** `76c088f`.

**C3 verdicts — round 3 (three new critics):**
- **System: PASS.**
  - No material failures. Logo path data matches the founder PDFs; the favicon is legible on five tab colours.
  - Minor: the hero motto is set in Anton rather than the supplied artwork; the inherited AI images contain generator-drawn marks; small red and near-black drift; the accordion focus ring; Barlow is still loaded; "Wear what you stand for."; Manhattan-style skylines.
- **Craft: FAIL.**
  - Material: the resting values headline crossed the model's mouth and jaw.
  - Material: the phone film's group beat cut a face in half.
  - Material: on phones, the hero, values and both troop halves repeated one template (dark photo with white caps lower-left), which failed bar 2.
- **Brief:** still running when C3 failed; logged below if it lands.

### C4 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C4`, served on :5178)
Changes from C3:
- **Values (desktop):** the photograph is reframed (`center 64%`), so the face sits above the words.
- **Values (upright screens):** the photograph fills the top 60% of the stage and the words stand on black beneath it. The tear strip follows the shorter photo; the seam was measured flush at all four widths.
- **Troop (upright screens):** the halves are captioned photographs on paper, with type beside the pictures rather than over them.
- **Phone film framing:** follows the edit — weighted right for the light-switch beat, then easing to 35% across the dissolve at ~8.6s, so the group beat shows both faces whole (checked at 390 and 320).
- **320 details:** the hero label wraps as two chips; the poster chips don't break mid-label; the header wordmark is 118px; the wall disclosure uses a non-breaking hyphen.
- **Phone sign-off:** a smaller mark, the slogan at 94vw, and the disclosure set as two lines.
Evidence:
- `shots/C4/` at four widths; interaction suite 54/54 on the frozen build.
- No film: lit at 493ms / 440ms.
- Hero action across a loop: 0 hidden, 0 focus lost.
- Anchors and focus return as in C3; seam flush at 1440, 768, 390 and 320.
- Build ok; `tsc` clean; arrival tests 30/30; `oxlint` 2 errors, both pre-existing.

**C3, late brief verdict: FAIL.**
- Material: after add-to-bag, the add button was `disabled` for 420ms, so keyboard focus fell to `<body>`; closing the bag then sent Tab to the skip link.

**C4 source commit:** `2bc8182`.

**C4 verdicts — round 4 (three new critics):**
- **Brief: FAIL.** Material: the same add-to-bag focus loss, still present.
- **System: FAIL.**
  - Material: the AI imagery shows a generator-redrawn round badge, presented in the gallery as "The mark" and placed beside the real oval SVG in the values chapter.
  - Material: the largest motto instance (the hero h1) was set in Anton rather than the heritage lettering.
- **Craft: FAIL** (all 7 bar criteria passed).
  - Material: the desktop values halftone and colour layers had different crops and scales, so the tear joined two different pictures.
  - Material: the troop and One Camp chapters ran back to back with interchangeable imagery.

### C5 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C5`, served on :5179)
Changes from C4:
- **Hero motto:** now the founder-supplied hand-painted slogan (`gc-slogan-red.webp`) on a strip of GC White paper pasted over the film, with an sr-only h1. It lifts in with the lights and the paint sweeps across, then rests visible. The film gets its own "Illustrative AI film" label.
- **Approved mark retouched into photographs:** the approved vector mark (`gc-mark-ink.svg`) was composited over the AI badge in four stills: `hoodie-clean-v3`, `athlete-after-training-v2`, `gc-hood-detail-v3` and `lookbook-hood-up-v2`.
  - At the old circle's width the upright oval fully contains the old round badge. Stray red strokes were inpainted, with fabric shading and grain applied to the inks.
  - The gallery's "The mark" slide is now the approved white-and-red vector on charcoal.
  - The values overlay mark was removed; the photograph's chest carries the approved mark.
  - The concept dialog now says which images carry the approved mark and which only approximate it (the film, the prints and the other photographs).
- **Values halftone:** regenerated from the retouched colour photo (5px dot screen), so the layers align at every width. It is 81 KB lossless, down from 609 KB.
  - The desktop framing moved to 80% with a left-weighted shade, so the chest mark shows whole and bright and the words sit on the hood (checked at 1024, 1280, 1440 and 1920).
- **Chapter order:** film, hoodie, manifesto, values, troop, campaign wall, One Camp, sign-off. The wall now separates the two group chapters.
- **Focus:** the add buttons use `aria-disabled` while confirming, so the bag returns focus to the product. Remove focuses the empty-bag action; Finish focuses "Continue exploring". The film control is first in the hero's tab order.
- **System minors:**
  - Accordion focus uses the system's 2px ring.
  - Square gallery dots.
  - Barlow is no longer loaded.
  - PNG favicon and apple-touch fallbacks.
  - "Nevada · Est. 2023" everywhere.
  - The /teams hero label no longer shows "GC".
  - The sign-off slogan is level (as supplied).
  - Copy trims: "Wear what you stand for." removed, "Your bag is empty.", "Here's what is proposed".
- **Craft minors:**
  - Wall chips show the theme only.
  - The wall foot is tighter.
  - "ONE / CAMP." slides in 2vw, not 14vw.
  - The One Camp note doesn't break mid-phrase.
  - The phone menu is full width.
  - The phone sign-off has no forced full-screen height.
  - The sign-off has one action.
Evidence:
- `shots/C5/` at four widths, plus the desktop values at 1024, 1280 and 1920 and mid-seam frames.
- Interaction suite 54/54 on the frozen build.
- No film: lit at 350ms / 347ms.
- Hero action across a loop: 0 hidden, 0 focus lost.
- Anchors land flush with the bar visible; cross-page jumps work.
- Keyboard bag path: focus returns to the add button, Remove goes to "Explore the hoodie", Finish goes to "Continue exploring".
- Seam flush at four widths.
- Build ok; `tsc` clean; arrival tests 30/30; `oxlint` 2 errors, both pre-existing.

**C5 verdicts — round 5 (three new critics):**
- **Brief: PASS.** Minors:
  - Choosing a section from the menu sent focus back to the Menu button.
  - "Continue exploring" missed focus in 2 of 3 runs at 1440; the brief's Create/Edit had the same weakness.
  - The phone dock could cover focused gallery dots at 320×640.
  - A stalled film holds the dark intro up to 4s.
  - The film button changed both its label and its pressed state.
  - The image strip had a label but no role.
  - Main content stayed exposed to screen readers behind the menu.
- **System: FAIL.**
  - Material: photographs and film C5 had not retouched still showed the generator's own round badges — the film, the troop halves, the three prints (plus a generic pen-script slogan) and the /teams cutout.
  - Minors:
    - The chest mark was cut at 1280×800 and 768.
    - The 16px favicon's GC blurred.
    - The menu links showed focus as an underline.
    - Stray legacy greys remained in the dialogs.
    - Manhattan-style skylines.
    - "Own it." reads as fitness-ad copy.
- **Craft: FAIL** (6 of 7 bar criteria).
  - Material: bar 3 failed on phone — the values words were 15vw, and they sat on a black band below the photo instead of touching it.
  - Material: the hero's action and pause control landed on faces in the group shot, and the header wordmark ran through a head.
  - Minors:
    - An empty right half beside the Belonging headline.
    - The group-embrace idea recurs.
    - The 1920 values crop runs through the nose.
    - The phone sign-off reads quieter than "CAMP.".

### C6 — frozen 2026-09-29 (static build copy `scratchpad/frozen/C6`, served on :5180)
Changes from C5:
- **The approved mark everywhere, generator marks gone.** The supplied vector mark (`gc-mark-ink.svg`) was composited over every remaining AI badge:
  - the troop halves (`lookbook-court-dawn-v2`, `closing-huddle-portrait-v2`) and the /teams cutout (`gc-team-cutout-v2`);
  - the three prints (`gc-print-own-v3`, `gc-print-move-v4`, `gc-print-together-v4`), with the generic pen-script slogan erased;
  - both films (`gc-campaign-film-v9`, `gc-campaign-mobile-v9`, MP4 + VP9), their posters (`…-poster-v6`), the dim arrival stills (`…-v9`) and the inline first-frame bridges.
  - **Film method:** the badge is template-tracked with a rotated-ellipse fit, smoothed, composited per frame and weighted through the dissolves; red is keyed by chroma so the edges carry no fringe.
  - The concept dialog now says the supplied mark was placed wherever a mark appears, replacing the generator's version.
- **Hero off the faces.**
  - The film starts below a black masthead band the height of the bar, so no head passes under the wordmark or menu.
  - The slogan strip is smaller (56vw, max 860px) and sits at the foot, with the label above it. "Shop the hoodie" and the pause control share the strip's foot line on the right (desktop), or sit left/right under it (tablet, phone).
  - On short landscape screens (≤520px high), the copy stands on black beside the film.
  - Checked at 1440×900, 1280×720, 1920×1080, 1024×768, 768×1024, 390×844, 320×568, 844×390 and 1440×500, at film times 3.5 / 7.2 / 8.2 / 9.5 / 10.6s: no face under type or controls.
- **Values on upright screens (bar 3).** The photograph fills the stage and rises out of the room's dark. The words (17.5vw, ≥17vw at 390) stand in that dark and cross onto the hood above the face; the line sits at the foot beside the chest mark.
  - The photo's top edge follows the width, so the words always end at the hood's crown.
  - Checked at 320×568, 320×640, 360×780, 390×844, 412×915 and 768×1024.
  - Desktop words are now 11.6vw (max 224px), so 1920 also clears 11vw; the per-line slide was removed.
- **Belonging header (desktop):** the statement holds the top left and its echo answers from the right, filling the empty half.
- **Focus and accessibility:**
  - A section chosen from the menu takes focus once the sheet closes.
  - "Continue exploring", the brief's "Copy your brief" (after Create) and "Team or club name" (after Edit) take focus deterministically once the dialog's focus trap settles.
  - The menu links use the 2px outline.
  - `main` is inert while any overlay is open. Base UI leaves live regions exposed, which this closes.
  - The image strip is a labelled `section` carousel (this also cleared a pre-existing lint error).
  - The film button keeps one changing label, without `aria-pressed`.
  - The phone dock steps aside while focus is in the gallery.
- **System minors:**
  - Dialog greys mapped to GC tokens (a rendered-colour audit of menu, bag, checkout, confirmation, concept, brief and result finds 0 off-token colours).
  - Tab icons from the founder's no-GC mark (16/32 PNG + `favicon.ico`; apple-touch on GC White).
  - The mark slide in the gallery loses its grain.
  - "Finish demo checkout" stays on one line at 320.

## Imagery audit and generation briefs
The asset library covers every chapter; no new imagery was generated (no ChatGPT or image-generation tool is callable here).
Existing stills and the film were retouched for brand accuracy: the approved mark was composited over every AI badge and the values halftone was regenerated. The C5 and C6 entries above document this.
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
