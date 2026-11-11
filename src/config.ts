/**
 * config.ts – zentrale Konstanten von "Mine Rescue"
 *
 * Alles, was man zum Tunen des Spielgefühls ändern möchte, steht hier:
 * Auflösung, Physik, Energie, Farben. Einheiten:
 *   - Positionen/Strecken in Pixeln der internen Auflösung (160x192)
 *   - Geschwindigkeiten in Pixel pro Frame (bei 60 Frames/s)
 *   - Beschleunigungen in Pixel pro Frame²
 */

// ---------------------------------------------------------------------------
// Bildschirm & Raster
// ---------------------------------------------------------------------------

/** Interne Breite der Spielfläche in Pixeln (entspricht einem Raum). */
export const SCREEN_W = 160;
/** Interne Höhe der Spielfläche in Pixeln (entspricht einem Raum). */
export const SCREEN_H = 192;

/** Kantenlänge einer Kachel (Tile) in Pixeln. */
export const TILE = 8;
/** Kacheln pro Raum horizontal (SCREEN_W / TILE). */
export const ROOM_TILES_W = SCREEN_W / TILE; // 20
/** Kacheln pro Raum vertikal (SCREEN_H / TILE). */
export const ROOM_TILES_H = SCREEN_H / TILE; // 24

// ---------------------------------------------------------------------------
// Game-Loop
// ---------------------------------------------------------------------------

/** Logik-Schritte pro Sekunde (fester Zeitschritt). */
export const UPDATES_PER_SECOND = 60;
/** Dauer eines Logik-Schritts in Millisekunden. */
export const FIXED_DT_MS = 1000 / UPDATES_PER_SECOND;
/** Obergrenze für die Zeit eines Browser-Frames (verhindert Aufholschleifen nach Tab-Wechsel). */
export const MAX_FRAME_MS = 250;

// ---------------------------------------------------------------------------
// Spielfigur
// ---------------------------------------------------------------------------

/** Breite der Kollisionsbox der Figur (Pixel). */
export const PLAYER_W = 6;
/** Höhe der Kollisionsbox der Figur (Pixel). */
export const PLAYER_H = 14;
/** Sprite-Größe der Figur (Pixel) – größer als die Kollisionsbox. */
export const PLAYER_SPRITE_W = 8;
export const PLAYER_SPRITE_H = 16;

/** Lauftempo am Boden (Pixel/Frame). */
export const WALK_SPEED = 0.8;
/** Horizontales Tempo in der Luft (Pixel/Frame). */
export const AIR_SPEED = 0.8;
/** Schwerkraft (Pixel/Frame²), wenn der Rucksack nicht schiebt. */
export const GRAVITY = 0.08;
/** Maximale Fallgeschwindigkeit (Pixel/Frame). */
export const MAX_FALL_SPEED = 2.2;
/** Schubkraft des Heli-Rucksacks nach oben (Pixel/Frame²). Muss größer als GRAVITY sein. */
export const THRUST = 0.2;
/** Maximale Steiggeschwindigkeit (Pixel/Frame). */
export const MAX_RISE_SPEED = 1.3;
/** Zusätzliche Beschleunigung nach unten, wenn "runter" gehalten wird (Pixel/Frame²). */
export const DIVE_ACCEL = 0.12;

// ---------------------------------------------------------------------------
// Farben (Atari-ähnliche, kräftige Palette)
// ---------------------------------------------------------------------------

export const COLORS = {
  /** Hintergrund hinter den Tiles (leere Höhle). */
  background: '#000000',
  /** Gesteinsfarben (Fels). */
  rock: '#8a5a2b',
  rockDark: '#5c3a18',
  /** Lehm-Wand (sprengbar). */
  clay: '#c9a24a',
  clayDark: '#8f6f2a',
  /** Lava. */
  lava: '#e8431a',
  lavaLight: '#ffb020',
  /** Wasser. */
  water: '#2a5fd8',
  waterLight: '#7fb0ff',
  /** Debug-Text. */
  debug: '#00ff66',
  /** Normaler Text. */
  text: '#ffffff',
} as const;
