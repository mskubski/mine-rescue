# Mine Rescue

Eigenständiger Browser-Nachbau im Stil klassischer Heli-Rucksack-Spiele (inspiriert von H.E.R.O. auf dem Atari 2600).
Alle Grafiken entstehen per Code, es werden keine Original-ROMs oder -Grafiken verwendet.

**Stand:** Meilenstein 4 von 7 (Gegner: Spinne, Fledermaus, Motte; Lava tödlich, Wasser bremst).
Siehe [CHANGELOG.md](CHANGELOG.md).

## Start

Voraussetzung: Node.js (getestet mit v26).

```bash
npm install
npm run dev        # Entwicklungsserver (http://localhost:5173)
npm run build      # Typprüfung + Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

## Steuerung

| Aktion              | Taste                      |
|---------------------|----------------------------|
| Bewegen             | Pfeile oder WASD           |
| Steigen/Schweben    | Hoch / W (Rucksack)        |
| Laser               | Leertaste (gehalten = Dauerfeuer) |
| Dynamit legen       | Strg oder E (nur am Boden) |
| Pause               | P                          |
| Mute (ab M6)        | M                          |
| Debug-Anzeige       | F3 (Raum und Position)     |

Touch-Buttons und Gamepad folgen in Meilenstein 6.

## Projektstruktur

```
src/
  main.ts        Einstieg + Game-Loop (fester 60-Hz-Zeitschritt)
  config.ts      ALLE Tuning-Konstanten (Physik, Farben, Größen)
  game.ts        Spielzustand, Screen-Flip, update()/render()
  input.ts       Tastatur -> Aktionen (Tastenbelegung dort ändern)
  renderer.ts    Canvas, ganzzahlige Skalierung, Zeichnen
  sprites.ts     Pixel-Sprites als Text-Arrays + Paletten
  entities/      player, laser, dynamite, enemies (Spinne, Fledermaus, Motte)
  levels/        tiles.ts (Kachel-Typen), index.ts (Parser), level1.ts (Karte)
  ui/            Pixelfont (später Titel, Game Over)
docs/LEVEL_FORMAT.md   Anleitung zum Editieren von Leveln
```

## Wo ändere ich was?

- **Spielgefühl** (Lauftempo, Schwerkraft, Schub, Energieverbrauch, Laser, Dynamit-Zündschnur/Radius): `src/config.ts`
- **Level bauen/ändern**: `src/levels/level1.ts`, Format in `docs/LEVEL_FORMAT.md`; neue Level in `LEVEL_DEFS` (`src/levels/index.ts`) eintragen
- **Gegner-Verhalten und -Tempo**: `src/entities/enemies.ts` + Konstanten in `src/config.ts`
- **Grafiken**: `src/sprites.ts`
- **Tastenbelegung**: `BINDINGS` in `src/input.ts`
- **Farben**: `COLORS` in `src/config.ts`

## Technik

Vite + TypeScript, HTML5 Canvas (160x192, ganzzahlig skaliert), keine Laufzeit-Abhängigkeiten.
