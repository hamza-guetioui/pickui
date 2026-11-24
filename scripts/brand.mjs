// Regenerates the static brand files from src/ui/brand.ts:
//   src/app/icon.svg (favicon) and .github/logo.svg (README).
// Run: node --experimental-strip-types scripts/brand.mjs
import fs from "node:fs";
import { markSvg } from "../src/ui/brand.ts";

fs.writeFileSync("src/app/icon.svg", markSvg() + "\n");
fs.mkdirSync(".github", { recursive: true });
fs.writeFileSync(".github/logo.svg", markSvg({ base: "#52525b", mid: "#8b8b94" }) + "\n");
console.log("✓ wrote src/app/icon.svg and .github/logo.svg");
