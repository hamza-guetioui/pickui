import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ExternalLink } from "lucide-react";
import { buildPrompt } from "../lib/prompt";
import { CATEGORY_ORDER, COMPONENTS, KIND_LABEL, KIND_ORDER, installCommand, installPath, registryUrl, variantsFor, type ComponentEntry } from "../catalog";
import { readComponentSource, readUsageSource } from "../lib/source";
import Code from "../ui/Code";
import CopyButton from "../ui/CopyButton";
import Playground from "../ui/Playground";
import Tabs from "../ui/Tabs";

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="group scroll-mt-24 text-xl font-semibold tracking-tight ui-ink">
      <a href={`#${id}`} className="outline-none focus-visible:underline">
        {children}
        <span className="ml-2 ui-faint opacity-0 transition group-hover:opacity-100" aria-hidden>
          #
        </span>
      </a>
    </h2>
  );
}

function Sidebar({ current }: { current: string }) {
  return (
    <nav aria-label="Components" className="ui-scroll sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 pr-2 text-sm">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 ui-muted hover:text-[rgb(var(--ui-ink))]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All components
      </Link>
      {KIND_ORDER.map((kind) => {
        const inKind = COMPONENTS.filter((c) => (c.kind ?? "component") === kind);
        if (!inKind.length) return null;
        return (
          <div key={kind} className="mb-6">
            <p className="ui-ink mb-3 text-xs font-semibold">{KIND_LABEL[kind]}</p>
            {CATEGORY_ORDER.map((cat) => {
              const list = inKind.filter((c) => c.category === cat);
              if (!list.length) return null;
              return (
                <div key={cat} className="mb-4">
                  <p className="ui-faint mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em]">{cat}</p>
                  <ul className="ui-line space-y-0.5 border-l">
                    {list.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={`/components/${c.slug}`}
                          aria-current={c.slug === current ? "page" : undefined}
                          className={`-ml-px block border-l py-1 pl-3 transition ${
                            c.slug === current
                              ? "border-[rgb(var(--ui-ink))] font-medium ui-ink"
                              : "border-transparent ui-muted hover:border-[rgb(var(--ui-ink)/0.4)] hover:text-[rgb(var(--ui-ink))]"
                          }`}
                        >
                          {c.name}
                          {c.isNew && (
                            <span className="ml-2 rounded bg-[rgb(var(--ui-accent)/0.15)] px-1.5 py-px text-[10px] font-semibold ui-accent">New</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

export default function ComponentDocView({ c }: { c: ComponentEntry }) {
  const source = readComponentSource(c.slug);
  const usage = c.usage ?? readUsageSource(c.slug, c.exportName);
  const extras = (c.includes ?? []).map((s) => ({ path: installPath(s), code: readComponentSource(s) }));
  const prompt = buildPrompt(c, source, usage, extras);
  const cmd = installCommand(c.slug);
  const v0 = `https://v0.dev/chat/api/open?url=${encodeURIComponent(registryUrl(c.slug))}`;
  const idx = COMPONENTS.findIndex((x) => x.slug === c.slug);
  const prev = COMPONENTS[idx - 1];
  const next = COMPONENTS[idx + 1];

  return (
    <div className="grid gap-10 pt-8 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <Sidebar current={c.slug} />
      </aside>

      <article className="min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs ui-faint">
          <Link href="/" className="hover:text-[rgb(var(--ui-ink))]">
            Components
          </Link>
          <span aria-hidden>/</span>
          <span>{c.category}</span>
        </nav>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] ui-ink sm:text-5xl">{c.name}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed ui-muted">{c.tagline}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Highlights">
          {["Zero dependencies", "React + Tailwind", "Accessible", "Reduced-motion aware"].map((b) => (
            <li key={b} className="inline-flex items-center gap-1.5 rounded-full border ui-line px-2.5 py-1 text-xs ui-muted">
              <Check className="h-3 w-3 ui-accent" aria-hidden /> {b}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <CopyButton text={prompt} label="Copy AI prompt" copiedLabel="Prompt copied" className="ui-invert border-transparent hover:opacity-85" />
          <CopyButton text={source} label="Copy code" />
          <a
            href={v0}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border ui-line ui-soft px-2.5 py-1.5 text-xs font-medium ui-ink transition hover:border-[rgb(var(--ui-ink)/0.25)] hover:text-[rgb(var(--ui-ink))]"
          >
            Open in v0 <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </div>

        {/* preview */}
        <section className="mt-10" aria-labelledby="preview">
          <h2 id="preview" className="sr-only">
            Preview
          </h2>
            <Playground
              slug={c.slug}
              height={c.kind === "template" ? 640 : c.previewHeight}
              fill={c.fill}
              scroll={c.kind === "template"}
              variants={variantsFor(c)}
              prompt={prompt}
              code={<Code code={source} filename={installPath(c.slug)} />}
            />
          <p className="mt-4 text-sm leading-relaxed ui-muted">{c.description}</p>
        </section>

        {/* installation */}
        <section className="mt-14 space-y-4">
          <H2 id="installation">Installation</H2>
          <Tabs
            items={[
              ...(c.npm
                ? [
                    {
                      id: "npm",
                      label: "npm",
                      content: (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[13px] text-neutral-200" style={{ "--ui-ink": "255 255 255" } as CSSProperties}>
                            <span className="ui-code ui-scroll min-w-0 overflow-x-auto whitespace-nowrap">
                              <span className="text-neutral-600">$ </span>npm i {c.npm}
                            </span>
                            <CopyButton text={`npm i ${c.npm}`} iconOnly label="Copy npm command" />
                          </div>
                          <p className="ui-muted flex items-center gap-2 text-sm">
                            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-500">Publishing soon</span>
                            Until it’s on npm, use the CLI or Manual tab. The API below stays the same.
                          </p>
                          {c.vanilla && <Code code={c.vanilla} filename="vanilla.ts · any framework" />}
                        </div>
                      ),
                    },
                  ]
                : []),
              {
                id: "cli",
                label: "CLI",
                content: (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 font-mono text-[13px] text-neutral-200" style={{ "--ui-ink": "255 255 255" } as CSSProperties}>
                      <span className="ui-code ui-scroll min-w-0 overflow-x-auto whitespace-nowrap">
                        <span className="ui-faint">$ </span>
                        {cmd}
                      </span>
                      <CopyButton text={cmd} iconOnly label="Copy command" />
                    </div>
                    <p className="text-sm ui-muted">
                      Uses the shadcn CLI. It creates <code className="rounded ui-soft px-1 font-mono text-xs">{installPath(c.slug)}</code> and
                      installs nothing else.
                    </p>
                  </div>
                ),
              },
              {
                id: "manual",
                label: "Manual",
                content: (
                  <ol className="space-y-4 text-sm ui-muted">
                    <li>
                      <p>
                        <span className="mr-2 font-mono ui-faint">1.</span>Make sure Tailwind CSS is set up (v3 or v4).
                      </p>
                    </li>
                    <li>
                      <p className="mb-3">
                        <span className="mr-2 font-mono ui-faint">2.</span>Create{" "}
                        <code className="rounded ui-soft px-1 font-mono text-xs">{installPath(c.slug)}</code> and paste:
                      </p>
                      <Code code={source} filename={installPath(c.slug)} collapsedHeight={260} />
                    </li>
                    <li>
                      <p>
                        <span className="mr-2 font-mono ui-faint">3.</span>Import it and use it (see Usage below).
                      </p>
                    </li>
                  </ol>
                ),
              },
            ]}
          />
        </section>

        {/* usage */}
        <section className="mt-14 space-y-4">
          <H2 id="usage">Usage</H2>
          <Code code={usage} filename="example.tsx" />
          <div className="flex flex-wrap gap-2">
            {(c.useCases ?? []).map((u) => (
              <span key={u} className="rounded-full border ui-line px-2.5 py-1 text-xs ui-muted">
                {u}
              </span>
            ))}
          </div>
        </section>

        {/* craft */}
        {(c.craft?.length ?? 0) > 0 && (
          <>
        <section className="mt-14 space-y-4">
          <H2 id="under-the-hood">Under the hood</H2>
          <p className="text-sm ui-muted">The details that make it feel right, and that a one-line prompt usually misses:</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {(c.craft ?? []).map((t, i) => (
              <li key={i} className="rounded-xl border ui-line ui-soft p-4 text-sm leading-relaxed ui-muted">
                <span className="mb-2 block font-mono text-[10px] ui-faint">0{i + 1}</span>
                {t}
              </li>
            ))}
          </ul>
        </section>
          </>
        )}

        {/* props */}
        <section className="mt-14 space-y-4">
          <H2 id="props">Props</H2>
          <div className="overflow-x-auto rounded-xl border ui-line">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b ui-line ui-soft text-xs ui-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Prop</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Default</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {c.props.map((p) => (
                  <tr key={p.name}>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs ui-ink">{p.name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#52a8ff]">{p.type}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs ui-muted">{p.default ?? "—"}</td>
                    <td className="px-4 py-2.5 ui-muted">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* a11y */}
        {(c.a11y?.length ?? 0) > 0 && (
          <>
        <section className="mt-14 space-y-4">
          <H2 id="accessibility">Accessibility</H2>
          <ul className="space-y-2 text-sm ui-muted">
            {(c.a11y ?? []).map((a) => (
              <li key={a} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 ui-accent" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
        </section>
          </>
        )}

        {/* prev / next */}
        <nav aria-label="More components" className="mt-16 grid gap-3 border-t ui-line pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/components/${prev.slug}`} className="rounded-xl border ui-line p-4 transition hover:border-[rgb(var(--ui-ink)/0.25)]">
              <span className="flex items-center gap-1 text-xs ui-faint">
                <ArrowLeft className="h-3 w-3" aria-hidden /> Previous
              </span>
              <span className="mt-1 block font-semibold ui-ink">{prev.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/components/${next.slug}`} className="rounded-xl border ui-line p-4 text-right transition hover:border-[rgb(var(--ui-ink)/0.25)]">
              <span className="flex items-center justify-end gap-1 text-xs ui-faint">
                Next <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
              <span className="mt-1 block font-semibold ui-ink">{next.name}</span>
            </Link>
          )}
        </nav>
      </article>

    </div>
  );
}
