import H from "./core";
import T from "./togre";
import type { Autocode } from "./auto";
import { writable, derived, Readable, readable, Writable } from "svelte/store";

export const lastMovTarget = writable(-1);

export const stellung = writable([[0, 1, 2, 3, 4, 5], [30, 31, 32, 33, 34, 35]] as H.Numpos);
export const amZug = writable(H.Player.X);
export const final = derived([stellung, amZug], ([s, a]) => {
    const r = H.zieleVonStellung(s, a);
    return (typeof r === "string") ? r : "";
});

export const mode = writable("ti" as ("spiel" | "stat" | "togre" | "ti"));
export const statRunning = writable(false);
export const togreRunning = writable(false);

// Der Wert ist irrelevant. Es geht nur darum, dass immer, wenn die RustyTogre-DB geändert wird, dieser Wert geändert werden muss, damit Svelte darauf reagiert und die Werte im TOGREInspector updatet.
export let rustyTChange = writable(0);

// Enthält die Option, die gerade gehovered wird, sowie den Player, der diesen Zug macht.
export let ti_hover: Writable<[H.Option, H.Player] | null> = writable(null);
// Die Stellung, von der aus die Option ist.
export let ti_before: Writable<[H.Numpos, H.Player]> = writable([H.convert.n("-"), H.Player.X]);
export let ti_clicked_id: Writable<number> = writable(-1);

// export const togreDB = readable(new T.DB("Die globale togreDB im Store."));

// export const devView = writable(false);
export const view = writable("pro" as "pro" | "dev" | "std");
export const shouldValidate = writable(false);
export const validate = derived([shouldValidate, view], ([s, v]) => s || (v === "std"));

export const auto_X = writable("" as Autocode | "");
export const auto_O = writable("" as Autocode | "");
export const auto_working = writable("" as "X" | "O" | "");
export const auto_auto = writable(true);
export const auto_wait = writable(1);

export const action = derived([final, auto_X, auto_O, auto_working, amZug, statRunning, togreRunning], ([f, x, o, a, p, s, t]) => {
    if (s) return "Statistische Auswertung läuft.";
    if (t) return "TOGRE-Berechnung läuft.";
    switch (f) {
        case "R": return "Spiel endet im Remis.";
        case "X": return "Spieler X gewinnt.";
        case "O": return "Spieler O gewinnt.";
        default: {
            switch (a) {
                case "O": return `Automat '${o}' arbeitet.`;
                case "X": return `Automat '${x}' arbeitet.`;
                default: {
                    return "Bereit: Spieler " + p.c + " ist am Zug.";
                }
            }
        }
    }
});
export const state = derived([final, auto_working, statRunning, togreRunning], ([f, a, s, t]) => {
    if (a && f) return console.error("Aus der Ableitungsfunktion derived(state): Ein Automat arbeitet, obwohl das Spiel final ist. Unbedingt prüfen! Hier muss ein Programmfehler vorliegen! (" + a + ", " + f + ")");
    else if (a || s || t) return "aktiv";
    else if (f) return "ende";
    else return "bereit";
}) as Readable<"ende" | "bereit" | "aktiv">;


type OverlayType = "final" | "test" | "stellung" | "auto_info" | "timing_info" | "none";
export const overlay = writable("none" as OverlayType);

const a = {
    X: ("" as Autocode | ""),
    O: ("" as Autocode | "")
}
auto_X.subscribe(ax => a.X = ax);
auto_O.subscribe(ao => a.O = ao);
interface HistEntry {
    stellung: string;
    amZug: "X" | "O";
    // Der Automat, der jetzt ziehen wird.
    auto: Autocode | "";
}
const {subscribe, set, update} = writable([] as HistEntry[]);
export const hist = {
    subscribe,
    add: (stellung: H.Numpos, amZug: H.Player) => update(h => [{stellung: H.convert.c(stellung), amZug: amZug.c, auto: a[amZug.c]}].concat(h)),
    undo: () => update(h => {
        if (h.length < 2) return h;
        else {
            let i: number;
            for (i = 1; (i + 1) < h.length; i++) {
                if (! h[i].auto) break;
            }
            stellung.set(H.convert.n(h[i].stellung));
            amZug.set(H.Player[h[i].amZug]);
            return h.slice(i);
        }
    }),
    clear: () => set([])
}


