/**
 * main.ts – Einstiegspunkt von "Mine Rescue"
 *
 * Erzeugt das Spiel und betreibt den Game-Loop mit festem Zeitschritt:
 * Die Logik läuft immer in exakt 1/60-s-Schritten (Akkumulator), das Zeichnen
 * einmal pro requestAnimationFrame. So ist das Spieltempo auf jedem Monitor gleich.
 */

import { FIXED_DT_MS, MAX_FRAME_MS } from './config';
import { Game } from './game';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const game = new Game(canvas);

let last = performance.now();
let accumulator = 0;

/** Wird vom Browser vor jedem Bildaufbau aufgerufen. */
function frame(now: number): void {
  // Verstrichene Zeit begrenzen (z. B. nach Tab-Wechsel), sonst Aufholschleife.
  accumulator += Math.min(now - last, MAX_FRAME_MS);
  last = now;

  while (accumulator >= FIXED_DT_MS) {
    game.update();
    accumulator -= FIXED_DT_MS;
  }
  game.render();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
