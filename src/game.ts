/**
 * game.ts – Spielzustand und Orchestrierung
 *
 * Hält Level, Spielfigur, Laser, Dynamit, Gegner und Eingabe zusammen und
 * steuert den Spielablauf als kleine Zustandsmaschine:
 *
 *   title -> playing -> (dying -> playing | gameOver)
 *                    -> levelDone -> playing (nächstes Level) | victory
 *   gameOver / victory -> title
 *
 * `update()` wird mit festem Zeitschritt (60 Hz) aufgerufen, `render()` einmal
 * pro Browser-Frame.
 *
 * Screen-Flip: Die Kamera zeigt immer den Raum (160x176 + HUD), in dem sich die
 * Mitte der Spielfigur befindet. Verlässt die Figur den Raum, springt die
 * Ansicht sofort zum Nachbarraum – wie beim Original.
 */

import {
  DEATH_FRAMES,
  DYNAMITE_BONUS_EACH,
  ENERGY_BONUS_PER_UNIT,
  ENERGY_LASER_COST,
  EXPLOSION_FRAMES,
  EXTRA_LIFE_EVERY,
  HIGHSCORE_KEY,
  LIVES_START,
  PLAYER_H,
  POINTS_ENEMY,
  RESCUE_BONUS,
  ROOM_PX_H,
  SCREEN_MIN_FRAMES,
  SCREEN_W,
} from './config';
import { AudioEngine } from './audio';
import { Dynamite } from './entities/dynamite';
import { createEnemy, type Enemy } from './entities/enemies';
import { Laser, rectsOverlap, type Rect } from './entities/laser';
import { Player } from './entities/player';
import { Input } from './input';
import { Level, LEVEL_DEFS } from './levels';
import { Tile } from './levels/tiles';
import { Renderer } from './renderer';
import {
  drawGameOver,
  drawLevelComplete,
  drawTitleScreen,
  drawVictory,
  type LevelResult,
} from './ui/screens';
import { setupTouch } from './ui/touch';

/** Zustände des Spielablaufs. */
type GameState = 'title' | 'playing' | 'dying' | 'levelDone' | 'gameOver' | 'victory';

export class Game {
  private input = new Input();
  private audio = new AudioEngine();
  private renderer: Renderer;
  private level: Level;
  private player = new Player();
  private laser = new Laser();
  /** Aktiver Dynamit-Stab (es liegt immer höchstens einer). */
  private dynamite: Dynamite | null = null;
  /** Alle Gegner des Levels. */
  private enemies: Enemy[] = [];

  private state: GameState = 'title';
  /** Frames seit dem letzten Zustandswechsel. */
  private stateTimer = 0;
  /** Globaler Frame-Zähler (für Blinken). */
  private tick = 0;
  private paused = false;
  private debug = false;

