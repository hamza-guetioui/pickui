/** Vercel-style "+" crosshairs on the four corners of a bordered box (parent must be `relative`). */
export function Crosshairs() {
  const pos = ["-left-[7px] -top-[7px]", "-right-[7px] -top-[7px]", "-bottom-[7px] -left-[7px]", "-bottom-[7px] -right-[7px]"];
  return (
    <>
      {pos.map((p) => (
        <svg key={p} aria-hidden viewBox="0 0 14 14" className={`pointer-events-none absolute z-10 h-3.5 w-3.5 ui-faint ${p}`}>
          <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}
