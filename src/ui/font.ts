/**
 * ui/font.ts – winziger 3x5-Pixel-Zeichensatz
 *
 * Wird für Debug-Anzeige und Pause-Text benutzt. Jedes Zeichen besteht aus
 * 15 Zeichen ('1' = Pixel gesetzt), zeilenweise von oben links.
 * Neue Zeichen einfach in GLYPHS ergänzen (später: komplettes Alphabet fürs HUD).
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
  P: '111101111100100',
  A: '010101111101101',
  U: '101101101101111',
  S: '111100111001111',
  E: '111100111100111',
  R: '110101110101101',
  X: '101101010101101',
  Y: '101101010010010',
  ',': '000000000010100',
  ':': '000010000010000',
  ' ': '000000000000000',
};

/**
 * Zeichnet Text pixelgenau in den Canvas-Kontext.
 * Unbekannte Zeichen werden als Leerraum behandelt.
 * @param ctx   Zeichenkontext
 * @param text  Text (nur Großbuchstaben/Ziffern aus GLYPHS)
 * @param x     linke Kante in Pixeln
 * @param y     obere Kante in Pixeln
 * @param color CSS-Farbe
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
): void {
  ctx.fillStyle = color;
  let cx = Math.round(x);
  const cy = Math.round(y);
  for (const ch of text.toUpperCase()) {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    for (let i = 0; i < g.length; i++) {
      if (g[i] === '1') ctx.fillRect(cx + (i % GLYPH_W), cy + Math.floor(i / GLYPH_W), 1, 1);
    }
    cx += GLYPH_W + 1; // 1 Pixel Abstand
  }
}