  private score = 0;
  private lives = LIVES_START;
  private levelIndex = 0;
  /** Punktestand, bei dem das nächste Extraleben fällig ist. */
  private nextExtraLife = EXTRA_LIFE_EVERY;
  private highScore = loadHighScore();
  private newRecord = false;
  private result: LevelResult | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    // Ton darf erst nach einer Benutzeraktion starten; Touch-Buttons nur auf Touch-Geräten.
    this.input.onUserGesture = () => this.audio.unlock();
    setupTouch(this.input, canvas);
    // Level 1 schon laden, damit render() im Titel nichts Ungültiges anfasst.
    this.level = new Level(LEVEL_DEFS[0]);
  }

  // -------------------------------------------------------------------------
  // Ablaufsteuerung
  // -------------------------------------------------------------------------

  /** Startet ein neues Spiel ab Level 1. */
  private startGame(): void {
    this.score = 0;
    this.lives = LIVES_START;
    this.levelIndex = 0;
    this.nextExtraLife = EXTRA_LIFE_EVERY;
    this.newRecord = false;
    this.audio.play('start');
    this.loadLevel(0);
  }

  /** Lädt ein Level frisch (Lehm wieder da, Gegner neu, Energie/Dynamit voll). */
  private loadLevel(index: number): void {
    this.levelIndex = index;
    this.level = new Level(LEVEL_DEFS[index]);
    this.player.resetForLevel(this.level.start.x, this.level.start.y);
    this.laser = new Laser();
    this.dynamite = null;
    this.enemies = this.level.enemySpawns.map((s) => createEnemy(s, this.level));
    this.paused = false;
    this.setState('playing');
  }

  /** Wechselt den Zustand und setzt den Zustands-Timer zurück. */
  private setState(s: GameState): void {
    this.state = s;
    this.stateTimer = 0;
  }

  /** Punkte gutschreiben; Extraleben bei jeder Schwelle. */
  private addScore(points: number): void {
    this.score += points;
    while (this.score >= this.nextExtraLife) {
      this.lives++;
      this.nextExtraLife += EXTRA_LIFE_EVERY;
      this.audio.play('extra');
    }
  }

  /** Spielende (Game Over oder Sieg): Highscore prüfen und speichern. */
  private finishRun(next: 'gameOver' | 'victory'): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.newRecord = true;
      saveHighScore(this.highScore);
    }
    this.audio.play(next);
    this.setState(next);
  }

  /** Figur stirbt: kurze Todesphase, danach Leben abziehen. */
  private killPlayer(): void {
    if (this.state !== 'playing') return;
    this.audio.play('death');
    this.setState('dying');
  }

  /** Bergmann erreicht: Bonus berechnen und Wertung anzeigen. */
  private completeLevel(): void {
    const energyBonus = Math.floor(this.player.energy) * ENERGY_BONUS_PER_UNIT;
    const dynamiteBonus = this.player.dynamite * DYNAMITE_BONUS_EACH;
    const total = RESCUE_BONUS + energyBonus + dynamiteBonus;
    this.result = {
      levelNumber: this.levelIndex + 1,
      rescue: RESCUE_BONUS,
      energyBonus,
      dynamiteBonus,
      total,
    };
    this.addScore(total);
    this.audio.play('rescue');
    this.setState('levelDone');
  }

  // -------------------------------------------------------------------------
  // Logik
  // -------------------------------------------------------------------------

  /** Raum-Spalte der Kamera (aus der Figurenmitte, auf Levelgrenzen begrenzt). */
  private get roomX(): number {
    return clamp(Math.floor(this.player.centerX / SCREEN_W), 0, this.level.roomsX - 1);
  }
  /** Raum-Zeile der Kamera. */
  private get roomY(): number {
    return clamp(Math.floor(this.player.centerY / ROOM_PX_H), 0, this.level.roomsY - 1);
  }

  /** Kollisionsbox des Bergmanns (8x16, Position = Mitte-unten). */
  private get minerBox(): Rect {
    const m = this.level.miner;
    return { x: m.x - 4, y: m.y - 16, w: 8, h: 16 };
  }

  /** Ein fester Logik-Schritt (1/60 s). */
  update(): void {
    this.tick++;
    this.stateTimer++;
    this.input.poll();
    const pressedStart = this.input.wasPressed('start');
    if (this.input.wasPressed('mute')) this.audio.toggleMute();

    switch (this.state) {
      case 'title':
        if (pressedStart) this.startGame();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'dying':
        if (this.stateTimer >= DEATH_FRAMES) {
          this.lives--;
          if (this.lives <= 0) this.finishRun('gameOver');
          else this.loadLevel(this.levelIndex);
        }
        break;
      case 'levelDone':
        if (pressedStart && this.stateTimer >= SCREEN_MIN_FRAMES) {
          if (this.levelIndex + 1 >= LEVEL_DEFS.length) this.finishRun('victory');
          else this.loadLevel(this.levelIndex + 1);
        }
        break;
      case 'gameOver':
      case 'victory':
        if (pressedStart && this.stateTimer >= SCREEN_MIN_FRAMES) this.setState('title');
        break;
    }
    // Rucksack-Brummen nur, wenn wirklich geflogen wird
    this.audio.setThrust(this.state === 'playing' && !this.paused && this.player.thrusting);
    this.input.endFrame();
  }

  /** Spiel läuft: Figur, Waffen, Gegner, Gefahren, Rettung. */
  private updatePlaying(): void {
    if (this.input.wasPressed('pause')) this.paused = !this.paused;
    if (this.input.wasPressed('debug')) this.debug = !this.debug;
    if (this.paused) return;

    this.player.update(this.input, this.level);
    this.updateWeapons();
    this.updateEnemies();
    // Lava ist tödlich
    if (this.player.touches(this.level, Tile.Lava)) this.killPlayer();
    // Bergmann erreicht?
    if (this.state === 'playing' && rectsOverlap(this.player.box, this.minerBox)) this.completeLevel();
  }

  /** Laser und Dynamit: Eingabe auswerten, Objekte fortschreiben, Treffer prüfen. */
  private updateWeapons(): void {
    const p = this.player;

    // Laser: Dauerfeuer bei gehaltener Taste, kostet Energie
    if (this.input.isDown('laser') && this.laser.ready && p.energy > 0) {
      this.laser.fire();
      this.audio.play('laser');
      p.energy = Math.max(0, p.energy - ENERGY_LASER_COST);
    }
    this.laser.update(p, this.level);

    // Dynamit legen: nur am Boden, nur ein Stab gleichzeitig
    if (this.input.wasPressed('dynamit') && p.dynamite > 0 && !this.dynamite && p.onGround) {
      p.dynamite--;
      this.dynamite = new Dynamite(p.centerX, p.y + PLAYER_H - 3);
      this.audio.play('place');
    }
    if (this.dynamite) {
      this.dynamite.update(this.level);
      if (this.dynamite.fuse > 0 && this.dynamite.fuse % 15 === 0) this.audio.play('tick');
      if (this.dynamite.boom === EXPLOSION_FRAMES) this.audio.play('explosion');
      if (this.dynamite.hits(p.box)) this.killPlayer();
      if (this.dynamite?.finished) this.dynamite = null;
    }
  }

  /** Gegner im aktuellen Raum bewegen und Treffer auswerten (Laser, Explosion, Berührung). */
  private updateEnemies(): void {
    const rx = this.roomX;
    const ry = this.roomY;
    for (const e of this.enemies) {
      if (!e.alive || e.roomX !== rx || e.roomY !== ry) continue;
      e.update(this.level, this.player);
      if (this.laser.active && rectsOverlap(this.laser.rect(), e.box)) this.killEnemy(e);
      else if (this.dynamite?.hits(e.box)) this.killEnemy(e);
      if (e.alive && rectsOverlap(this.player.box, e.box)) this.killPlayer();
    }
  }

  /** Gegner getötet: Punkte gutschreiben. */
  private killEnemy(e: Enemy): void {
    e.alive = false;
    this.audio.play('kill');
    this.addScore(POINTS_ENEMY);
  }

  // -------------------------------------------------------------------------
  // Zeichnen
  // -------------------------------------------------------------------------

  /** Zeichnet den aktuellen Zustand. */
  render(): void {
    this.renderState();
    if (this.audio.muted) this.renderer.drawMuteIndicator();
  }

  /** Zeichnet je nach Zustand die passende Ansicht. */
  private renderState(): void {
    const r = this.renderer;
    switch (this.state) {
      case 'title':
        r.clear();
        r.drawTitleArt();
        drawTitleScreen(r.ctx, this.highScore, this.tick);
        break;
      case 'playing':
        this.renderWorld(true);
        break;
      case 'dying':
        // Figur blinkt während der Todesphase
        this.renderWorld(Math.floor(this.stateTimer / 6) % 2 === 0);
        break;
      case 'levelDone':
        r.clear();
        if (this.result) {
          drawLevelComplete(r.ctx, this.result, this.stateTimer >= SCREEN_MIN_FRAMES, this.tick);
        }
        break;
      case 'gameOver':
        r.clear();
        drawGameOver(r.ctx, this.score, this.highScore, this.newRecord, this.stateTimer >= SCREEN_MIN_FRAMES, this.tick);
        break;
      case 'victory':
        r.clear();
        drawVictory(r.ctx, this.score, this.newRecord, this.stateTimer >= SCREEN_MIN_FRAMES, this.tick);
        break;
    }
  }

  /** Zeichnet die Spielwelt des aktuellen Raums samt HUD. */
  private renderWorld(showPlayer: boolean): void {
    const rx = this.roomX;
    const ry = this.roomY;
    const r = this.renderer;
    r.beginFrame(this.level, rx, ry);
    const m = this.level.miner;
    if (Math.floor(m.x / SCREEN_W) === rx && Math.floor((m.y - 1) / ROOM_PX_H) === ry) r.drawMiner(m);
    for (const e of this.enemies) {
      if (e.roomX === rx && e.roomY === ry) r.drawEnemy(e);
    }
    if (this.dynamite) r.drawDynamite(this.dynamite);
    if (showPlayer) r.drawPlayer(this.player);
    r.drawLaser(this.laser);
    r.drawHud(this.player, this.score, this.lives, this.levelIndex + 1);
    if (this.debug) r.drawDebug(rx, ry, this.player);
    if (this.paused) r.drawPause();
  }
}

/** Begrenzt v auf den Bereich [min, max]. */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Liest den Highscore aus dem Browser-Speicher (0, falls nicht verfügbar). */
function loadHighScore(): number {
  try {
    return Number(localStorage.getItem(HIGHSCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Speichert den Highscore (Fehler, z. B. privater Modus, werden ignoriert). */
function saveHighScore(v: number): void {
  try {
    localStorage.setItem(HIGHSCORE_KEY, String(v));
  } catch {
    /* nicht schlimm */
  }
}
