/**
 * game.ts – Spielzustand und Orchestrierung
 *
 * Hält Level, Spielfigur, Laser, Dynamit und Eingabe zusammen. `update()` wird
 * mit festem Zeitschritt (60 Hz) aufgerufen, `render()` einmal pro Browser-Frame.
 *
 * Screen-Flip: Die Kamera zeigt immer den Raum (160x176 + HUD), in dem sich die
 * Mitte der Spielfigur befindet. Verlässt die Figur den Raum, springt die
 * Ansicht sofort zum Nachbarraum – wie beim Original.
 */

import { Dynamite } from './entities/dynamite';
import { Laser } from './entities/laser';
import { Player } from './entities/player';
import { ENERGY_LASER_COST, ENERGY_MAX, PLAYER_H, ROOM_PX_H, SCREEN_W } from './config';
import { Input } from './input';
import { Level, LEVEL_DEFS } from './levels';
import { Renderer } from './renderer';

export class Game {
  private input = new Input();
  private renderer: Renderer;
  private level: Level;
  private player = new Player();
  private laser = new Laser();
  /** Aktiver Dynamit-Stab (es liegt immer höchstens einer). */
  private dynamite: Dynamite | null = null;
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
    return clamp(Math.floor(this.player.centerY / ROOM_PX_H), 0, this.level.roomsY - 1);
  }

  /** Ein fester Logik-Schritt (1/60 s). */
  update(): void {
    if (this.input.wasPressed('pause')) this.paused = !this.paused;
    if (this.input.wasPressed('debug')) this.debug = !this.debug;
    // 'mute' wird mit dem Sound in Meilenstein 6 verwendet.

    if (!this.paused) {
      this.player.update(this.input, this.level);
      this.updateWeapons();
    }
    this.input.endFrame();
  }

  /** Laser und Dynamit: Eingabe auswerten, Objekte fortschreiben, Treffer prüfen. */
  private updateWeapons(): void {
    const p = this.player;

    // Laser: Dauerfeuer bei gehaltener Taste, kostet Energie
    if (this.input.isDown('laser') && this.laser.ready && p.energy > 0) {
      this.laser.fire();
      p.energy = Math.max(0, p.energy - ENERGY_LASER_COST);
    }
    this.laser.update(p, this.level);

    // Dynamit legen: nur am Boden, nur ein Stab gleichzeitig
    if (this.input.wasPressed('dynamit') && p.dynamite > 0 && !this.dynamite && p.onGround) {
      p.dynamite--;
      this.dynamite = new Dynamite(p.centerX, p.y + PLAYER_H - 3);
    }
    if (this.dynamite) {
      this.dynamite.update(this.level);
      if (this.dynamite.hits(p.box)) this.killPlayer();
      if (this.dynamite?.finished) this.dynamite = null;
    }
  }

  /**
   * Figur stirbt. PLATZHALTER bis Meilenstein 5 (Leben/Game Over):
   * Figur wird am Start neu gesetzt und die Energie aufgefüllt.
   */
  private killPlayer(): void {
    this.player.placeAtFeet(this.level.start.x, this.level.start.y);
    this.player.energy = ENERGY_MAX;
    this.dynamite = null;
  }

  /** Zeichnet den aktuellen Zustand. */
  render(): void {
    const rx = this.roomX;
    const ry = this.roomY;
    const r = this.renderer;
    r.beginFrame(this.level, rx, ry);
    if (this.dynamite) r.drawDynamite(this.dynamite);
    r.drawPlayer(this.player);
    r.drawLaser(this.laser);
    r.drawHud(this.player);
    if (this.debug) r.drawDebug(rx, ry, this.player);
    if (this.paused) r.drawPause();
  }
}

/** Begrenzt v auf den Bereich [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
