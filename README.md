# HexAgrar

This is my largest project so far, a game a bit similar to chess, but way simpler. I developed algorithms that play the game. You can choose which programm to play against, and try your luck! You can also watch different programms in battle. The whole app is in German. Run it here: [https://willem-schlieter.github.io/HexAgrar/campus/public/index.html](https://willem-schlieter.github.io/HexAgrar/campus/public/index.html)

---

#### HexAgrar ist ein Spiel auf 6x6 Feldern. Jede Seite besitzt 6 Figuren, die (wie Schach-Bauern) geradeaus ziehen oder diagonal schlagen können. Steht eine Figur noch ganz am Anfang, darf sie einmalig zwei Schritte gehen. Wer als erstes die gegnerische Linie erreicht hat, gewinnt das Spiel. Kann ein Spieler nicht mehr ziehen, ended das Spiel im Remis.

Hier ist alle unsere Software zu HexAgrar zu finden.
In `campus` befindet sich die WebApp, in der man das Spiel gegeneinander oder gegen Automaten spielen kann. Man kann in den Entwickler- und Programmiereransichten auch weitere Tools wie den TOGRE-Rechner finden.
In `rusty-hexagrar` befindet sich in Rust geschriebene Software zu Hexagrar. Diese kann in der Kommandozeile ausgeführt werden.
In `wasm` befindet sich ein WebAssembly-Modul, dass die Software aus `rusty-hexagrar` für den Campus verfügbar macht.

BREAKING NEWS: Der TOGRE-Spielbaum ist dank einiger Optimierungen am TOGRE-Algorithmus, der Halbkreis-Technik und der unglaublichen Performance von Rust nun endlich vollständig gelöst! Im neuen Tool "TOGRE-Inspektor" kann man den Baum erkunden.

***Das Programm kann über GitHub Pages gestartet werden:***

[https://willem-schlieter.github.io/HexAgrar/](https://willem-schlieter.github.io/HexAgrar/)

Das Projekt wird mit `SvelteJS`, `Typescript`, `Webpack` und `wasm-pack` entwickelt.
