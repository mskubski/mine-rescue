/**
 * ui/font.ts – winziger 3x5-Pixel-Zeichensatz
 *
 * Wird für HUD, Titel-, Game-Over- und Debug-Texte benutzt. Jedes Zeichen
 * besteht aus 15 Zeichen ('1' = Pixel gesetzt), zeilenweise von oben links.
 * Neue Zeichen einfach in GLYPHS ergänzen. Es gibt nur Großbuchstaben
 * (Kleinbuchstaben werden automatisch umgewandelt).
 */

/** Breite eines Zeichens in Pixeln. */
export const GLYPH_W = 3;
/** Höhe eines Zeichens in Pixeln. */
export const GLYPH_H = 5;

/** Zeichen -> 15-stelliges Pixelmuster (3 Spalten x 5 Zeilen). */
const GLYPHS: Record<string, string> = {
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '111001111100111',
  '3': '111001111001111',
  '4': '101101111001001',
  '5': '111100111001111',
  '6': '111100111101111',
  '7': '111001001001001',
  '8': '111101111101111',
  '9': '111101111001111',
  A: '010101111101101',
  B: '110101110101110',
  C: '011100100100011',
  D: '110101101101110',
  E: '111100111100111',
  F: '111100111100100',
  G: '011100101101011',
  H: '101101111101101',
  I: '111010010010111',
  J: '001001001101010',
  K: '101101110101101',
  L: '100100100100111',
  M: '101111111101101',
  N: '110101101101101',
  O: '010101101101010',
  P: '111101111100100',
  Q: '010101101111011',
  R: '110101110101101',
  S: '011100010001110',
  T: '111010010010010',
  U: '101101101101111',
  V: '101101101101010',
  W: '101101111111101',
  X: '101101010101101',
  Y: '101101010010010',
  Z: '111001010100111',
  '-': '000000111000000',
  '!': '010010010000010',
  '.': '000000000000010',
  '+': '000010111010000',
  ',': '000000000010100',
  ':': '000010000010000',
  ' ': '000000000000000',
};

/** Breite eines Textes in Pixeln (inkl. 1 Pixel Abstand pro Zeichen, ohne Abstand nach dem letzten). */
export function textWidth(text: string, scale = 1): number {
  return Math.max(0, text.length * (GLYPH_W + 1) - 1) * scale;
}

/**
 * Zeichnet Text pixelgenau in den Canvas-Kontext.
 * Unbekannte Zeichen werden als Leerraum behandelt.
 * @param ctx   Zeichenkontext
 * @param text  Text
 * @param x     linke Kante in Pixeln
 * @param y     obere Kante in Pixeln
 * @param color CSS-Farbe
 * @param scale Vergrößerung (ganzzahlig, Standard 1)
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1,
): void {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    for (let i = 0; i < g.length; i++) {
      if (g[i] === '1') {
        ctx.fillRect(cx + (i % GLYPH_W) * scale, cy + Math.floor(i / GLYPH_W) * scale, scale, scale);
      }
    }
    cx += (GLYPH_W + 1) * scale;
  }
}

/** Zeichnet Text waagerecht zentriert auf dem Bildschirm (Breite `screenW`). */
export function drawTextCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  screenW: number,
  y: number,
  color: string,
  scale = 1,
): void {
  drawText(ctx, text, (screenW - textWidth(text, scale)) / 2, y, color, scale);
}
