# E-Summit 2027 self-hosted fonts

Source project: https://github.com/fontsource/fontsource

Active typography (Fontsource packages, pinned at 5.3.0):
- `@fontsource-variable/space-grotesk`: Latin, weight axis 300–700, headings.
- `@fontsource-variable/manrope`: Latin, weight axis 200–800, body text, menu and controls.
- `@fontsource/noto-sans-devanagari`: Devanagari, weight 500, Hindi institute name.

Only the required WOFF2 subsets are bundled. `next/font/local` serves them with `display: swap`; no runtime request to Fontsource or Google is made. Hindi is not globally preloaded. Each font has its original SIL Open Font License alongside it.

Previous Lora and Poppins files from Fontsource 5.3.0 remain available for rollback but are no longer loaded by the 2027 layout.
