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
/** Höhe des HUD-Streifens am unteren Bildrand (Pixel): Energie, Dynamit, später Punkte. */
export const HUD_H = 16;
/** Höhe des Spielbereichs eines Raums in Pixeln (Bildschirm ohne HUD). */
export const ROOM_PX_H = SCREEN_H - HUD_H; // 176
/** Kacheln pro Raum vertikal (ROOM_PX_H / TILE). */
export const ROOM_TILES_H = ROOM_PX_H / TILE; // 22

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
// Energie (Rucksack-Power)
// ---------------------------------------------------------------------------

/** Volle Energie. */
export const ENERGY_MAX = 100;
/** Energieverbrauch pro Frame, solange der Rucksack schiebt (100 / 0.03 / 60 ≈ 55 s Dauerflug). */
export const ENERGY_FLY_COST = 0.03;
/** Energieverbrauch pro Laser-Schuss. */
export const ENERGY_LASER_COST = 0.6;
/** Unter diesem Anteil (0..1) blinkt die Energieanzeige rot. */
export const ENERGY_LOW_FRACTION = 0.25;

// ---------------------------------------------------------------------------
// Laser (Helm-Strahl)
// ---------------------------------------------------------------------------

/** Maximale Reichweite des Strahls (Pixel). */
export const LASER_LENGTH = 72;
/** Wie viele Frames der Strahl sichtbar bleibt. */
export const LASER_FRAMES = 6;
/** Wartezeit zwischen zwei Schüssen (Frames, Dauerfeuer bei gehaltener Taste). */
export const LASER_COOLDOWN = 14;
/** Höhe des Strahls relativ zur Oberkante der Kollisionsbox (Pixel, Helmhöhe). */
export const LASER_Y_OFFSET = 2;

// ---------------------------------------------------------------------------
// Dynamit
// ---------------------------------------------------------------------------

/** Dynamit-Stäbe zu Beginn eines Levels. */
export const DYNAMITE_START = 6;
/** Zündschnur: Frames bis zur Explosion (90 = 1,5 s). */
export const DYNAMITE_FUSE_FRAMES = 90;
/** Dauer der sichtbaren Explosion (Frames). */
export const EXPLOSION_FRAMES = 24;
/** Sprengradius in Kacheln; zerstört Lehm und verletzt die Figur. */
export const EXPLOSION_RADIUS_TILES = 3;

// ---------------------------------------------------------------------------
// Spielablauf: Leben, Punkte, Bonus
// ---------------------------------------------------------------------------

/** Leben zu Spielbeginn. */
export const LIVES_START = 3;
/** Dauer der Todesanimation, bevor es weitergeht (Frames). */
export const DEATH_FRAMES = 90;
/** Punkte für einen getöteten Gegner. */
export const POINTS_ENEMY = 50;
/** Punkte für die Rettung des Bergmanns. */
export const RESCUE_BONUS = 1000;
/** Bonus pro verbleibender Energie-Einheit (ganzzahlig gerundet). */
export const ENERGY_BONUS_PER_UNIT = 10;
/** Bonus pro nicht verbrauchtem Dynamit-Stab. */
export const DYNAMITE_BONUS_EACH = 50;
/** Alle so viele Punkte gibt es ein Extraleben. */
export const EXTRA_LIFE_EVERY = 20000;
/** Mindestdauer der Bonus-/Game-Over-Anzeige, bevor eine Taste weiterschaltet (Frames). */
export const SCREEN_MIN_FRAMES = 90;
/** Browser-Speicherschlüssel für den Highscore. */
export const HIGHSCORE_KEY = 'mine-rescue-highscore';

// ---------------------------------------------------------------------------
// Sound, Touch, Gamepad
// ---------------------------------------------------------------------------

/** Gesamtlautstärke (0..1). */
export const AUDIO_VOLUME = 0.25;
/** Browser-Speicherschlüssel für die Stumm-Einstellung. */
export const MUTE_KEY = 'mine-rescue-muted';
/** Höhe des Touch-Bedienfelds (CSS-Pixel), das im Hochformat unter dem Spiel freigehalten wird. */
export const TOUCH_PANEL_H = 170;
/** Stick-Totzone des Gamepads (0..1). */
export const GAMEPAD_DEADZONE = 0.4;

// ---------------------------------------------------------------------------
// Gefahren: Wasser
// ---------------------------------------------------------------------------

/** Faktor auf Lauf-/Flug- und Fallgeschwindigkeit im Wasser (0.5 = halb so schnell). */
export const WATER_SPEED_FACTOR = 0.5;
/** Zusätzlicher Energieverbrauch pro Frame, solange die Figur im Wasser ist. */
export const ENERGY_WATER_COST = 0.05;

// ---------------------------------------------------------------------------
// Gegner
// ---------------------------------------------------------------------------

/** Kantenlänge eines Gegner-Sprites (Pixel). */
export const ENEMY_SIZE = 8;
/** Treffer-Toleranz: Kollisionsbox ist ringsum so viele Pixel kleiner als das Sprite. */
export const ENEMY_HITBOX_INSET = 1;
/** Frames pro Animationsbild der Gegner. */
export const ENEMY_ANIM_FRAMES = 10;

/** Spinne: Tempo (Pixel/Frame) und maximale Abseil-Tiefe in Kacheln. */
export const SPIDER_SPEED = 0.5;
export const SPIDER_MAX_DROP_TILES = 6;

/** Fledermaus: Tempo (Pixel/Frame), Auf-und-ab-Amplitude (Pixel) und -Geschwindigkeit (Bogenmaß/Frame). */
export const BAT_SPEED = 0.7;
export const BAT_WOBBLE_AMP = 6;
export const BAT_WOBBLE_SPEED = 0.08;

/** Motte: Tempo (Pixel/Frame), mit dem sie auf die Figur zufliegt (nur im selben Raum). */
export const MOTH_SPEED = 0.35;
/** Motte: Zappel-Amplitude (Pixel) und -Geschwindigkeit. */
export const MOTH_WOBBLE_AMP = 2;
export const MOTH_WOBBLE_SPEED = 0.15;

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
  /** Laser-Strahl (wechselt zwischen beiden Farben). */
  laser: '#ff3030',
  laserLight: '#ffffff',
  /** Explosion (wechselnde Flackerfarben). */
  boom1: '#ffe030',
  boom2: '#ff7a10',
  boom3: '#ffffff',
  /** Titel/Bildschirme. */
  title: '#ffd400',
  titleShadow: '#c04000',
  highlight: '#40e0ff',
  /** Spinnenfaden. */
  thread: '#c8c8c8',
  /** HUD. */
  hudBg: '#000000',
  hudLine: '#606060',
  energy: '#ffd400',
  energyLow: '#ff3030',
  /** Debug-Text. */
  debug: '#00ff66',
  /** Normaler Text. */
  text: '#ffffff',
} as const;
