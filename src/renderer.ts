/**
 * renderer.ts – Zeichnen und Skalierung
 *
 * Besitzt den Canvas (interne Auflösung 160x192) und kümmert sich um:
 *   - ganzzahlige Hochskalierung per CSS (scharfe Pixel, zentriert, responsiv)
 *   - Zeichnen von Kacheln, Sprites, Laser, Explosion und HUD
 * Spiellogik gehört nicht hierher.
 *
 * Ablauf pro Frame (siehe Game.render): beginFrame -> Objekte -> drawHud.
 */

import {
  COLORS,
  ENEMY_ANIM_FRAMES,
  ENERGY_LOW_FRACTION,
  ENERGY_MAX,
  HUD_H,
  PLAYER_H,
  PLAYER_SPRITE_H,
  PLAYER_SPRITE_W,
  PLAYER_W,
  ROOM_PX_H,
  ROOM_TILES_H,
  ROOM_TILES_W,
  SCREEN_H,
  SCREEN_W,
  TILE,
} from './config';
import type { Dynamite } from './entities/dynamite';
import { Spider, type Enemy } from './entities/enemies';
import type { Laser } from './entities/laser';
import type { Player } from './entities/player';
import type { Level } from './levels';
import { Tile } from './levels/tiles';
import {
  BAT_DEFS,
  CLAY_DEF,
  DYNAMITE_DEF,
  MOTH_DEFS,
  SPIDER_DEFS,
  LAVA_DEF,
  PLAYER_DEF,
  ROCK_DEF,
  WATER_DEF,
  makeSprite,
  type Sprite,
} from './sprites';
import { drawText } from './ui/font';

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  /** Kamera-Ursprung (Welt-Pixel des aktuellen Raums), von beginFrame gesetzt. */
  private camX = 0;
  private camY = 0;
  /** Frame-Zähler für Blinken/Flackern. */
  private tick = 0;

  // Vorgerenderte Sprites
  private playerSprite = makeSprite(PLAYER_DEF);
  private dynamiteSprite = makeSprite(DYNAMITE_DEF);
  private enemySprites: Record<string, Sprite[]> = {
    spinne: SPIDER_DEFS.map(makeSprite),
    fledermaus: BAT_DEFS.map(makeSprite),
    motte: MOTH_DEFS.map(makeSprite),
  };
  private tileSprites: Record<number, Sprite> = {
    [Tile.Fels]: makeSprite(ROCK_DEF),
    [Tile.Lehm]: makeSprite(CLAY_DEF),
    [Tile.Lava]: makeSprite(LAVA_DEF),
    [Tile.Wasser]: makeSprite(WATER_DEF),
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width = SCREEN_W;
    canvas.height = SCREEN_H;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  /** Setzt die CSS-Größe auf das größte ganzzahlige Vielfache, das ins Fenster passt (mind. 1). */
  resize(): void {
    const scale = Math.max(1, Math.floor(Math.min(window.innerWidth / SCREEN_W, window.innerHeight / SCREEN_H)));
    this.canvas.style.width = `${SCREEN_W * scale}px`;
    this.canvas.style.height = `${SCREEN_H * scale}px`;
  }

  /**
   * Beginnt einen Frame: löscht, setzt die Kamera auf den Raum und zeichnet dessen Kacheln.
   * @param roomX Raum-Spalte (Screen-Flip)
   * @param roomY Raum-Zeile
   */
  beginFrame(level: Level, roomX: number, roomY: number): void {
    const ctx = this.ctx;
    this.tick++;
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    this.camX = roomX * SCREEN_W;
    this.camY = roomY * ROOM_PX_H;

    const c0 = roomX * ROOM_TILES_W;
    const r0 = roomY * ROOM_TILES_H;
    for (let r = 0; r < ROOM_TILES_H; r++) {
      for (let c = 0; c < ROOM_TILES_W; c++) {
        const t = level.tileAt(c0 + c, r0 + r);
        if (t === Tile.Leer) continue;
        // Lava/Wasser "flimmern": Sprite wechselt je Kachel zwischen normal und gespiegelt.
        const shimmer = (t === Tile.Lava || t === Tile.Wasser) && (Math.floor(this.tick / 20) + c + r) % 2 === 1;
        const spr = this.tileSprites[t];
        ctx.drawImage(shimmer ? spr.flipped : spr.normal, c * TILE, r * TILE);
      }
    }
  }

  /** Spielfigur: Sprite ist größer als die Kollisionsbox, unten bündig und mittig. */
  drawPlayer(player: Player): void {
    const sx = Math.round(player.x - this.camX - (PLAYER_SPRITE_W - PLAYER_W) / 2);
    const sy = Math.round(player.y - this.camY - (PLAYER_SPRITE_H - PLAYER_H));
    this.ctx.drawImage(player.facing === 1 ? this.playerSprite.normal : this.playerSprite.flipped, sx, sy);
  }

  /** Gegner (Spinne mit Faden), zweibildrige Animation. */
  drawEnemy(e: Enemy): void {
    if (!e.alive) return;
    const ctx = this.ctx;
    const frames = this.enemySprites[e.kind];
    const frame = Math.floor(e.age / ENEMY_ANIM_FRAMES) % frames.length;
    const sx = Math.round(e.x - this.camX);
    const sy = Math.round(e.y - this.camY);
    if (e instanceof Spider) {
      // Faden von der Decke bis zur Spinne
      ctx.fillStyle = COLORS.thread;
      ctx.fillRect(sx + 3, Math.round(e.anchorY - this.camY), 1, sy - Math.round(e.anchorY - this.camY) + 2);
    }
    ctx.drawImage(frames[frame].normal, sx, sy);
  }

  /** Laser-Strahl (flackert zwischen zwei Farben). */
  drawLaser(laser: Laser): void {
    if (!laser.active) return;
    const b = laser.rect();
    if (b.w <= 0) return;
    this.ctx.fillStyle = this.tick % 2 === 0 ? COLORS.laser : COLORS.laserLight;
    this.ctx.fillRect(Math.round(b.x - this.camX), Math.round(b.y - this.camY), b.w, b.h);
  }

  /** Dynamit: Stab mit blinkendem Zündfunken; während der Explosion der Feuerball. */
  drawDynamite(d: Dynamite): void {
    const ctx = this.ctx;
    if (d.exploding) {
      // Flackernde Kacheln im Sprengradius (zufällig wirkend, aber deterministisch)
      const colors = [COLORS.boom1, COLORS.boom2, COLORS.boom3];
      for (const [c, r] of d.blastTiles()) {
        const x = c * TILE - this.camX;
        const y = r * TILE - this.camY;
        if (x < 0 || y < 0 || x >= SCREEN_W || y >= ROOM_PX_H) continue;
        ctx.fillStyle = colors[(c * 7 + r * 3 + this.tick) % 3];
        ctx.fillRect(x, y, TILE, TILE);
      }
      return;
    }
    const sx = Math.round(d.cx - this.camX - 2);
    const sy = Math.round(d.cy - this.camY - 3);
    ctx.drawImage(this.dynamiteSprite.normal, sx, sy);
    // Zündfunke: blinkt, gelb/weiß
    ctx.fillStyle = Math.floor(d.age / 3) % 2 === 0 ? COLORS.boom1 : COLORS.boom3;
    ctx.fillRect(sx + 2, sy - 1, 1, 1);
  }

  /** HUD-Streifen am unteren Rand: Energie-Balken und Dynamit-Vorrat. */
  drawHud(player: Player): void {
    const ctx = this.ctx;
    const y0 = ROOM_PX_H;
    ctx.fillStyle = COLORS.hudBg;
    ctx.fillRect(0, y0, SCREEN_W, HUD_H);
    ctx.fillStyle = COLORS.hudLine;
    ctx.fillRect(0, y0, SCREEN_W, 1);

    // Energie-Balken (Rahmen + Füllung), blinkt rot bei niedriger Energie
    const frac = player.energy / ENERGY_MAX;
    const bx = 4;
    const by = y0 + 5;
    const bw = 100;
    ctx.fillStyle = COLORS.hudLine;
    ctx.fillRect(bx - 1, by - 1, bw + 2, 8);
    ctx.fillStyle = COLORS.hudBg;
    ctx.fillRect(bx, by, bw, 6);
    const low = frac < ENERGY_LOW_FRACTION;
    ctx.fillStyle = low && Math.floor(this.tick / 8) % 2 === 0 ? COLORS.energyLow : COLORS.energy;
    ctx.fillRect(bx, by, Math.round(bw * frac), 6);

    // Dynamit-Symbol + Anzahl
    ctx.drawImage(this.dynamiteSprite.normal, 112, y0 + 5);
    drawText(ctx, `X${player.dynamite}`, 120, y0 + 5, COLORS.text);
  }

  /** Debug-Einblendung: Raum und Pixelposition. */
  drawDebug(roomX: number, roomY: number, player: Player): void {
    drawText(this.ctx, `R ${roomX},${roomY}`, 2, 2, COLORS.debug);
    drawText(this.ctx, `X ${Math.round(player.x)} Y ${Math.round(player.y)}`, 2, 9, COLORS.debug);
  }

  /** Pause-Anzeige in der Mitte des Spielbereichs. */
  drawPause(): void {
    drawText(this.ctx, 'PAUSE', SCREEN_W / 2 - 10, ROOM_PX_H / 2 - 2, COLORS.text);
  }
}
