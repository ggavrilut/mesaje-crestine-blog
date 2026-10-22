// Renders the site's icons and default social card from src/brand/mark.svg into public/.
// Run after changing the mark: node bin/make-brand-images.ts. Uses sharp, which Astro
// installs for image optimisation; the card's text is drawn with the machine's serif font
// (DejaVu Serif), so check its ș and ț after regenerating.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('..', import.meta.url).pathname;
const mark = await readFile(`${ROOT}src/brand/mark.svg`, 'utf8');
const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 72 * (size / 64) }).resize(size, size).png().toBuffer();

/** An .ico holding PNG images, which every current browser reads. */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size % 256, e);
    header.writeUInt8(size % 256, e + 1);
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

// The card: 1200x630 (docs/seo.md, social cards), the mark beside the name.
const inner = mark.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replace(/id="bg"/, 'id="markbg"').replace(/url\(#bg\)/, 'url(#markbg)');
const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="cardbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#082f33"/>
      <stop offset="1" stop-color="#17696a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#cardbg)"/>
  <g fill="#9fd8cb" opacity="0.07">
    <circle cx="1080" cy="90" r="230"/><circle cx="930" cy="560" r="150"/><circle cx="110" cy="600" r="110"/>
  </g>
  <svg x="110" y="215" width="200" height="200" viewBox="0 0 64 64">${inner}</svg>
  <g font-family="DejaVu Serif" fill="#f6f1e7">
    <text x="360" y="305" font-size="78" font-weight="bold">Mesaje Creștine</text>
    <text x="362" y="370" font-size="32" fill="#bfe6dc">Meditații, predici și scrieri creștine</text>
    <text x="362" y="420" font-size="26" fill="#8fc3b8">mesaje-crestine.ro</text>
  </g>
</svg>`;

const square = mark.replace('rx="14"', 'rx="0"'); // iOS rounds the corners itself
await writeFile(`${ROOT}public/favicon.svg`, mark);
await writeFile(`${ROOT}public/favicon.ico`, ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(mark, size) })))));
await writeFile(`${ROOT}public/apple-touch-icon.png`, await png(square, 180));
await writeFile(`${ROOT}public/og-default.png`, await sharp(Buffer.from(card)).png({ compressionLevel: 9 }).toBuffer());
console.log('wrote public/favicon.svg, favicon.ico, apple-touch-icon.png, og-default.png');
