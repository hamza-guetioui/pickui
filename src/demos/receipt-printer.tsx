"use client";

import ReceiptPrinter from "../library/receipt-printer";

export default function ReceiptPrinterDemo({ variant = "animated" }: { variant?: string }) {
  return (
    <ReceiptPrinter animated={variant !== "regular"}
      title="PICKUI DINER"
      meta="ORDER #0427 · TABLE 7"
      items={[
        { name: "Flat white", qty: 2, price: 3.5 },
        { name: "Bug-free code", price: 0 },
        { name: "Midnight deploy", price: 12 },
        { name: "Rubber duck", price: 4.25 },
      ]}
      taxRate={0.1}
      code="GX0427"
    />
  );
}
