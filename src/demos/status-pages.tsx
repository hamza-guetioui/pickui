"use client";

import StatusPages, { type StatusKind } from "../library/status-pages";

// The docs "version" switch picks the page: 404 · 500 · 503 · offline · 403.
export default function StatusPagesDemo({ variant = "404" }: { variant?: string }) {
  return <StatusPages status={variant as StatusKind} brand="Northwind" homeHref="#" />;
}
