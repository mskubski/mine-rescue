/**
 * scripts/make-icons.mjs – erzeugt die PWA-Icons (PNG) ohne Abhängigkeiten
 *
 * Aufruf: node scripts/make-icons.mjs
 * Zeichnet ein 16x16-Pixelbild (Bergmann mit Helm und Rucksack) und skaliert es
 * ohne Glättung auf 192/512 px. Ergebnis: public/icons/*.png (eingecheckt;
 * das Skript muss nur bei Änderungen am Bild erneut laufen).
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

// 16x16-Pixelbild; Zeichen -> Farbe
const PAL = { '.': '#2a1a0a', R: '#8a5a2b', Y: '#ffd400', F: '#f0b888', B: '#3a6ee8', G: '#b0b0b0', K: '#6b3a12', O: '#ff8000' };
const ART = [
  'RRRRRRRRRRRRRRRR',
  'R..............R',
  'R....YYYY......R',
  'R...YYYYYY.....R',
  'R...YFFFFY.....R',
  'R....FFFF......R',
  'R....BBBB......R',
  'R..GGBBBBB.....R',
  'R..GGBBBBB..O..R',
  'R..GGBBBB..OO..R',
  'R...GBBBB.OOO..R',
  'R....BBBB..O...R',
  'R....B..B......R',
  'R....B..B......R',
  'R....KK.KK.....R',
  'RRRRRRRRRRRRRRRR',
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/** Rendert das Bild auf size x size; `inset` = Anteil Rand ringsum (für maskable). */
function render(size, inset = 0) {
  const px = Buffer.alloc(size * size * 3);
  const bg = hex(PAL['.']);
  const inner = Math.round(size * (1 - 2 * inset));
  const off = Math.round(size * inset);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let c = bg;
      const ix = x - off;
      const iy = y - off;
      if (ix >= 0 && iy >= 0 && ix < inner && iy < inner) {
        const ch = ART[Math.floor((iy * 16) / inner)][Math.floor((ix * 16) / inner)];
        c = hex(PAL[ch]);
      }
      px.set(c, (y * size + x) * 3);
    }
  }
  return px;
}

// --- minimaler PNG-Encoder (RGB, 8 Bit) ---
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(size, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // Bit-Tiefe
  ihdr[9] = 2; // Farbtyp RGB
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // Filter: keiner
    rgb.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', png(192, render(192)));
writeFileSync('public/icons/icon-512.png', png(512, render(512)));
// maskable: Motiv im inneren 60 % (Sicherheitszone), Rand in Hintergrundfarbe
writeFileSync('public/icons/icon-maskable-512.png', png(512, render(512, 0.2)));
console.log('Icons geschrieben: public/icons/');
