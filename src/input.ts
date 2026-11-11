/**
 * input.ts – Eingabe-Abstraktion
 *
 * Übersetzt Tastatur-Ereignisse in abstrakte Spiel-Aktionen ("links", "laser" …).
 * Das Spiel fragt nur noch Aktionen ab und kennt keine Tastencodes.
 * Touch und Gamepad werden später (Meilenstein 6) hier ergänzt.
 *
 * Zwei Abfragearten:
 *   - isDown(aktion):     Taste ist gerade gehalten
 *   - wasPressed(aktion): Taste wurde seit dem letzten Logik-Schritt neu gedrückt
 */

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

/** Verwaltet den Zustand aller Eingabegeräte. */
export class Input {
  /** Aktuell gehaltene Tasten (KeyboardEvent.code). */
  private held = new Set<string>();
  /** Seit dem letzten endFrame() neu gedrückte Tasten. */
  private pressed = new Set<string>();

  /** Registriert die Tastatur-Listener am Fenster. */
  constructor() {
    window.addEventListener('keydown', (e) => {
      if (this.isBound(e.code)) e.preventDefault(); // Seite nicht scrollen, Strg+E o. Ä. unterdrücken
      if (!e.repeat) this.pressed.add(e.code);
      this.held.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.held.delete(e.code);
    });
    // Beim Fokusverlust alles loslassen, sonst "klebt" eine Taste.
    window.addEventListener('blur', () => this.held.clear());
  }

  /** Ist der Tastencode irgendeiner Aktion zugeordnet? */
  private isBound(code: string): boolean {
    return Object.values(BINDINGS).some((codes) => codes.includes(code));
  }

  /** Wird die Aktion gerade gehalten? */
  isDown(action: Action): boolean {
    return BINDINGS[action].some((c) => this.held.has(c));
  }

  /** Wurde die Aktion seit dem letzten Logik-Schritt neu gedrückt? */
  wasPressed(action: Action): boolean {
    return BINDINGS[action].some((c) => this.pressed.has(c));
  }

  /** Am Ende jedes Logik-Schritts aufrufen: löscht die "neu gedrückt"-Markierungen. */
  endFrame(): void {
    this.pressed.clear();
  }
}
