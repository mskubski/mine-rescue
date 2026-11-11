# Level-Format

Ein Level ist ein `LevelDef` (`name` + `map`) in `src/levels/levelN.ts`. `map` ist ein Array von Textzeilen.

## Größe
- Die Welt besteht aus **Räumen zu 20x24 Kacheln** (Kachel = 8x8 Pixel, Raum = 160x192 Pixel).
- Breite jeder Zeile = Vielfaches von **20**, Zeilenzahl = Vielfaches von **24**.
- Level 1: 3x2 Räume = 60 Zeichen x 48 Zeilen.
- Die Kamera springt beim Verlassen eines Raumes zum Nachbarraum (Screen-Flip). Der Rand der Karte zählt als Fels.

## Zeichen
| Zeichen | Bedeutung                                   |
|---------|---------------------------------------------|
| `.`     | leer (Höhle)                                |
| `#`     | Fels (fest, nicht sprengbar)                |
| `L`     | Lehm (fest, mit Dynamit sprengbar, ab M3)   |
| `~`     | Lava (tödlich, ab M4)                       |
| `W`     | Wasser (ab M4)                              |
| `P`     | Startpunkt – genau einmal pro Level         |
| `R`     | verschütteter Bergmann – genau einmal       |

`P`/`R` sind Marker: darunter wird die Kachel als leer behandelt. Die Figur steht mittig auf der unteren Kante der Kachel.

## Hinweise zum Bauen
- Gänge mindestens **2 Kacheln (16 px) hoch**, Schächte mindestens **1 Kachel breit** (Figur ist 6 px breit, 14 px hoch).
- Fehler (falsche Länge, unbekanntes Zeichen, fehlendes `P`/`R`) meldet der Parser beim Start mit Zeile/Spalte.
- Neues Level: Datei anlegen, in `LEVEL_DEFS` (`src/levels/index.ts`) eintragen.
