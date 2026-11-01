import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const preview = path.join(root, "preview");
// Only these generated preview directories are replaced. Canonical sources stay in src/.
for (const directory of ["src", "public"]) {
  await rm(path.join(preview, directory), { recursive: true, force: true });
}
for (const directory of ["app", "components", "context"]) {
  await mkdir(path.join(preview, "src", directory), { recursive: true });
  await cp(path.join(root, "src", directory, "E-Summit-27"), path.join(preview, "src", directory, "E-Summit-27"), { recursive: true });
}
// Generated sources are gitignored, so Tailwind must scan them explicitly.
const globalStyles = await readFile(path.join(root, "src/app/globals.css"), "utf8");
await writeFile(path.join(preview, "src/app/globals.css"), `${globalStyles}\n@source "../";\n`);
await mkdir(path.join(preview, "public"), { recursive: true });
await cp(path.join(root, "public/E-Summit-27"), path.join(preview, "public/E-Summit-27"), { recursive: true });
await writeFile(path.join(preview, "src/app/layout.tsx"), `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body className="dark antialiased min-h-screen">{children}</body></html>;
}
`);
await writeFile(path.join(preview, "src/app/page.tsx"), `import { redirect } from "next/navigation";
export default function Home() { redirect("/E-Summit-27"); }
`);
console.log("Prepared E-Summit 2027 preview from canonical repository sources.");
