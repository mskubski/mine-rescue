/**
 * input.ts – Eingabe-Abstraktion
 *
 * Übersetzt Tastatur, Touch-Buttons und Gamepad in abstrakte Spiel-Aktionen
 * ("links", "laser" …). Das Spiel fragt nur noch Aktionen ab und kennt keine
 * Tastencodes oder Geräte.
 *
 * Zwei Abfragearten:
 *   - isDown(aktion):     Aktion ist gerade aktiv (gehalten)
 *   - wasPressed(aktion): Aktion wurde seit dem letzten Logik-Schritt neu ausgelöst
 *
 * Quellen: Tastatur (BINDINGS), virtuelle Touch-Buttons (setVirtual, tapStart),
 * Gamepad (poll, einmal pro Logik-Schritt).
 */

import { GAMEPAD_DEADZONE } from './config';

/** Alle Aktionen, die das Spiel kennt. */
export type Action =
  | 'links'
  | 'rechts'
  | 'hoch'
  | 'runter'
  | 'laser'
  | 'dynamit'
  | 'pause'
  | 'mute'
  | 'debug'
  | 'start';

/** Tastenbelegung: Aktion -> Liste von KeyboardEvent.code-Werten. */
const BINDINGS: Record<Action, string[]> = {
  links: ['ArrowLeft', 'KeyA'],
  rechts: ['ArrowRight', 'KeyD'],
  hoch: ['ArrowUp', 'KeyW'],
  runter: ['ArrowDown', 'KeyS'],
  laser: ['Space'],
  dynamit: ['ControlLeft', 'ControlRight', 'KeyE'],
  pause: ['KeyP'],
  mute: ['KeyM'],
  debug: ['F3'],
  start: ['Enter', 'Space'],
};

/** Gamepad-Belegung (Standard-Mapping): Aktion -> Button-Indizes. */
const PAD_BUTTONS: Partial<Record<Action, number[]>> = {
  hoch: [12], // Steuerkreuz hoch
  runter: [13],
  links: [14],
  rechts: [15],
  laser: [0], // A
  dynamit: [1, 2], // B oder X
  pause: [9], // Start
  start: [9, 0],
  mute: [8], // Select/Back
};

/** Verwaltet den Zustand aller Eingabegeräte. */
export class Input {
  /** Aktuell gehaltene Tasten (KeyboardEvent.code). */
  private held = new Set<string>();
  /** Seit dem letzten endFrame() neu gedrückte Tasten. */
  private pressed = new Set<string>();
  /** Touch: gehaltene bzw. neu ausgelöste virtuelle Aktionen. */
  private virtualDown = new Set<Action>();
  private virtualPressed = new Set<Action>();
  /** Gamepad: gehaltene bzw. neu ausgelöste Aktionen. */
  private padDown = new Set<Action>();
  private padPressed = new Set<Action>();
  /** Callback, der bei jeder Benutzeraktion läuft (Audio freischalten). */
  onUserGesture: () => void = () => {};

  /** Registriert die Tastatur-Listener am Fenster. */
  constructor() {
    window.addEventListener('keydown', (e) => {
      if (this.isBound(e.code)) e.preventDefault(); // Seite nicht scrollen, Strg+E o. Ä. unterdrücken
      if (!e.repeat) this.pressed.add(e.code);
      this.held.add(e.code);
      this.onUserGesture();
    });
    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
    // Beim Fokusverlust alles loslassen, sonst "klebt" eine Taste.
    window.addEventListener('blur', () => {
      this.held.clear();
      this.virtualDown.clear();
    });
  }

  /** Ist der Tastencode irgendeiner Aktion zugeordnet? */
  private isBound(code: string): boolean {
    return Object.values(BINDINGS).some((codes) => codes.includes(code));
  }

  /** Wird die Aktion gerade gehalten (Tastatur, Touch oder Gamepad)? */
  isDown(action: Action): boolean {
    return (
      BINDINGS[action].some((c) => this.held.has(c)) ||
      this.virtualDown.has(action) ||
      this.padDown.has(action)
    );
  }

  /** Wurde die Aktion seit dem letzten Logik-Schritt neu ausgelöst? */
  wasPressed(action: Action): boolean {
    if (BINDINGS[action].some((c) => this.pressed.has(c))) return true;
    if (this.virtualPressed.has(action) || this.padPressed.has(action)) return true;
    // Auf Touch/Gamepad löst der Laser-Button auch "Start/Weiter" aus.
    if (action === 'start' && (this.virtualPressed.has('laser') || this.padPressed.has('laser'))) return true;
    return false;
  }

  /** Touch-Button gedrückt/losgelassen. */
  setVirtual(action: Action, down: boolean): void {
    if (down) {
      if (!this.virtualDown.has(action)) this.virtualPressed.add(action);
      this.virtualDown.add(action);
      this.onUserGesture();
    } else {
      this.virtualDown.delete(action);
    }
  }

  /** Tippen auf den Bildschirm = "Start/Weiter". */
  tapStart(): void {
    this.virtualPressed.add('start');
    this.onUserGesture();
  }

  /** Fragt das Gamepad ab (einmal pro Logik-Schritt aufrufen). */
  poll(): void {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    const pad = pads.find((p): p is Gamepad => !!p && p.connected);
    const now = new Set<Action>();
    if (pad) {
      const ax = pad.axes[0] ?? 0;
      const ay = pad.axes[1] ?? 0;
      if (ax < -GAMEPAD_DEADZONE) now.add('links');
      if (ax > GAMEPAD_DEADZONE) now.add('rechts');
      if (ay < -GAMEPAD_DEADZONE) now.add('hoch');
      if (ay > GAMEPAD_DEADZONE) now.add('runter');
      for (const [action, buttons] of Object.entries(PAD_BUTTONS) as [Action, number[]][]) {
        if (buttons.some((i) => pad.buttons[i]?.pressed)) now.add(action);
      }
    }
    for (const a of now) if (!this.padDown.has(a)) this.padPressed.add(a);
    this.padDown = now;
    if (now.size > 0) this.onUserGesture();
  }

  /** Am Ende jedes Logik-Schritts aufrufen: löscht die "neu ausgelöst"-Markierungen. */
  endFrame(): void {
    this.pressed.clear();
    this.virtualPressed.clear();
    this.padPressed.clear();
  }
}
