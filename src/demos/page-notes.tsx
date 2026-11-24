"use client";

import PageNotes from "../library/page-notes";
import FakeSite from "./_site";

export default function PageNotesDemo() {
  // hotkey off in the demo so typing elsewhere on this page doesn't place notes
  return (
    <FakeSite>
      <PageNotes storageKey="gx-notes:demo" hotkey={null} />
    </FakeSite>
  );
}
