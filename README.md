# Mine Rescue

Eigenständiger Browser-Nachbau im Stil klassischer Heli-Rucksack-Spiele (inspiriert von H.E.R.O. auf dem Atari 2600).
Alle Grafiken entstehen per Code, es werden keine Original-ROMs oder -Grafiken verwendet.

**Stand:** Meilenstein 6 von 7 (Sound, Touch-Steuerung, Gamepad, PWA/offlinefähig).
Siehe [CHANGELOG.md](CHANGELOG.md).

## Start

Voraussetzung: Node.js (getestet mit v26).

```bash
npm install
npm run dev        # Entwicklungsserver (http://localhost:5173)
npm run build      # Typprüfung + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

## Spielablauf

Bergmann am Ende jedes Levels berühren = gerettet. Bonus: 1000 + 10 pro Energie-Einheit + 50 pro übrigem Dynamit-Stab. Drei Leben; ein Tod startet das Level neu (Lehmwände, Gegner, Energie und Dynamit zurückgesetzt). Alle 20000 Punkte gibt es ein Extraleben. Der Highscore wird im Browser gespeichert.

## Steuerung

| Aktion              | Taste                      |
|---------------------|----------------------------|
| Bewegen             | Pfeile oder WASD           |
| Steigen/Schweben    | Hoch / W (Rucksack)        |
| Laser               | Leertaste (gehalten = Dauerfeuer) |
| Dynamit legen       | Strg oder E (nur am Boden) |
| Weiter/Start        | Leertaste oder Enter (Titel, Bonus, Game Over) |
| Pause               | P                          |
| Ton an/aus (Mute)   | M (wird gespeichert)       |
| Debug-Anzeige       | F3 (Raum und Position)     |

**Touch:** Auf Touch-Geräten erscheinen automatisch Bildschirm-Buttons (Steuerkreuz links, Laser/Dyn rechts, Pause und Ton oben). Ein Tipp auf den Laser-Knopf oder das Spielfeld startet/schaltet weiter. Dort wird das Bild in 0,25er-Schritten skaliert (am PC ganzzahlig).

**Gamepad** (Standard-Mapping): Stick/Steuerkreuz = bewegen, A = Laser, B/X = Dynamit, Start = Pause/Weiter, Select = Ton.

## Installieren / Offline (PWA)

Im Produktions-Build (`npm run build`, auf GitHub Pages) registriert sich ein Service Worker (`public/sw.js`); das Spiel lässt sich im Browser als App installieren und läuft offline. Bei größeren Änderungen `CACHE_VERSION` in `public/sw.js` erhöhen. Icons neu erzeugen: `node scripts/make-icons.mjs`.

## Projektstruktur

```
src/
  main.ts        Einstieg + Game-Loop (fester 60-Hz-Zeitschritt)
  config.ts      ALLE Tuning-Konstanten (Physik, Farben, Größen)
  game.ts        Zustandsmaschine (Titel/Spiel/Tod/Bonus/Game Over/Sieg), Punkte, Leben, Screen-Flip
  input.ts       Tastatur, Touch, Gamepad -> Aktionen (Tastenbelegung dort ändern)
  audio.ts       WebAudio-Sound (Rechteck/Rauschen), Mute
  renderer.ts    Canvas, ganzzahlige Skalierung, Zeichnen
  sprites.ts     Pixel-Sprites als Text-Arrays + Paletten
  entities/      player, laser, dynamite, enemies (Spinne, Fledermaus, Motte)
  levels/        tiles.ts (Kachel-Typen), index.ts (Parser), level1.ts (Karte)
  ui/            font.ts (Pixelfont A-Z), screens.ts (Titel, Bonus, Game Over, Sieg), touch.ts (Buttons)
public/          manifest.webmanifest, sw.js (Service Worker), icons/
scripts/         make-icons.mjs (PWA-Icons erzeugen)
docs/LEVEL_FORMAT.md   Anleitung zum Editieren von Leveln
```

## Wo ändere ich was?

- **Spielgefühl** (Lauftempo, Schwerkraft, Schub, Energieverbrauch, Laser, Dynamit-Zündschnur/Radius): `src/config.ts`
- **Level bauen/ändern**: `src/levels/level1.ts` … `level3.ts`, Format in `docs/LEVEL_FORMAT.md`; neue Level in `LEVEL_DEFS` (`src/levels/index.ts`) eintragen
- **Punkte, Leben, Boni**: Abschnitt "Spielablauf" in `src/config.ts`
- **Gegner-Verhalten und -Tempo**: `src/entities/enemies.ts` + Konstanten in `src/config.ts`
- **Grafiken**: `src/sprites.ts`
- **Tastenbelegung**: `BINDINGS` in `src/input.ts` (Gamepad: `PAD_BUTTONS`)
- **Sounds/Lautstärke**: `src/audio.ts`, `AUDIO_VOLUME` in `src/config.ts`
- **Touch-Layout**: CSS (`#touch`, `.tbtn`) in `index.html`
- **Farben**: `COLORS` in `src/config.ts`

## Technik

Vite + TypeScript, HTML5 Canvas (160x192, ganzzahlig skaliert), keine Laufzeit-Abhängigkeiten.
