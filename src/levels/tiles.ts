/**
 * levels/tiles.ts – Kachel-Typen (Tiles) und ihre Eigenschaften
 *
 * Jede Kachel einer Level-Karte ist eine Zahl aus `Tile`.
 * Das Zeichen, mit dem sie in der Level-Datei geschrieben wird, steht in
 * TILE_CHARS (siehe docs/LEVEL_FORMAT.md).
 */

/** Alle Kachel-Typen. */
export const Tile = {
  /** Leere, begehbare/befliegbare Höhle. */
  Leer: 0,
  /** Fels: fest, nicht sprengbar. */
  Fels: 1,
  /** Lehm: fest, aber per Dynamit sprengbar (ab Meilenstein 3). */
  Lehm: 2,
  /** Lava: tödlich (Wirkung ab Meilenstein 4). */
  Lava: 3,
  /** Wasser: Gefahr/Bremse (Wirkung ab Meilenstein 4). */
  Wasser: 4,
} as const;

/** Zahlentyp einer Kachel. */
export type TileId = (typeof Tile)[keyof typeof Tile];

/** Zeichen in der ASCII-Level-Datei -> Kachel. 'P' und 'R' sind Marker und werden zu Leer. */
export const TILE_CHARS: Record<string, TileId> = {
  '.': Tile.Leer,
  '#': Tile.Fels,
  L: Tile.Lehm,
  '~': Tile.Lava,
  W: Tile.Wasser,
};

/** Blockiert die Kachel Bewegung (Wände, Boden, Decke)? */
export function isSolid(t: TileId): boolean {
  return t === Tile.Fels || t === Tile.Lehm;
}
