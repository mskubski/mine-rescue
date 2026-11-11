/**
 * sprites.ts – alle Grafiken als Pixel-Daten im Code
 *
 * Jedes Sprite ist ein Array von Zeichenketten; jedes Zeichen ist ein Pixel
 * und verweist auf einen Eintrag der zugehörigen Palette. '.' = transparent.
 * Keine externen Bilddateien, keine Original-Grafiken.
 *
 * Aus den Daten werden beim Start kleine Offscreen-Canvas erzeugt (makeSprite),
 * die der Renderer dann schnell auf den Bildschirm kopiert.
 */

import { COLORS } from './config';

/** Sprite-Beschreibung: Pixelzeilen + Farbpalette (Zeichen -> CSS-Farbe). */
export interface SpriteDef {
  rows: string[];
  palette: Record<string, string>;
}

/** Ein fertig gerendertes Sprite (normal und horizontal gespiegelt). */
export interface Sprite {
  w: number;
  h: number;
  normal: HTMLCanvasElement;
  flipped: HTMLCanvasElement;
}

/** Erzeugt aus einer SpriteDef die beiden Offscreen-Canvas. */
export function makeSprite(def: SpriteDef): Sprite {
  const h = def.rows.length;
  const w = def.rows[0].length;
  const normal = document.createElement('canvas');
  normal.width = w;
  normal.height = h;
  const flipped = document.createElement('canvas');
  flipped.width = w;
  flipped.height = h;
  const nctx = normal.getContext('2d')!;
  const fctx = flipped.getContext('2d')!;
  for (let y = 0; y < h; y++) {
    if (def.rows[y].length !== w) {
      throw new Error(`Sprite-Zeile ${y} hat ${def.rows[y].length} statt ${w} Zeichen`);
    }
    for (let x = 0; x < w; x++) {
      const color = def.palette[def.rows[y][x]];
      if (!color) continue; // '.' oder unbekannt = transparent
      nctx.fillStyle = color;
      nctx.fillRect(x, y, 1, 1);
      fctx.fillStyle = color;
      fctx.fillRect(w - 1 - x, y, 1, 1);
    }
  }
  return { w, h, normal, flipped };
}

// ---------------------------------------------------------------------------
// Spielfigur (8x16, blickt nach rechts; Rucksack links)
// ---------------------------------------------------------------------------

export const PLAYER_DEF: SpriteDef = {
  palette: {
    Y: '#ffd400', // Helm
    F: '#f0b888', // Gesicht
    B: '#3a6ee8', // Overall
    G: '#b0b0b0', // Rucksack
    K: '#6b3a12', // Stiefel
  },
  rows: [
    '..YYYY..',
    '.YYYYYY.',
    '.YFFFFY.',
    '..FFFF..',
    '..BBBB..',
    'GGBBBBB.',
    'GGBBBBB.',
    'GGBBBB..',
    '.GBBBB..',
    '..BBBB..',
    '..B..B..',
    '..B..B..',
    '..B..B..',
    '..B..B..',
    '..KK.KK.',
    '..KK.KK.',
  ],
};

// ---------------------------------------------------------------------------
// Kacheln (8x8)
// ---------------------------------------------------------------------------

/** Fels: braun mit dunklen Sprenkeln. */
export const ROCK_DEF: SpriteDef = {
  palette: { a: COLORS.rock, b: COLORS.rockDark },
  rows: [
    'aaaaaaba',
    'aabaaaaa',
    'aaaaabaa',
    'babaaaaa',
    'aaaabaab',
    'aabaaaaa',
    'aaaaaaba',
    'abaabaaa',
  ],
};

/** Lehm: hellere, gestreifte Wand (sprengbar). */
export const CLAY_DEF: SpriteDef = {
  palette: { a: COLORS.clay, b: COLORS.clayDark },
  rows: [
    'aaaaaaaa',
    'bbbbbbbb',
    'aaaaaaaa',
    'aaaaaaaa',
    'bbbbbbbb',
    'aaaaaaaa',
    'aaaaaaaa',
    'bbbbbbbb',
  ],
};

/** Lava: orange mit gelben Glutpunkten. */
export const LAVA_DEF: SpriteDef = {
  palette: { a: COLORS.lava, b: COLORS.lavaLight },
  rows: [
    'aabaaaaa',
    'aaaaaaba',
    'baaaaaaa',
    'aaaabaaa',
    'aaaaaaab',
    'abaaaaaa',
    'aaaabaaa',
    'aaaaaaba',
  ],
};

/** Wasser: blau mit hellen Wellenstrichen. */
export const WATER_DEF: SpriteDef = {
  palette: { a: COLORS.water, b: COLORS.waterLight },
  rows: [
    'aaaaaaaa',
    'aabbaaaa',
    'aaaaaaaa',
    'aaaaaabb',
    'aaaaaaaa',
    'bbaaaaaa',
    'aaaaaaaa',
    'aaaabbaa',
  ],
};
