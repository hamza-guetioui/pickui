import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-32 text-center">
      <p className="ui-faint font-mono text-xs uppercase tracking-[0.2em]">404</p>
      <h1 className="ui-ink mt-3 text-4xl font-black tracking-tight">Nothing here.</h1>
      <p className="ui-muted mt-3">That component doesn&apos;t exist (yet).</p>
      <Link href="/components" className="ui-invert mt-8 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold">
        Browse the library
      </Link>
    </div>
  );
}
