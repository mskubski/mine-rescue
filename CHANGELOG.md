# Changelog

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unveröffentlicht]

## [0.4.0] – Meilenstein 4
### Hinzugefügt
- Gegner: Spinne (seilt sich an der Decke ab), Fledermaus (patrouilliert waagerecht), Motte (verfolgt die Figur im selben Raum)
- Gegner werden per Laser oder Explosion getötet, Berührung tötet die Figur
- Lava ist tödlich; Wasser bremst und kostet zusätzlich Energie
- Gegner-Marker `S`, `B`, `M` im Level-Format (Spinne muss an einer Decke hängen, sonst Fehlermeldung)
- Level 1 mit allen Gegnerarten und Lava vor dem Bergmann

## [0.3.0] – Meilenstein 3
### Hinzugefügt
- Energie (Rucksack-Power): sinkt beim Fliegen und Schießen, bei 0 versagt der Schub
- Helm-Laser (Leertaste, Dauerfeuer mit Cooldown), endet an festen Kacheln
- Dynamit (Strg/E): Zündschnur, Explosion, sprengt Lehm im Radius, verletzt die Figur
- HUD-Streifen unten (Energie-Balken, Dynamit-Vorrat)
- Level 1 mit Lehmwand auf der Hauptroute
### Geändert
- Raumhöhe 22 statt 24 Kacheln (16 px HUD); Level-Karten entsprechend 22 Zeilen pro Raum
- Tod ist vorerst Platzhalter (Respawn am Start); Leben/Game Over folgen in M5

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
