# Changelog

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unveröffentlicht]

## [0.2.0] – Meilenstein 2
### Hinzugefügt
- Tile-Map-Level als ASCII-Karte (`src/levels/level1.ts`) mit Parser und deutschen Fehlermeldungen
- Kacheltypen Fels, Lehm, Lava, Wasser (Lehm/Lava/Wasser noch ohne Spielwirkung)
- Achsenweise Kollision gegen feste Kacheln, Screen-Flip zwischen Räumen (20x24 Kacheln)
- Debug-Overlay (F3), Pause (P), winziger 3x5-Pixelfont
- `docs/LEVEL_FORMAT.md`

## [0.1.0] – Meilenstein 1
### Hinzugefügt
- Projekt-Setup (Vite + TypeScript, keine Laufzeit-Abhängigkeiten)
- Canvas 160x192, ganzzahlige Skalierung, fester 60-Hz-Game-Loop
- Eingabe-Abstraktion (Tastatur), Platzhalter-Figur mit Laufen/Steigen/Fallen
- Zentrale Konstanten in `src/config.ts`
