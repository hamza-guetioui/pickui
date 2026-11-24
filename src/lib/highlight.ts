/**
 * Tiny TSX syntax highlighter (no dependency). Good enough for docs: comments,
 * strings, template literals, keywords, JSX tags, numbers, functions/types.
 */
export type Token = { k: "c" | "s" | "k" | "t" | "n" | "f" | "y" | "p"; v: string };

const KEYWORDS = new Set(
  "import export from default const let var function return if else for while do switch case break continue new typeof instanceof in of as type interface extends implements async await try catch finally throw class this null undefined true false void keyof readonly".split(
    " ",
  ),
);

const RE = new RegExp(
  [
    String.raw`(\/\/[^\n]*|\/\*[\s\S]*?\*\/)`, // 1 comment
    String.raw`("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|` + "`" + String.raw`(?:[^` + "`" + String.raw`\\]|\\.)*` + "`)", // 2 string
    String.raw`(<\/?)([A-Za-z][\w.]*)`, // 3,4 jsx tag
    String.raw`(\b\d+(?:\.\d+)?\b)`, // 5 number
    String.raw`([A-Za-z_$][\w$]*)(?=\s*\()`, // 6 call
    String.raw`([A-Za-z_$][\w$]*)`, // 7 identifier
  ].join("|"),
  "g",
);

export function highlight(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ k: "p", v: code.slice(last, i) });
    if (m[1]) out.push({ k: "c", v: m[1] });
    else if (m[2]) out.push({ k: "s", v: m[2] });
    else if (m[3]) {
      out.push({ k: "p", v: m[3] });
      out.push({ k: "t", v: m[4] });
    } else if (m[5]) out.push({ k: "n", v: m[5] });
    else if (m[6]) out.push({ k: KEYWORDS.has(m[6]) ? "k" : "f", v: m[6] });
    else if (m[7]) out.push({ k: KEYWORDS.has(m[7]) ? "k" : /^[A-Z]/.test(m[7]) ? "y" : "p", v: m[7] });
    last = i + m[0].length;
  }
  if (last < code.length) out.push({ k: "p", v: code.slice(last) });
  return out;
}

export const TOKEN_CLASS: Record<Token["k"], string> = {
  c: "text-neutral-500 italic",
  s: "text-[#62c073]",
  k: "text-[#f75f8f]",
  t: "text-[#52a8ff]",
  n: "text-[#ff990a]",
  f: "text-[#c472fb]",
  y: "text-[#e5c07b]",
  p: "",
};
