# E-Summit 2027 live preview

Live site: https://e-summit-27-eight.vercel.app/E-Summit-27

Vercel project: `e-summit-27` in the `ScoreLab` team. The GitHub connection is active: commits to `main` have automatically triggered production deployments.

This build serves the existing 2027 homepage, team and sponsorship pages without the legacy registration/admin backend. Registration and other planned pages are not implemented in the source repository yet.

Edit the canonical files in `src/app/E-Summit-27`, `src/components/E-Summit-27`, `src/context/E-Summit-27` and `public/E-Summit-27` at the repository root. The prepare script copies them into ignored build directories on every build. Do not edit generated `preview/src` or `preview/public` files.

Vercel settings:

- Git repository: `deepakscorelab/E_Cell_Website`
- Production branch: `main`
- Root directory: `preview`
- Include source files outside the root directory: enabled
- Framework: Next.js
- Node.js: 24.x
- Install command: `npm ci`
- Build command: `npm run build`

After setup, each push to `main` creates a new live deployment. The last successful deployment remains live if a build fails. Feature branches receive separate preview deployments. No database credentials are needed for these public pages.

Locally, run `npm ci` then `npm run dev` inside this directory. The preview uses root-relative URLs; the original campus build retains its `/e-cell` prefix unless `NEXT_PUBLIC_ESUMMIT_PREFIX` is explicitly set.

Validation: `npm run build` passes with strict TypeScript checking and prerenders the homepage, team and sponsorship routes. Lora and Poppins are bundled locally under `public/E-Summit-27/fonts` with their licenses, so builds do not fetch Google Fonts. The isolated preview uses Next.js 16.4.3, with zero reported npm audit vulnerabilities on 2026-11-01.

The bundler and file tracing are scoped to this directory to exclude legacy middleware. The prepare script explicitly registers the generated sources with Tailwind because those directories are gitignored.
