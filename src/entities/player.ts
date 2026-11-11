/**
 * entities/player.ts – die Spielfigur mit Heli-Rucksack
 *
 * Bewegung: am Boden laufen, mit "hoch" steigt/schwebt die Figur (Rucksack),
 * ohne Schub fällt sie. Kollision gegen feste Kacheln erfolgt achsenweise
 * (erst X, dann Y), damit Wände und Böden sauber und ohne Zittern wirken.
 *
 * Position (x, y) = obere linke Ecke der Kollisionsbox in Welt-Pixeln.
 */

import {
  AIR_SPEED,
  DIVE_ACCEL,
  GRAVITY,
  MAX_FALL_SPEED,
  MAX_RISE_SPEED,
  PLAYER_H,
  PLAYER_W,
  THRUST,
  TILE,
  WALK_SPEED,
} from '../config';
import type { Input } from '../input';
import type { Level } from '../levels';

export class Player {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  /** Blickrichtung: 1 = rechts, -1 = links. */
  facing: 1 | -1 = 1;
  /** Steht die Figur auf festem Boden? */
  onGround = false;
  /** Schiebt der Rucksack gerade (für Animation/Sound später)? */
  thrusting = false;

  /** Setzt die Figur mit den Füßen mittig auf (fx, fy) = Mitte-unten. */
  placeAtFeet(fx: number, fy: number): void {
    this.x = fx - PLAYER_W / 2;
    this.y = fy - PLAYER_H;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
  }

  /** Mitte der Kollisionsbox (für Raumbestimmung). */
  get centerX(): number {
    return this.x + PLAYER_W / 2;
  }
  get centerY(): number {
    return this.y + PLAYER_H / 2;
  }

  /** Ein Logik-Schritt: Eingabe -> Geschwindigkeit -> Bewegung mit Kollision. */
  update(input: Input, level: Level): void {
    const left = input.isDown('links');
    const right = input.isDown('rechts');
    const up = input.isDown('hoch');
    const down = input.isDown('runter');

    // --- Horizontal: direkte Steuerung (Atari-typisch, ohne Trägheit) ---
    const speed = this.onGround ? WALK_SPEED : AIR_SPEED;
    this.vx = 0;
    if (left && !right) {
      this.vx = -speed;
      this.facing = -1;
    } else if (right && !left) {
      this.vx = speed;
      this.facing = 1;
    }

    // --- Vertikal: Rucksack-Schub oder Schwerkraft ---
    this.thrusting = up;
    if (up) {
      this.vy = Math.max(this.vy - THRUST, -MAX_RISE_SPEED);
    } else {
      this.vy = Math.min(this.vy + GRAVITY + (down ? DIVE_ACCEL : 0), MAX_FALL_SPEED);
    }

    // --- Bewegung mit Kollision, Achse für Achse ---
    this.moveX(level, this.vx);
    this.moveY(level, this.vy);
  }

  /** Bewegt in X und stoppt an festen Kacheln. */
  private moveX(level: Level, dx: number): void {
    if (dx === 0) return;
    this.x += dx;
    if (!this.collides(level)) return;
    // Auf die Kante der getroffenen Kachel zurücksetzen.
    if (dx > 0) {
      this.x = Math.floor((this.x + PLAYER_W) / TILE) * TILE - PLAYER_W;
    } else {
      this.x = (Math.floor(this.x / TILE) + 1) * TILE;
    }
  }

  /** Bewegt in Y, setzt onGround und stoppt an Boden/Decke. */
  private moveY(level: Level, dy: number): void {
    this.onGround = false;
    if (dy === 0) return;
    this.y += dy;
    if (!this.collides(level)) return;
    if (dy > 0) {
      // Fallen: auf dem Boden landen.
      this.y = Math.floor((this.y + PLAYER_H) / TILE) * TILE - PLAYER_H;
      this.onGround = true;
    } else {
      // Steigen: an der Decke anstoßen.
      this.y = (Math.floor(this.y / TILE) + 1) * TILE;
    }
    this.vy = 0;
  }

  /** Überlappt die Kollisionsbox irgendeine feste Kachel? */
  private collides(level: Level): boolean {
    const c0 = Math.floor(this.x / TILE);
    const c1 = Math.floor((this.x + PLAYER_W - 0.001) / TILE);
    const r0 = Math.floor(this.y / TILE);
    const r1 = Math.floor((this.y + PLAYER_H - 0.001) / TILE);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (level.solidAt(c, r)) return true;
      }
    }
    return false;
  }
}
