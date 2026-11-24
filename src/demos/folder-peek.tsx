"use client";

import FolderPeek, { type FolderVariant } from "../library/folder-peek";

export default function FolderPeekDemo({ variant = "classic" }: { variant?: string }) {
  return (
    <FolderPeek
      label={variant === "davinci" ? "Codice Atlantico" : "Case studies"}
      variant={variant as FolderVariant}
      files={[
        { name: "Brand-refresh.pdf", meta: "PDF · 2.4 MB", color: "#ef4444" },
        { name: "Dashboard.fig", meta: "Figma · 18 frames", color: "#a855f7" },
        { name: "Launch-notes.md", meta: "Markdown · 4 KB", color: "#22c55e" },
      ]}
    />
  );
}
