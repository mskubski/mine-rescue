/**
 * game.ts – Spielzustand und Orchestrierung
 *
 * Hält Level, Spielfigur und Eingabe zusammen. `update()` wird mit festem
 * Zeitschritt (60 Hz) aufgerufen, `render()` einmal pro Browser-Frame.
 *
 * Screen-Flip: Die Kamera zeigt immer den Raum (160x192), in dem sich die
 * Mitte der Spielfigur befindet. Verlässt die Figur den Raum, springt die
 * Ansicht sofort zum Nachbarraum – wie beim Original.
 */

import { Player } from './entities/player';
import { Input } from './input';
import { Level, LEVEL_DEFS } from './levels';
import { Renderer } from './renderer';
import { SCREEN_H, SCREEN_W } from './config';

export class Game {
  private input = new Input();
  private renderer: Renderer;
  private level: Level;
  private player = new Player();
  private paused = false;
  private debug = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.level = new Level(LEVEL_DEFS[0]);
    this.player.placeAtFeet(this.level.start.x, this.level.start.y);
  }

  /** Raum-Spalte der Kamera (aus der Figurenmitte, auf Levelgrenzen begrenzt). */
  private get roomX(): number {
    return clamp(Math.floor(this.player.centerX / SCREEN_W), 0, this.level.roomsX - 1);
  }
  /** Raum-Zeile der Kamera. */
  private get roomY(): number {
    return clamp(Math.floor(this.player.centerY / SCREEN_H), 0, this.level.roomsY - 1);
  }

  /** Ein fester Logik-Schritt (1/60 s). */
  update(): void {
    if (this.input.wasPressed('pause')) this.paused = !this.paused;
    if (this.input.wasPressed('debug')) this.debug = !this.debug;
    // 'mute' wird mit dem Sound in Meilenstein 6 verwendet.

    if (!this.paused) {
      this.player.update(this.input, this.level);
    }
    this.input.endFrame();
  }

  /** Zeichnet den aktuellen Zustand. */
  render(): void {
    const rx = this.roomX;
    const ry = this.roomY;
    this.renderer.drawFrame(this.level, this.player, rx, ry);
    if (this.debug) this.renderer.drawDebug(rx, ry, this.player);
    if (this.paused) this.renderer.drawPause();
  }
}

/** Begrenzt v auf den Bereich [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
