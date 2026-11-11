/**
 * entities/dynamite.ts – Dynamit-Stab
 *
 * Ablauf: gelegt -> Zündschnur brennt (DYNAMITE_FUSE_FRAMES) -> Explosion
 * (EXPLOSION_FRAMES). Im Moment der Explosion werden alle Lehm-Kacheln im
 * Sprengradius zu Leer; Fels bleibt. Solange die Explosion sichtbar ist,
 * verletzt sie die Figur, wenn sie im Radius steht.
 */

import {
  DYNAMITE_FUSE_FRAMES,
  EXPLOSION_FRAMES,
  EXPLOSION_RADIUS_TILES,
  TILE,
} from '../config';
import type { Level } from '../levels';
import { Tile } from '../levels/tiles';
import type { Rect } from './laser';

export class Dynamite {
  /** Mittelpunkt des Stabs in Welt-Pixeln. */
  readonly cx: number;
  readonly cy: number;
  /** Verbleibende Zündschnur-Frames (> 0 = brennt). */
  fuse = DYNAMITE_FUSE_FRAMES;
  /** Verbleibende Explosions-Frames (> 0 = explodiert gerade). */
  boom = 0;
  /** Frame-Zähler für Flackern/Blinken. */
  age = 0;

  constructor(cx: number, cy: number) {
    this.cx = cx;
    this.cy = cy;
  }

  /** Explodiert der Stab gerade? */
  get exploding(): boolean {
    return this.boom > 0;
  }

  /** Ist alles vorbei (kann entfernt werden)? */
  get finished(): boolean {
    return this.fuse === 0 && this.boom === 0;
  }

  /** Ein Logik-Schritt. */
  update(level: Level): void {
    this.age++;
    if (this.fuse > 0) {
      this.fuse--;
      if (this.fuse === 0) {
        this.explode(level);
        this.boom = EXPLOSION_FRAMES;
      }
    } else if (this.boom > 0) {
      this.boom--;
    }
  }

  /** Verwandelt Lehm im Sprengradius in leere Kacheln. */
  private explode(level: Level): void {
    for (const [c, r] of this.blastTiles()) {
      if (level.tileAt(c, r) === Tile.Lehm) level.setTile(c, r, Tile.Leer);
    }
  }

  /** Alle Kachel-Koordinaten [Spalte, Zeile] im Sprengradius (Kreis um die Stabkachel). */
  blastTiles(): [number, number][] {
    const c0 = Math.floor(this.cx / TILE);
    const r0 = Math.floor(this.cy / TILE);
    const R = EXPLOSION_RADIUS_TILES;
    const out: [number, number][] = [];
    for (let dr = -R; dr <= R; dr++) {
      for (let dc = -R; dc <= R; dc++) {
        if (dc * dc + dr * dr <= R * R) out.push([c0 + dc, r0 + dr]);
      }
    }
    return out;
  }

  /** Trifft die Explosion das Rechteck? (Kreis um den Stabmittelpunkt gegen Rechteck.) */
  hits(box: Rect): boolean {
    if (!this.exploding) return false;
    const R = EXPLOSION_RADIUS_TILES * TILE;
    const nx = Math.max(box.x, Math.min(this.cx, box.x + box.w));
    const ny = Math.max(box.y, Math.min(this.cy, box.y + box.h));
    const dx = nx - this.cx;
    const dy = ny - this.cy;
    return dx * dx + dy * dy <= R * R;
  }
}
