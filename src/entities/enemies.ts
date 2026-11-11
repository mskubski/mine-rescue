/**
 * entities/enemies.ts – Gegner: Spinne, Fledermaus, Motte
 *
 * Alle Gegner sind 8x8 Pixel groß, haben eine etwas kleinere Kollisionsbox
 * (ENEMY_HITBOX_INSET) und werden vom Laser oder einer Explosion getötet.
 * Sie bewegen sich nur, solange sich die Figur im selben Raum befindet
 * (Game.updateEnemies) – das spart Rechenzeit und ist fairer.
 */

import {
  BAT_SPEED,
  BAT_WOBBLE_AMP,
  BAT_WOBBLE_SPEED,
  ENEMY_HITBOX_INSET,
  ENEMY_SIZE,
  MOTH_SPEED,
  MOTH_WOBBLE_AMP,
  MOTH_WOBBLE_SPEED,
  PLAYER_H,
  PLAYER_W,
  ROOM_PX_H,
  SCREEN_W,
  SPIDER_MAX_DROP_TILES,
  SPIDER_SPEED,
  TILE,
} from '../config';
import type { EnemySpawn, Level } from '../levels';
import type { EnemyKind } from '../levels/tiles';
import type { Rect } from './laser';
import type { Player } from './player';

/** Basisklasse: Position (obere linke Ecke des Sprites), Lebenszustand, Alter. */
export abstract class Enemy {
  abstract readonly kind: EnemyKind;
  x: number;
  y: number;
  alive = true;
  /** Frames seit dem Start (für Animation/Schwingung). */
  age = 0;

  constructor(spawn: EnemySpawn) {
    this.x = spawn.x;
    this.y = spawn.y;
  }

  /** Ein Logik-Schritt. */
  abstract update(level: Level, player: Player): void;

  /** Kollisionsbox (etwas kleiner als das Sprite). */
  get box(): Rect {
    const i = ENEMY_HITBOX_INSET;
    return { x: this.x + i, y: this.y + i, w: ENEMY_SIZE - 2 * i, h: ENEMY_SIZE - 2 * i };
  }

  /** Raum-Spalte, in der der Gegner (Mitte) gerade ist. */
  get roomX(): number {
    return Math.floor((this.x + ENEMY_SIZE / 2) / SCREEN_W);
  }
  /** Raum-Zeile, in der der Gegner (Mitte) gerade ist. */
  get roomY(): number {
    return Math.floor((this.y + ENEMY_SIZE / 2) / ROOM_PX_H);
  }
}

/** Spinne: hängt an der Decke und seilt sich auf und ab. */
export class Spider extends Enemy {
  readonly kind = 'spinne' as const;
  /** Oberkante des Fadens (Unterkante der Decke), für das Zeichnen des Fadens. */
  readonly anchorY: number;
  private minY: number;
  private maxY: number;
  private dir: 1 | -1 = 1;

  constructor(spawn: EnemySpawn, level: Level) {
    super(spawn);
    this.anchorY = spawn.y;
    this.minY = spawn.y;
    // Tiefste Position: bis zum nächsten festen Boden, höchstens SPIDER_MAX_DROP_TILES.
    let rows = 1;
    while (rows < SPIDER_MAX_DROP_TILES && !level.solidAt(spawn.col, spawn.row + rows)) rows++;
    this.maxY = spawn.y + (rows - 1) * TILE;
  }

  update(): void {
    this.age++;
    this.y += this.dir * SPIDER_SPEED;
    if (this.y >= this.maxY) {
      this.y = this.maxY;
      this.dir = -1;
    } else if (this.y <= this.minY) {
      this.y = this.minY;
      this.dir = 1;
    }
  }
}

/** Fledermaus: fliegt waagerecht hin und her mit leichtem Auf und Ab, dreht an Wänden um. */
export class Bat extends Enemy {
  readonly kind = 'fledermaus' as const;
  private baseY: number;
  private dir: 1 | -1 = 1;

  constructor(spawn: EnemySpawn) {
    super(spawn);
    this.baseY = spawn.y;
  }

  update(level: Level): void {
    this.age++;
    // Waagerecht; an einer festen Kachel umkehren.
    const nx = this.x + this.dir * BAT_SPEED;
    if (level.boxSolid(nx, this.y, ENEMY_SIZE, ENEMY_SIZE)) {
      this.dir = this.dir === 1 ? -1 : 1;
    } else {
      this.x = nx;
    }
    // Senkrecht: Sinus um die Ausgangshöhe, aber nicht in Wände hinein.
    const ny = this.baseY + Math.sin(this.age * BAT_WOBBLE_SPEED) * BAT_WOBBLE_AMP;
    if (!level.boxSolid(this.x, ny, ENEMY_SIZE, ENEMY_SIZE)) this.y = ny;
  }
}

/** Motte: flattert langsam auf die Figur zu, sobald diese im selben Raum ist. */
export class Moth extends Enemy {
  readonly kind = 'motte' as const;

  update(level: Level, player: Player): void {
    this.age++;
    if (this.roomX === Math.floor(player.centerX / SCREEN_W) && this.roomY === Math.floor(player.centerY / ROOM_PX_H)) {
      const tx = player.x + PLAYER_W / 2 - ENEMY_SIZE / 2;
      const ty = player.y + PLAYER_H / 2 - ENEMY_SIZE / 2;
      // Achsenweise bewegen, damit die Motte an Wänden entlanggleitet statt hängenzubleiben.
      const dx = Math.sign(tx - this.x) * Math.min(MOTH_SPEED, Math.abs(tx - this.x));
      const dy = Math.sign(ty - this.y) * Math.min(MOTH_SPEED, Math.abs(ty - this.y));
      if (!level.boxSolid(this.x + dx, this.y, ENEMY_SIZE, ENEMY_SIZE)) this.x += dx;
      if (!level.boxSolid(this.x, this.y + dy, ENEMY_SIZE, ENEMY_SIZE)) this.y += dy;
    }
    // Zappeln: kleine Sinusbewegung nach oben/unten (nur wenn frei).
    const wob = Math.sin(this.age * MOTH_WOBBLE_SPEED) * MOTH_WOBBLE_AMP * 0.1;
    if (!level.boxSolid(this.x, this.y + wob, ENEMY_SIZE, ENEMY_SIZE)) this.y += wob;
  }
}

/** Erzeugt aus einem Level-Marker den passenden Gegner. */
export function createEnemy(spawn: EnemySpawn, level: Level): Enemy {
  switch (spawn.kind) {
    case 'spinne':
      return new Spider(spawn, level);
    case 'fledermaus':
      return new Bat(spawn);
    case 'motte':
      return new Moth(spawn);
  }
}
