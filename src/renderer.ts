/**
 * renderer.ts – Zeichnen und Skalierung
 *
 * Besitzt den Canvas (interne Auflösung 160x192) und kümmert sich um:
 *   - ganzzahlige Hochskalierung per CSS (scharfe Pixel, zentriert, responsiv)
 *   - Zeichnen von Sprites und Kacheln
 * Spiellogik gehört nicht hierher.
 */

import { COLORS, PLAYER_SPRITE_H, PLAYER_SPRITE_W, ROOM_TILES_H, ROOM_TILES_W, SCREEN_H, SCREEN_W, TILE, PLAYER_H, PLAYER_W } from './config';
import type { Level } from './levels';
import { Tile } from './levels/tiles';
import type { Player } from './entities/player';
import { CLAY_DEF, LAVA_DEF, PLAYER_DEF, ROCK_DEF, WATER_DEF, makeSprite, type Sprite } from './sprites';
import { drawText } from './ui/font';

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  // Vorgerenderte Sprites
  private playerSprite = makeSprite(PLAYER_DEF);
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
   * Zeichnet einen kompletten Frame.
   * @param level   aktuelles Level
   * @param player  Spielfigur
   * @param roomX   Raum-Spalte der Kamera (Screen-Flip)
   * @param roomY   Raum-Zeile der Kamera
   */
  drawFrame(level: Level, player: Player, roomX: number, roomY: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

    // Kamera = Ursprung des aktuellen Raums in Welt-Pixeln
    const camX = roomX * SCREEN_W;
    const camY = roomY * SCREEN_H;

    // Kacheln des aktuellen Raums
    const c0 = roomX * ROOM_TILES_W;
    const r0 = roomY * ROOM_TILES_H;
    for (let r = 0; r < ROOM_TILES_H; r++) {
      for (let c = 0; c < ROOM_TILES_W; c++) {
        const t = level.tileAt(c0 + c, r0 + r);
        if (t === Tile.Leer) continue;
        ctx.drawImage(this.tileSprites[t].normal, c * TILE, r * TILE);
      }
    }

    // Spielfigur: Sprite ist größer als die Kollisionsbox und wird um sie zentriert/unten bündig
    const sx = Math.round(player.x - camX - (PLAYER_SPRITE_W - PLAYER_W) / 2);
    const sy = Math.round(player.y - camY - (PLAYER_SPRITE_H - PLAYER_H));
    ctx.drawImage(player.facing === 1 ? this.playerSprite.normal : this.playerSprite.flipped, sx, sy);
  }

  /** Debug-Einblendung: Raum und Pixelposition. */
  drawDebug(roomX: number, roomY: number, player: Player): void {
    drawText(this.ctx, `R ${roomX},${roomY}`, 2, 2, COLORS.debug);
    drawText(this.ctx, `X ${Math.round(player.x)} Y ${Math.round(player.y)}`, 2, 9, COLORS.debug);
  }

  /** Pause-Anzeige in der Bildschirmmitte. */
  drawPause(): void {
    drawText(this.ctx, 'PAUSE', SCREEN_W / 2 - 10, SCREEN_H / 2 - 2, COLORS.text);
  }
}
