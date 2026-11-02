# E-Summit 2027 cubes refresh — 2026-11-02

- Navigation uses the existing E-Summit 27 wordmark image instead of typed text.
- The E-shaped flame logo stays above the main title in its original position. The original moving fire animation appears in a separate panel below Register Now and Explore Events.
- React Bits Cubes replaces the full-screen fire background and synthwave floor. The original fire renderer is reused in the smaller panel, with its compact 30 fps quality tier, visibility pausing and reduced-motion fallback. There is no video file in the repository: the moving flame is a WebGL animation.
- Cubes uses the site's violet palette, cursor response and click ripples, with a darker central overlay for readable content. Link and button clicks do not trigger ripples.

Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Animations/Cubes

The upstream MIT + Commons Clause notice is included beside the adapted component. No extra runtime dependency was added. The component uses instanced WebGL, with local limits of 60 fps / 1.2 million pixels on desktop and 30 fps / 350,000 pixels on smaller or coarse-pointer devices. Pointer measurements are batched to rendered frames. Offscreen/hidden-tab rendering pauses, and reduced-motion preferences are handled live. A static purple pattern remains when WebGL is unavailable. Canvas loading waits until after the content entrance sequence.

Validation: the isolated preview production build and strict TypeScript checks pass, along with all eight existing animation scheduling/lifecycle tests. Real-device FPS is not measured by these tests.
