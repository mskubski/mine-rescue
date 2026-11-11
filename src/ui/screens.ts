/**
 * ui/screens.ts – Titel-, Bonus-, Game-Over- und Sieg-Bildschirm
 *
 * Reine Zeichenfunktionen ohne Spiellogik. Alle Texte sind englisch/kurz, weil
 * der 3x5-Pixelfont keine Umlaute hat. Das Zeichnen der Grafiken (Figur, Fels)
 * übernimmt der Renderer (drawTitleArt); hier steht nur der Text.
 */

import { COLORS, SCREEN_W } from '../config';
import { drawText, drawTextCentered } from './font';

/** Ergebnis der Level-Wertung für den Bonus-Bildschirm. */
export interface LevelResult {
  levelNumber: number;
  rescue: number;
  energyBonus: number;
  dynamiteBonus: number;
  total: number;
}

/** Zahl als 6-stellige Punkteanzeige ("001230"). */
export function formatScore(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(6, '0');
}

/** Blinkt der Hinweistext gerade sichtbar? (alle ~0,5 s umschalten) */
function blink(tick: number): boolean {
  return Math.floor(tick / 30) % 2 === 0;
}

/** Überschrift mit versetztem Schatten. */
function title(ctx: CanvasRenderingContext2D, text: string, y: number, scale: number): void {
  drawTextCentered(ctx, text, SCREEN_W + 1, y + 1, COLORS.titleShadow, scale);
  drawTextCentered(ctx, text, SCREEN_W, y, COLORS.title, scale);
}

/** Titelbildschirm mit Highscore und Steuerungshinweis. */
export function drawTitleScreen(ctx: CanvasRenderingContext2D, highScore: number, tick: number): void {
  title(ctx, 'MINE', 18, 4);
  title(ctx, 'RESCUE', 44, 4);
  drawTextCentered(ctx, `HIGH ${formatScore(highScore)}`, SCREEN_W, 136, COLORS.highlight);
  if (blink(tick)) drawTextCentered(ctx, 'PRESS SPACE', SCREEN_W, 150, COLORS.text);
  drawTextCentered(ctx, 'ARROWS OR WASD: MOVE', SCREEN_W, 166, COLORS.hudLine);
  drawTextCentered(ctx, 'SPACE: LASER  E: DYNAMITE', SCREEN_W, 174, COLORS.hudLine);
}

/** Bonus-Bildschirm nach der Rettung. `ready` = Weiter-Taste ist freigeschaltet. */
export function drawLevelComplete(
  ctx: CanvasRenderingContext2D,
  r: LevelResult,
  ready: boolean,
  tick: number,
): void {
  title(ctx, 'RESCUED!', 24, 3);
  drawTextCentered(ctx, `LEVEL ${r.levelNumber} COMPLETE`, SCREEN_W, 52, COLORS.highlight);
  const line = (label: string, value: number, y: number, color: string): void => {
    drawText(ctx, label, 20, y, color);
    const v = String(value);
    drawText(ctx, v, 140 - v.length * 4, y, color);
  };
  line('RESCUE', r.rescue, 74, COLORS.text);
  line('POWER', r.energyBonus, 86, COLORS.text);
  line('DYNAMITE', r.dynamiteBonus, 98, COLORS.text);
  line('TOTAL', r.total, 114, COLORS.title);
  if (ready && blink(tick)) drawTextCentered(ctx, 'PRESS SPACE', SCREEN_W, 146, COLORS.text);
}

/** Game-Over-Bildschirm. */
export function drawGameOver(
  ctx: CanvasRenderingContext2D,
  score: number,
  highScore: number,
  newRecord: boolean,
  ready: boolean,
  tick: number,
): void {
  title(ctx, 'GAME', 40, 3);
  title(ctx, 'OVER', 62, 3);
  drawTextCentered(ctx, `SCORE ${formatScore(score)}`, SCREEN_W, 100, COLORS.text);
  drawTextCentered(
    ctx,
    newRecord ? 'NEW HIGH SCORE!' : `HIGH ${formatScore(highScore)}`,
    SCREEN_W,
    112,
    COLORS.highlight,
  );
  if (ready && blink(tick)) drawTextCentered(ctx, 'PRESS SPACE', SCREEN_W, 146, COLORS.text);
}

/** Sieg-Bildschirm nach dem letzten Level. */
export function drawVictory(
  ctx: CanvasRenderingContext2D,
  score: number,
  newRecord: boolean,
  ready: boolean,
  tick: number,
): void {
  title(ctx, 'ALL', 28, 3);
  title(ctx, 'MINERS', 50, 3);
  title(ctx, 'SAVED!', 72, 3);
  drawTextCentered(ctx, 'CONGRATULATIONS', SCREEN_W, 104, COLORS.highlight);
  drawTextCentered(ctx, `SCORE ${formatScore(score)}`, SCREEN_W, 118, COLORS.text);
  if (newRecord) drawTextCentered(ctx, 'NEW HIGH SCORE!', SCREEN_W, 130, COLORS.title);
  if (ready && blink(tick)) drawTextCentered(ctx, 'PRESS SPACE', SCREEN_W, 150, COLORS.text);
}
