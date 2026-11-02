# E-Summit 2027 cubes refresh — 2026-11-02

- Navigation uses the existing E-Summit 27 wordmark image instead of typed text.
- The E-shaped flame logo stays above the main title in its original position. The original moving fire animation appears in a separate panel below Register Now and Explore Events.
- One fixed React Bits Cubes background is shared across every 2027 route and section, including Team and Sponsorship. Opaque decorative section backgrounds were removed so the cubes remain visible. It replaces the full-screen fire background and synthwave floor. The original fire renderer is reused in the smaller panel, with its compact 30 fps quality tier, visibility pausing and reduced-motion fallback. There is no video file in the repository: the moving flame is a WebGL animation.
- Cubes uses the site's violet palette, cursor response and click ripples, with a darker central overlay for readable content. Link and button clicks do not trigger ripples.

Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Animations/Cubes

The upstream MIT + Commons Clause notice is included beside the adapted component. No extra runtime dependency was added. The component uses instanced WebGL, with local limits of 60 fps / 1.2 million pixels on desktop and 30 fps / 350,000 pixels on smaller or coarse-pointer devices. Pointer measurements are batched to rendered frames. Offscreen/hidden-tab rendering pauses, and reduced-motion preferences are handled live. A static purple pattern remains when WebGL is unavailable. Canvas loading waits until after the content entrance sequence.

Validation: the isolated preview production build and strict TypeScript checks pass, along with all eight existing animation scheduling/lifecycle tests. Real-device FPS is not measured by these tests.

## Coordinator lanyards and branding cleanup

- Overall Coordinators use React Bits Lanyard with existing portraits, purple branded straps and a wordmark on the back. Drag to swing; click, Enter or Space to flip. Contact links and names remain ordinary HTML below the canvas.
- Lanyards load near the viewport, cap rendering at 30 fps and pixel density, stop when settled, and pause offscreen or in hidden tabs. Reduced motion, image failures and WebGL failures retain static portraits. The upstream procedural Three.js implementation requires no additional runtime dependency.
- Removed the logo's loading shimmer, retaining its entrance and the original E-shaped flame mark above the title. The moving flame remains below the two buttons.
- Removed E-Cell and TBIF logo images throughout the home page, including its information cards and footer.

Lanyard source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/Lanyard

## Liquid glass cards

- Shared content cards (About, events, statistics, speakers, contact and sponsorship) use translucent neutral glass, a bright rim and static reflective highlights in place of the purple/black fill. Cubes remain visible through them.
- Blur is bounded to 10 px (5 px on mobile); moving marquee and nested cards use the same highlights without repeated backdrop filtering. Unsupported browsers get a readable neutral fallback. No new animation loop or dependency.
- Coordinator badges increase from size 0.54 to 0.68, with 420–560 px stages and a wider two-column section. Existing drag/flip, render limits and reduced-motion fallbacks remain.

## Transparent glass and staggered navigation

- Glass base opacity reduced from 32% to 12%, with lighter reflections. Blur reduced from 10 px to 4 px (5 px to 2 px on mobile) so more cube detail remains visible.
- Replaced desktop/mobile navigation with a site-adapted React Bits Staggered Menu: violet and deep-purple sliding layers, numbered staggered links and rotating plus toggle. Existing Poppins typography, wordmark, labels and destinations are preserved.
- Includes Escape/click-away dismissal, focus containment, inert closed links/background, route-change dismissal, scroll locking and live reduced-motion support. GSAP timelines are killed on interruption/unmount and run only during menu transitions.
- Preview uses GSAP 3.14.2, already required by the canonical app.

Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/StaggeredMenu

## Restored homepage tiles and Fontsource typography

- Restored the original purple perspective tile floor beneath the homepage content, alongside the persistent cubes. The E-shaped logo and moving flame keep their existing positions.
- Tile motion translates one pre-tiled CSS layer and uses the existing hero visibility observer to pause when hidden/offscreen. Reduced motion keeps a static floor.
- Replaced Lora/Poppins with Fontsource Space Grotesk variable headings and Manrope variable body/menu text. Added Noto Sans Devanagari 500 for the Hindi institute name. Fontsource packages pinned at 5.3.0; WOFF2 subsets and original SIL OFL licenses are committed.
- Fonts load locally using next/font with swap; English subsets total about 47 KB. No runtime font CDN request or extra renderer is needed.

## Corner flames and 2027 coordinators

- Moved moving fire from the center to the bottom-left and bottom-right of the homepage hero. The E-shaped brand logo stays above the title. Reserved space beneath actions keeps both flames clear of mobile buttons.
- Both fire scenes keep the compact 30 fps tier, adaptive quality, deferred loading and hidden/offscreen/reduced-motion handling. Each drawing buffer is capped at 175,000 pixels, sharing the previous center scene's 350,000-pixel maximum (two renderers still add some fixed overhead).
- Team lanyards now derive from the existing 2027 contacts: Chaitanya Kalme and Akash Muhal. Photos, LinkedIn URLs and emails come from the repository's E-Cell team directory. Removed Chaitanya's duplicate inherited Publicity Head entry. Homepage and sponsorship contact names remain consistent with the shared roster.

## Image clarity
- Coordinator textures request 960 px, quality-90 images instead of 600 px automatic-quality thumbnails. Grid portraits have a 2x source for high-density screens; all photos remain lazy loaded.
- Portrait faces use a colour-preserving unlit material without simulated grain, glare or tone mapping. Card edges, backs, clips and straps retain their 3D lighting.
- Lanyards keep the existing 30 fps / 600k desktop / 350k mobile motion budgets. On settling, one frame uses up to 2x DPR (1.4M desktop / 700k mobile pixels), then rendering sleeps. Dragging resumes the motion budget.
- Logo glow is a separate radial background. Entrance transforms finish at `none`, avoiding a retained scaled compositing layer. Existing logo artwork is unchanged: the available wordmark is 1218×219 and the flame is 347×551, so sharper master artwork would still improve fine detail.
- Validation: preview production build and eight animation/lifecycle tests pass.

## Scroll motion, typography and circular speakers carousel
- Native view-timeline reveals make section entrances follow scroll position, with IntersectionObserver fallback and reduced-motion/focus handling. A thin reading-progress line tracks the page without intercepting scrolling.
- Manrope (existing self-hosted Fontsource variable font) now handles headings and body; headings use restrained spacing, title case and semibold weight. One fewer active Latin font family is loaded.
- Previous speakers use the actual React Bits Circular Carousel, adapted from https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/CircularCarousel (license in `src/components/E-Summit-27/hero/REACT-BITS-LICENSE.md`). The CSS 3D cylinder supports swipe/drag, horizontal wheel, keyboard and visible previous/next buttons; normal vertical scrolling remains native.
- Carousel loads near the viewport, pauses offscreen/hidden, caps rendering at 60 fps, and sleeps when settled. Automatic rotation is off. Portraits use quality-90 640 px sources. A native scrollable photo list is the no-JS/loading/reduced-motion alternative.
- All changes are scoped to E-Summit 2027; existing flame positions, cube background, glass surfaces and coordinator cards remain.
