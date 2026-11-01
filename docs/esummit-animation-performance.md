# E-Summit animation optimization

The 2026 entry optimization is committed first. Subsequent animation work is scoped to E-Summit 2027, including its team and sponsorship pages. The visual design and content remain in place.

## 2026

- Delay the two background canvases until the entry overlay finishes exiting.
- Cache galaxy artwork and reuse it while retaining stars, dust and rotation.
- Stop the completed intro loop and pause background work when hidden or off-screen.
- Keep the original sequence duration, support reduced motion, and handle missing canvas/image resources.

## 2027

- Wait two seconds after hydration (the CSS entrance ends at 1.9 seconds), then schedule the fire canvas in idle time while the hero is visible. Remove the redundant WebGL probe/context.
- Pace fire rendering and pointer updates at up to 60 fps on desktop / 30 fps for mobile fire and coarse-pointer drift. Animation timing uses elapsed time instead of frame counts.
- Limit the initial fire buffer to 1.2 million pixels on desktop and 350,000 on mobile. Each lower tier reduces the pixel budget further; retain high quality on desktop initially.
- Require two consecutive slow sample windows before stepping down. Try every remaining quality tier before disabling the WebGL layer; keep measuring after a healthy window to handle later thermal throttling. The static artwork and CSS motion remain available if WebGL fails.
- Allocate mobile ember buffers for 260 points instead of 1,000; omit the unused mobile shard mesh from the scene.
- Stop RAF loops and pause decorative CSS loops off-screen, in hidden tabs, or for reduced motion. Resume without counting hidden time as slowdown.
- Batch pointer measurements to rendered frames instead of reading layout on each pointer event.
- Replace the 2027 Framer Motion reveal and React CountUp wrappers with native observers, CSS transitions and one clock per counter group. Final numbers remain accessible and server-rendered; reduced motion shows the final values immediately.
- Remove five unreferenced, zero-byte placeholders: `FireLoader.tsx`, `Hero26.tsx`, `LaptopIntro.tsx`, `assets.ts`, and `e26.css`. Removing these files is cleanup, not a measured runtime saving. Shared animation packages remain installed because other routes use them.

## Validation

Run with Node 24 (native TypeScript stripping) after installing dependencies:

```sh
node --test tests/esummit27-performance.test.mjs
```

Eight tests cover all quality tiers, mobile target cadence, recovery from a transient slowdown, continued adaptation, resume behavior, pacing at 60/90/120/144 Hz, render-buffer limits, and observer/visibility/preference cleanup.

The 2026 canvas harness also passed eight lifecycle/fallback checks. Its warm-frame instrumentation reduced arc calls from 5,373 to 918 and radial-gradient creation from 909 to 54; these counts are not browser FPS measurements.

Full `tsc --noEmit` diagnostics are unchanged from the baseline: existing errors concern Prisma configuration/generated client, a missing image declaration, and unrelated shared UI components. No new diagnostics were introduced in E-Summit 2027.

The original full-site `npm run build` was blocked by the missing generated Prisma client and Google Font download failures in this environment. The managed preview launcher also supplied unsupported `--host`/`--strictPort` flags to `next dev`. These were the initial validation limitations; the dedicated preview was subsequently deployed and checked as described below. Device FPS remains unmeasured.

Before deploying the full legacy application, generate the repository's Prisma client in its configured environment, resolve existing build blockers, and run a production build. Profile on a real phone to tune pixel budgets if needed.

## Dedicated 2027 live-preview build

The `preview/` app now builds the canonical 2027 public pages independently of the legacy registration/admin backend. Its production build passes TypeScript checking and prerenders all three existing 2027 routes. Lora and Poppins are now bundled locally with licenses. The original full-site build limitations above still apply to the legacy application; they do not block this dedicated preview build.

See `preview/README.md` for the GitHub/Vercel settings. The Vercel project `e-summit-27` in the `ScoreLab` team is connected to `deepakscorelab/E_Cell_Website`. A commit to `main` triggered a production deployment automatically and reached READY on 2026-11-01.

Live preview: https://e-summit-27-eight.vercel.app/E-Summit-27

Cloud deployment exposed two preview packaging issues: the bundler included legacy middleware, and Tailwind ignored generated sources. The build boundary is now scoped to `preview/`, and the prepare script explicitly registers generated sources with Tailwind. The preview's framework was updated to Next.js 16.4.3; its production build, eight animation tests, and npm audit (zero vulnerabilities) passed locally. Earlier full-site build limitations refer to the legacy application, not this preview. Real-device FPS remains unmeasured.

Live checks on 2026-11-01: the public URL returned HTTP 200 without credentials; desktop homepage and sponsorship styling rendered correctly; the mobile menu navigated to Team at a 390 px viewport with no horizontal overflow. The homepage had no failed loaded images, its fire canvas stayed within the configured pixel cap, and no browser console errors were captured during these checks. Team and sponsorship routes loaded through client navigation. Registration, event detail and other planned routes remain absent from the original 2027 source and are not implemented by this preview.
