/**
 * ui/touch.ts – Bildschirm-Buttons für Touch-Geräte
 *
 * Erzeugt ein Overlay mit Steuerkreuz (links), Laser-/Dynamit-Knopf (rechts)
 * sowie Pause- und Mute-Knopf. Das Overlay wird nur auf Touch-Geräten sichtbar:
 * entweder sofort (primärer Zeiger ist "grob", z. B. Smartphone) oder beim
 * ersten Tippen (Hybrid-Geräte). Die Buttons füttern `Input.setVirtual`.
 * Aussehen und Position: siehe CSS in index.html (#touch, .tbtn).
 */

import type { Action, Input } from '../input';

/** Beschreibung eines Buttons: Element-ID, Beschriftung, ausgelöste Aktionen. */
interface ButtonDef {
  id: string;
  label: string;
  actions: Action[];
}

const BUTTONS: ButtonDef[] = [
  { id: 't-up', label: '▲', actions: ['hoch'] },
  { id: 't-left', label: '◀', actions: ['links'] },
  { id: 't-right', label: '▶', actions: ['rechts'] },
  { id: 't-down', label: '▼', actions: ['runter'] },
  { id: 't-laser', label: 'LASER', actions: ['laser'] },
  { id: 't-dyn', label: 'DYN', actions: ['dynamit'] },
  { id: 't-pause', label: 'II', actions: ['pause'] },
  { id: 't-mute', label: '♪', actions: ['mute'] },
];

/** Baut die Touch-Buttons auf und aktiviert sie auf Touch-Geräten. */
export function setupTouch(input: Input, canvas: HTMLCanvasElement): void {
  const panel = document.createElement('div');
  panel.id = 'touch';
  panel.addEventListener('contextmenu', (e) => e.preventDefault());

  for (const def of BUTTONS) {
    const el = document.createElement('div');
    el.id = def.id;
    el.className = 'tbtn';
    el.textContent = def.label;
    const press = (down: boolean): void => {
      for (const a of def.actions) input.setVirtual(a, down);
      el.classList.toggle('on', down);
    };
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      press(true);
    });
    el.addEventListener('pointerup', () => press(false));
    el.addEventListener('pointercancel', () => press(false));
    panel.appendChild(el);
  }
  document.body.appendChild(panel);

  // Tippen auf das Spielfeld = "Start/Weiter" (Titel, Bonus, Game Over)
  canvas.addEventListener('pointerdown', () => input.tapStart());

  const enable = (): void => {
    document.body.classList.add('touch');
    window.dispatchEvent(new Event('resize')); // Renderer neu skalieren lassen
  };
  if (window.matchMedia('(pointer: coarse)').matches) enable();
  else window.addEventListener('touchstart', enable, { once: true, passive: true });
}
