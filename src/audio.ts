/**
 * audio.ts – Sound per WebAudio im Atari-Stil
 *
 * Alle Klänge werden zur Laufzeit aus Rechteck-/Dreieckwellen und gefiltertem
 * Rauschen erzeugt (keine Audiodateien). Browser erlauben Ton erst nach einer
 * Benutzeraktion; deshalb wird der AudioContext erst in `unlock()` erzeugt,
 * das bei jedem Tastendruck/Tippen aufgerufen wird.
 *
 * Mute-Zustand wird im Browser gespeichert (Taste M / Touch-Button).
 */

import { AUDIO_VOLUME, MUTE_KEY } from './config';

/** Alle Klangereignisse des Spiels. */
export type Sfx =
  | 'laser'
  | 'place'
  | 'tick'
  | 'explosion'
  | 'kill'
  | 'death'
  | 'rescue'
  | 'extra'
  | 'start'
  | 'gameOver'
  | 'victory';

/** Ton einer Melodie: Frequenz in Hz, Länge in Sekunden. */
type Note = [number, number];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  /** Dauerton des Rucksacks. */
  private thrustOsc: OscillatorNode | null = null;
  private thrustGain: GainNode | null = null;
  /** Ist der Ton stumm geschaltet? */
  muted = loadMuted();

  /** Erzeugt/aktiviert den AudioContext (nach einer Benutzeraktion aufrufen, mehrfach harmlos). */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : AUDIO_VOLUME;
      this.master.connect(this.ctx.destination);
      this.noiseBuf = this.makeNoise(this.ctx);
      this.startThrust();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Schaltet Stumm um und speichert die Wahl. */
  toggleMute(): void {
    this.muted = !this.muted;
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : AUDIO_VOLUME, this.ctx.currentTime, 0.01);
    try {
      localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0');
    } catch {
      /* Speicher nicht verfügbar – egal */
    }
  }

  /** Rucksack-Brummen ein-/ausschalten (jeden Frame mit dem aktuellen Zustand aufrufen). */
  setThrust(on: boolean): void {
    if (!this.ctx || !this.thrustGain) return;
    this.thrustGain.gain.setTargetAtTime(on ? 0.12 : 0, this.ctx.currentTime, 0.03);
  }

  /** Spielt einen Klang. */
  play(name: Sfx): void {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    switch (name) {
      case 'laser':
        this.tone('square', 1400, 250, 0.1, 0.5);
        break;
      case 'place':
        this.tone('square', 260, 200, 0.08, 0.5);
        break;
      case 'tick':
        this.tone('square', 1000, 1000, 0.025, 0.3);
        break;
      case 'explosion':
        this.noise(0.6, 1.0, 1200, 80);
        this.tone('square', 90, 30, 0.5, 0.6);
        break;
      case 'kill':
        this.noise(0.12, 0.6, 3000, 600);
        this.tone('triangle', 800, 200, 0.15, 0.6);
        break;
      case 'death':
        this.tone('square', 500, 40, 0.8, 0.6);
        this.noise(0.4, 0.5, 1500, 200);
        break;
      case 'rescue':
        this.melody([[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.1], [784, 0.1], [1047, 0.3]]);
        break;
      case 'extra':
        this.melody([[784, 0.08], [988, 0.08], [1175, 0.08], [1568, 0.2]]);
        break;
      case 'start':
        this.melody([[262, 0.08], [330, 0.08], [392, 0.08], [523, 0.16]]);
        break;
      case 'gameOver':
        this.melody([[392, 0.2], [330, 0.2], [262, 0.2], [196, 0.5]]);
        break;
      case 'victory':
        this.melody([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.12], [1319, 0.12], [1568, 0.4]]);
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Klangbausteine
  // -------------------------------------------------------------------------

  /** Ein Ton mit gleitender Frequenz (exponentiell) und abklingender Lautstärke. */
  private tone(type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Rauschstoß mit fallendem Tiefpass (Explosionen, Treffer). */
  private noise(dur: number, vol: number, fHigh: number, fLow: number): void {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(fHigh, t);
    filter.frequency.exponentialRampToValueAtTime(fLow, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  /** Kurze Melodie aus aufeinanderfolgenden Rechtecktönen. */
  private melody(notes: Note[]): void {
    let delay = 0;
    for (const [f, d] of notes) {
      this.tone('square', f, f, d * 0.95, 0.4, delay);
      delay += d;
    }
  }

  /** Erzeugt 1 s weißes Rauschen als Puffer. */
  private makeNoise(ctx: AudioContext): AudioBuffer {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Startet den (lautlosen) Dauerton des Rucksacks; setThrust blendet ihn ein. */
  private startThrust(): void {
    const ctx = this.ctx!;
    this.thrustOsc = ctx.createOscillator();
    this.thrustGain = ctx.createGain();
    this.thrustOsc.type = 'sawtooth';
    this.thrustOsc.frequency.value = 70;
    this.thrustGain.gain.value = 0;
    this.thrustOsc.connect(this.thrustGain).connect(this.master!);
    this.thrustOsc.start();
  }
}

/** Liest die gespeicherte Stumm-Einstellung. */
function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}
