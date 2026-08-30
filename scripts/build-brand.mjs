// Builds the brand assets from the company's own artwork.
//
//   node scripts/build-brand.mjs
//
// The mark used to be hand-drawn SVG paths approximating the seal. It is now
// cut from the seal itself, so the app carries the logo the company actually
// had designed rather than my redrawing of it.
//
// The seal prints the mark as navy line-work over a light photographic ground.
// Keying out everything that is not navy leaves the line-work alone on
// transparency — which is the mark, and it then sits on any surface.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("new adds");
const OUT = path.resolve("public/brand");
fs.mkdirSync(OUT, { recursive: true });

const SEAL = path.join(SRC, "WhatsApp Image 2026-08-28 at 10.52.14.jpeg");
const BUILDING = path.join(SRC, "ChatGPT Image Aug 30, 2026, 11_46_16 AM.png");

/** The TL shield inside the seal, measured off the artwork. */
const SHIELD = { left: 452, top: 210, width: 356, height: 440 };

const NAVY = { r: 0x12, g: 0x40, b: 0x7b };

/**
 * Keep the navy line-work, drop everything else.
 *
 * Alpha ramps with how far a pixel leans blue rather than switching at a
 * threshold, so the curves of the L and the shield's shoulders stay smooth
 * instead of going to stair-steps at 16px.
 */
async function keyToAlpha(input, tint) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lean = b - (r + g) / 2; // how blue, regardless of brightness
    const dark = 255 - Math.min(r, g, b);
    // Both matter: the ink is blue *and* dark. The building's glass is blue
    // but bright; the stonework is dark but grey. Neither survives this.
    const a = Math.max(0, Math.min(255, (lean - 12) * 6)) * Math.max(0, Math.min(1, (dark - 60) / 90));
    out[o] = tint.r;
    out[o + 1] = tint.g;
    out[o + 2] = tint.b;
    out[o + 3] = Math.round(a);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

const shield = await sharp(SEAL).extract(SHIELD).toBuffer();

// The mark in the brand navy, for light surfaces.
await (await keyToAlpha(shield, NAVY))
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(OUT, "mark.png"));

// The same mark in white, for navy surfaces — the marketing header and footer.
await (await keyToAlpha(shield, { r: 255, g: 255, b: 255 }))
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(path.join(OUT, "mark-light.png"));

// The favicon: the white mark on a navy tile. A navy line-mark alone disappears
// against a dark browser chrome, and a tab is the one place we cannot pick the
// background — so the icon brings its own.
const tile = 512;
const inner = Math.round(tile * 0.66);
const white = await (await keyToAlpha(shield, { r: 255, g: 255, b: 255 }))
  .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: { width: tile, height: tile, channels: 4, background: { ...NAVY, alpha: 1 } },
})
  .composite([{ input: white, gravity: "center" }])
  .png()
  .toFile(path.join(OUT, "icon-512.png"));

// The full seal, for the places with room to show the whole thing.
await sharp(SEAL).resize(600, 600).webp({ quality: 88 }).toFile(path.join(OUT, "seal.webp"));

// The headquarters cut-out, for marketing pages.
if (fs.existsSync(BUILDING)) {
  await sharp(BUILDING).resize(1200).webp({ quality: 82 }).toFile(path.join(OUT, "building.webp"));
}

for (const f of fs.readdirSync(OUT)) {
  const s = fs.statSync(path.join(OUT, f));
  console.log(`  ${f.padEnd(18)} ${(s.size / 1024).toFixed(0)}KB`);
}
