"use client";

import { useEffect } from "react";
import { markSvg } from "./brand";

const icon = (spread: number) => `data:image/svg+xml,${encodeURIComponent(markSvg({ spread }))}`;
/** Plates breathe apart and back together (≈1 frame/s: background tabs throttle timers). */
const FRAMES = [0, 2, 4, 2].map(icon);
const AWAY_TITLE = "Pick one when you're back ✦";

/**
 * Site-wide Tab Tricks (the library's idea, tuned to be quiet): while the tab
 * is in the background the favicon's layers gently pull apart, and the title
 * alternates with one short line. Nothing is shown on the page; everything is
 * restored the moment the visitor returns. Reduced motion → a still icon.
 */
export default function TabTricks() {
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let link: HTMLLinkElement | null = null;
    let href = "";
    let title = "";
    let timer = 0;

    const away = () => {
      link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      href = link?.href ?? "";
      title = document.title;
      let i = 0;
      const tick = () => {
        if (link) link.href = FRAMES[still ? 2 : i % FRAMES.length];
        document.title = Math.floor(i / 4) % 2 ? title : AWAY_TITLE;
        i++;
      };
      tick();
      timer = window.setInterval(tick, 1000);
    };
    const back = () => {
      window.clearInterval(timer);
      timer = 0;
      if (link && href) link.href = href;
      if (title) document.title = title;
    };
    const onVis = () => (document.hidden ? away() : back());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      back();
    };
  }, []);
  return null;
}
