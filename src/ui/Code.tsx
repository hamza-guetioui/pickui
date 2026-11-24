import { highlight, TOKEN_CLASS } from "../lib/highlight";
import CodeBlock from "./CodeBlock";

/** Server-highlighted code (no highlighter shipped to the client). */
export default function Code({ code, filename, collapsedHeight }: { code: string; filename?: string; collapsedHeight?: number }) {
  return (
    <CodeBlock code={code} filename={filename} collapsedHeight={collapsedHeight}>
      {highlight(code).map((t, i) =>
        t.k === "p" ? (
          t.v
        ) : (
          <span key={i} className={TOKEN_CLASS[t.k]}>
            {t.v}
          </span>
        ),
      )}
    </CodeBlock>
  );
}
