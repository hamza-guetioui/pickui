"use client";

import TicketTear from "../library/ticket-tear";

export default function TicketTearDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <TicketTear animated={variant !== "regular"}
      kicker="Admit one"
      event="Build Night '26"
      venue="Hall B"
      date="Sat · 21:00"
      seat="GA-14"
      code="GX-0427"
      stamp="Admitted"
      accent="#f97316"
    />
  );
}
