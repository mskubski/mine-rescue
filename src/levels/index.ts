/**
 * levels/index.ts – Level-Liste und Parser
 *
 * Wandelt die ASCII-Karten (LevelDef) in ein spielbares `Level` um und prüft
 * dabei die Daten (Größe, Start, Bergmann). Fehler werden auf Deutsch gemeldet,
 * damit man beim Editieren der Level-Dateien schnell die Ursache findet.
 */

import { ROOM_TILES_H, ROOM_TILES_W, TILE } from '../config';
import { Tile, TILE_CHARS, isSolid, type TileId } from './tiles';
import { level1 } from './level1';

/** Rohdaten eines Levels, wie sie in levelN.ts stehen. */
export interface LevelDef {
  /** Anzeigename. */
  name: string;
  /** Kartenzeilen; Breite = Vielfaches von 20, Höhe = Vielfaches von 24. */
  map: string[];
}

/** Position in Pixeln. */
export interface Point {
  x: number;
  y: number;
}

/** Fertig geparstes Level. */
export class Level {
  readonly name: string;
  /** Breite/Höhe in Kacheln. */
  readonly cols: number;
  readonly rows: number;
  /** Anzahl Räume horizontal/vertikal. */
  readonly roomsX: number;
  readonly roomsY: number;
  /** Kachel-Daten, zeilenweise (rows*cols). */
  readonly tiles: Uint8Array;
  /** Startposition (untere Kante der Kachel, in Pixeln: Mitte-unten). */
  readonly start: Point;
  /** Position des Bergmanns (Mitte-unten der Kachel, in Pixeln). */
  readonly miner: Point;

  constructor(def: LevelDef) {
    this.name = def.name;
    const rows = def.map.length;
    const cols = def.map[0]?.length ?? 0;
    if (rows === 0 || rows % ROOM_TILES_H !== 0) {
      throw new Error(`Level "${def.name}": Zeilenzahl ${rows} ist kein Vielfaches von ${ROOM_TILES_H}`);
    }
    if (cols === 0 || cols % ROOM_TILES_W !== 0) {
      throw new Error(`Level "${def.name}": Breite ${cols} ist kein Vielfaches von ${ROOM_TILES_W}`);
    }
    this.rows = rows;
    this.cols = cols;
    this.roomsX = cols / ROOM_TILES_W;
    this.roomsY = rows / ROOM_TILES_H;
    this.tiles = new Uint8Array(rows * cols);

    let start: Point | null = null;
    let miner: Point | null = null;
    for (let r = 0; r < rows; r++) {
      const line = def.map[r];
      if (line.length !== cols) {
        throw new Error(`Level "${def.name}": Zeile ${r + 1} hat ${line.length} statt ${cols} Zeichen`);
      }
      for (let c = 0; c < cols; c++) {
        const ch = line[c];
        const bottomMid = { x: c * TILE + TILE / 2, y: (r + 1) * TILE };
        if (ch === 'P') {
          if (start) throw new Error(`Level "${def.name}": mehr als ein Startpunkt 'P'`);
          start = bottomMid;
        } else if (ch === 'R') {
          if (miner) throw new Error(`Level "${def.name}": mehr als ein Bergmann 'R'`);
          miner = bottomMid;
        } else if (ch in TILE_CHARS) {
          this.tiles[r * cols + c] = TILE_CHARS[ch];
        } else {
          throw new Error(`Level "${def.name}": unbekanntes Zeichen '${ch}' in Zeile ${r + 1}, Spalte ${c + 1}`);
        }
      }
    }
    if (!start) throw new Error(`Level "${def.name}": kein Startpunkt 'P' gefunden`);
    if (!miner) throw new Error(`Level "${def.name}": kein Bergmann 'R' gefunden`);
    this.start = start;
    this.miner = miner;
  }

  /** Kachel an Spalte/Zeile; außerhalb der Karte zählt als Fels. */
  tileAt(c: number, r: number): TileId {
    if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return Tile.Fels;
    return this.tiles[r * this.cols + c] as TileId;
  }

  /** Ist die Kachel an Spalte/Zeile fest? */
  solidAt(c: number, r: number): boolean {
    return isSolid(this.tileAt(c, r));
  }
}

/** Alle Level in Spielreihenfolge. Neue Level hier eintragen. */
export const LEVEL_DEFS: LevelDef[] = [level1];
