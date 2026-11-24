"use client";

import PromoPlane from "../library/promo-plane";
import FakeSite from "./_site";

export default function PromoPlaneDemo() {
  return (
    <FakeSite>
      <PromoPlane text="☀ Summer sale — 30% off everything →" delay={1} duration={12} every={16} dailyCap={0} storageKey="gx-promo-plane-demo" />
    </FakeSite>
  );
}
