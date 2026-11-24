import type { Metadata, Viewport } from "next";
import { COMPONENTS } from "@/catalog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import UIChrome from "@/ui/UIChrome";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — components AI can't one-shot`, template: `%s` },
  description:
    "Free, hand-crafted React + Tailwind components with physics, 3D and tactile detail. Install with the shadcn CLI, copy one file, or paste an AI prompt.",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website" },
};

export const viewport: Viewport = { themeColor: "#080809", colorScheme: "dark light" };

/** Site shell: own header/footer, ⌘K search and dark/light theme (UIChrome). */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entries = COMPONENTS.map((c) => ({
    slug: c.slug,
    name: c.name,
    category: c.category,
    kind: c.kind ?? "component",
    tagline: c.tagline,
  }));
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <UIChrome entries={entries}>{children}</UIChrome>
      </body>
    </html>
  );
}
