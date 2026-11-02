# E-Summit 2027 design refinement

Surface: the existing E-Summit 2027 marketing site (Persuade), with Team and Sponsorship inheriting the shared visual system. This is a refinement, not a new identity. E-Summit 2026 is outside scope.

## Pinned identity
- Preserve the existing logo artwork and flame emblem position, the two corner fire animations, moving hero tile floor, purple React Bits cubes throughout the site, transparent liquid-glass surfaces, Staggered Menu, coordinator lanyards and Circular Carousel.
- Use existing self-hosted Fontsource Manrope and the site's purple palette.
- Preserve names, contacts, institutional descriptions, data, speaker history and event content.

## Findings and changes
- Keep the shared cube field clearly visible at .75 opacity. The earlier .30 opacity and dark vignette made it look blacked out; remove the vignette and the tile floor's dark wash. The static fallback also stays visible across the viewport. Quieter tile-floor lines keep the same motion.
- Repeated kickers, two-tone titles, gradient rules and arbitrary event numbers added decoration without conveying structure. Remove decorative kickers/rules/numbers; make headings one clear foreground tone.
- Three equal institutional cards produced narrow, dense paragraphs with uneven heights. Use wide glass rows with identity on the left and 16–17px body copy up to 70ch on the right; stack naturally on mobile.
- Five floating statistic cards repeated the same container. Present the existing values in one ruled band. Keep the count-up effect.
- Contact information was fragmented across several centered cards. Group the existing email and coordinator details into a single glass surface without nested cards.
- Use a restrained type scale: section headings 2.15–3.5rem, display headings no larger than 6rem, neutral-white headings, readable lavender secondary text and a solid lilac primary button with dark text.
- Establish shared section spacing (4–7rem), content width (1184px), 16px surface corners, quieter glass rims and 48px primary controls. Preserve obvious focus states.
- Keep event cards as a two-column catalog with meaningful category labels; remove decorative numbering and 3D tilting of reading surfaces.
- Explore Events now opens the existing homepage event section. Registration and individual event-detail destinations remain the existing unfinished routes; this design pass does not add registration functionality.

## Motion and verification
No new renderer or dependency. Existing visibility pausing, reduced-motion handling, frame budgets and lazy loading remain. Typography and visual hierarchy are improved without adding animation cost.

Impeccable's launcher was unavailable in this environment; its polish and craft guidance was applied through direct source and browser review. No automated Impeccable detector result is claimed.

Fragment navigation lays out section content before jumping, avoiding incorrect positions from skipped-content height estimates. This does not disable canvas visibility pausing or lazy image loading. Desktop/mobile layouts, native section navigation, build and the eight animation tests were checked.
