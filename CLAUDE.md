# CLAUDE.md – Projektkontext "Mine Rescue"

Browser-Spiel im Stil von H.E.R.O. (Atari 2600) als eigenständiger Nachbau. UI-Name ist **"Mine Rescue"**, nie "H.E.R.O.".
Besitzer: GitHub `mskubski`. Vor dem ersten Push nach dem Repo-Namen fragen.

## Befehle
- `npm run dev` – Dev-Server, `npm run build` – Typecheck + Build, `npm run typecheck`

## Harte Vorgaben
- Vite + TypeScript (strict), HTML5 Canvas, **keine Engine, keine Laufzeit-Abhängigkeiten**
- Interne Auflösung 160x192, CSS ganzzahlig skaliert, `image-rendering: pixelated`
- Fester 60-Hz-Zeitschritt; Logik in `update()`, Zeichnen in `render()`
- Alle Grafiken als Code-Sprites (`src/sprites.ts`), keine externen Assets/Original-Grafiken
- Sound per WebAudio (`src/audio.ts`, Rechteck/Rauschen, AudioContext erst nach Benutzeraktion); Touch (`src/ui/touch.ts`) und Gamepad speisen `Input`
- PWA: `public/manifest.webmanifest`, `public/sw.js` (bei Änderungen `CACHE_VERSION` erhöhen), Icons via `scripts/make-icons.mjs`; SW wird nur im Prod-Build registriert
- Hinweis zum Testen von Touch/SW: `preview`-Server (Port 4173) in `.claude/launch.json`
- **Kommentare auf Deutsch**: Datei-Kopf mit Zweck, Abschnittsüberschriften, Kommentar an jeder Funktion/Klasse und nicht offensichtlichen Stellen
- **Tuning-Konstanten nur in `src/config.ts`** (mit Kommentar), keine Magic Numbers im Code
- Level als ASCII-Daten in `src/levels/` (Format: `docs/LEVEL_FORMAT.md`)

## Entscheidungen
- Screen-Flip wie Original: Kamera zeigt den Raum (20x22 Kacheln = 160x176 px, darunter 16 px HUD), in dem die Figurenmitte liegt; Welt ist ein globales Tile-Raster
- Gegner (8x8) agieren nur im Raum der Figur; Tod = Leben weniger + Level komplett neu laden
- Spielablauf als Zustandsmaschine in game.ts (title, playing, dying, levelDone, gameOver, victory)
- Neue Level: vor dem Eintragen prüfen, dass P→R erreichbar ist (Lehm zählt als passierbar)
- Kachelgröße 8x8; Kollisionsbox Figur 6x14, Sprite 8x16

## Arbeitsweise
- Meilensteine 1–7 (siehe README/CHANGELOG); nach jedem Meilenstein stoppen, Nutzer testet im Browser
- Pro Meilenstein ein deutscher Commit; CHANGELOG.md und README.md mitpflegen
- Hinweis zum Testen: Das Browser-Pane drosselt requestAnimationFrame im Hintergrund; Physik per dynamischem Import (`/src/...ts`) schrittweise simulieren
