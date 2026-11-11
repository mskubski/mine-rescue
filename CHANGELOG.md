# Changelog

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unveröffentlicht]

## [0.6.0] – Meilenstein 6
### Hinzugefügt
- Sound per WebAudio (Laser, Dynamit, Explosion, Treffer, Tod, Jingles, Rucksack-Brummen), Mute mit Taste M (gespeichert) und „MUTE“-Anzeige
- Touch-Buttons (nur auf Touch-Geräten), Tippen aufs Spielfeld = Start/Weiter, Hochformat-Layout mit freigehaltenem Bedienfeld
- Gamepad-Unterstützung (Gamepad API)
- PWA: Manifest, Icons (per `scripts/make-icons.mjs` erzeugt), Service Worker mit Offline-Cache
### Geändert
- Auf Touch-Geräten Skalierung in 0,25er-Schritten statt strikt ganzzahlig

## [0.5.0] – Meilenstein 5
### Hinzugefügt
- Rettung des Bergmanns beendet das Level; Bonus für Restenergie und Restdynamit
- Punktestand, 3 Leben, Extraleben alle 20000 Punkte, Highscore (localStorage)
- Titel-, Bonus-, Game-Over- und Sieg-Bildschirm; Pixelfont jetzt A–Z
- Level 2 ("Tiefe Gänge", 4x2 Räume) und Level 3 ("Der Schacht", 3x3 Räume mit Lehm-Boden im Schacht)
- HUD mit Punkten, Level, Energie, Dynamit, Leben
### Geändert
- Tod kostet ein Leben und startet das Level neu (vorher Platzhalter)

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
