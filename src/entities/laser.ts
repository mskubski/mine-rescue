/**
 * entities/laser.ts – Helm-Laser
 *
 * Schießt waagerecht nach vorn (Blickrichtung). Der Strahl bleibt kurz sichtbar,
 * folgt dabei der Figur und endet an der ersten festen Kachel oder nach
 * LASER_LENGTH Pixeln. Gegner (Meilenstein 4) werden über `rect()` getroffen.
 */

import { LASER_COOLDOWN, LASER_FRAMES, LASER_LENGTH, LASER_Y_OFFSET, PLAYER_W } from '../config';
import type { Level } from '../levels';
import type { Player } from './player';
import { TILE } from '../config';

/** Rechteck in Welt-Pixeln. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class Laser {
  /** Verbleibende Sichtbarkeit in Frames (0 = aus). */
  ttl = 0;
  /** Verbleibende Wartezeit bis zum nächsten Schuss. */
  cooldown = 0;
  /** Aktuelle Strahlgeometrie (nur gültig, solange ttl > 0). */
  private beam: Rect = { x: 0, y: 0, w: 0, h: 1 };

  /** Ist der Strahl gerade aktiv (sichtbar/gefährlich)? */
  get active(): boolean {
    return this.ttl > 0;
  }

  /** Kann ein neuer Schuss abgegeben werden? */
  get ready(): boolean {
    return this.cooldown === 0;
  }

  /** Löst einen Schuss aus. */
  fire(): void {
    this.ttl = LASER_FRAMES;
    this.cooldown = LASER_COOLDOWN;
  }

  /** Ein Logik-Schritt: Timer herunterzählen, Strahl an die Figur anpassen. */
  update(player: Player, level: Level): void {
    if (this.cooldown > 0) this.cooldown--;
    if (this.ttl > 0) {
      this.ttl--;
      this.beam = this.computeBeam(player, level);
    }
  }

  /** Strahl-Rechteck für Treffer-Tests und Zeichnen. */
  rect(): Rect {
    return this.beam;
  }

  /** Berechnet den Strahl: Startpunkt an der Figurfront, Länge bis zur nächsten Wand. */
  private computeBeam(player: Player, level: Level): Rect {
    const y = Math.floor(player.y + LASER_Y_OFFSET);
    const row = Math.floor(y / TILE);
    const startX = player.facing === 1 ? player.x + PLAYER_W : player.x;
    let len = 0;
    // Pixelweise vorantasten, bis eine feste Kachel getroffen wird.
    while (len < LASER_LENGTH) {
      const px = player.facing === 1 ? startX + len : startX - len - 1;
      if (level.solidAt(Math.floor(px / TILE), row)) break;
      len++;
    }
    const x = player.facing === 1 ? startX : startX - len;
    return { x, y, w: len, h: 1 };
  }
}
