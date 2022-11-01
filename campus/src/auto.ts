import H from "./core";
import T from "./togre";
import { later, random, wait } from "./tools";
import { BTRSInterface } from "wasm";
let btrs = BTRSInterface.new();

export interface Info {
    display: boolean;
    title: string;
    description: string;
    detailKeys?: string[];
    detailTypes?: string[];
}
export type Autocode = "rt" | "rtf" | "sea" | "kea400_sea" | "ezza100" | "ezza400" | "hybrid_TE" | "kea600_sea" | "trs_mat" | "btrs";
export const autocodes = ["rt", "rtf", "sea", "kea400_sea", "ezza100", "ezza400", "hybrid_TE", "kea600_sea", "trs_mat", "btrs"];
export type Automat = (stellung: H.Numpos, player: H.Player, options: H.Option[], detail?: {[index: string]: any}) => H.Option | undefined;

export const K = {
    finalzug (p: H.Player, o: H.Option[]): H.Option | undefined {
        return random(o.filter(option => H.zieleVonStellung(option.ziel, p.t) === p.c));
    },
    random (o: H.Option[]): H.Option | undefined {
        return random(o);
    }
}

export const A: { [index: string]: Automat } = {
    rt(s, p, o, d) { return K.random(o) },
    rtf(s, p, o, d) {
        return K.finalzug(p, o) || K.random(o);
    },
    // SCHRITTWEISE ENTWICKELTER AUTOMAT
    sea(s, p, o) {
        // 1) Gibt es einen Zug, in dem du gewonnen hast? Wenn ja, wähle ihn.
        {
            const f = K.finalzug(p, o);
            if (f) return f;
        }

        // 2) Gibt es Optionen, FB zu bilden oder zu ziehen, die daraufhin mehr Fortschritt haben als alle Figuren des Gegners? Wenn ja, ziehe den, der daraufhin den größten Fortschritt hat.

        // 3) Hat der Gegner FB?
        // JA: Gibt es Optionen, die eine Fig ziehen, die daraufhin mehr Fortschritt hat als alle FB des Gegners?
        // NEIN:    AUFGEBEN!
        // JA:      Hast du grüne Züge?
        // JA:      Schließe alle Nicht-Schlagzüge (auch nicht-schlagende grüne Züge!) aus, deren Fs geringer ist als der des am meisten fortschrittlichen grünen Zuges. (Wir haben also: Alle Schlagzüge sowie den maxFS grünen Zug, auch wenn dieser ein Nicht-Schlagzug ist.)
        // NEIN:  TOGRE-Berechnung möglich?
        // JA: 
        // NEIN: 
        // NEIN: 





        // Grüne Züge und ungedeckte Schlagzüge herausfiltern, wenn vorhanden: Einen zufällig auswählen

        // Schlagzug gegen den Gegner möglich?
        {
            const sz = K.random(o.filter(option => s[p.t.i].includes(option.to)))
            if (sz) return sz;
        }

        // Sonst einfach Zufall
        return K.random(o);
    },
    keaBase(s, p, o, d) {
        let st = Date.now();
        const spiele = d?.spiele || 100,
            automat = d?.autocode || "rtf",
            detail = d?.autodetail || {};
        const chancen = o.map(option => {
            const stat = new Stat(option.ziel, p.t, [automat, automat], [detail, detail], spiele, "keaBase stat");
            return (p.x) ? stat.fx : stat.fo;
        });
        let maxChance = Math.max.apply(Math, chancen);
        console.log("Fertig nach" + (Date.now() - st));
        return K.random(o.filter((option, i) => chancen[i] === maxChance));
    },
    ezza100(s, p, o) {
        return A.keaBase(s, p, o, {
            spiele: 100,
            autocode: "rtf",
            autodetail: {}
        });
    },
    ezza400(s, p, o) {
        return A.keaBase(s, p, o, {
            spiele: 400,
            autocode: "rtf",
            autodetail: {}
        });
    },
    kea400_sea(s, p, o) {
        return A.keaBase(s, p, o, {
            spiele: 400,
            autocode: "sea",
            autodetail: {}
        });
    },
    kea600_sea(s, p, o) {
        return A.keaBase(s, p, o, {
            spiele: 800,
            autocode: "sea",
            autodetail: {}
        });
    },
    hybrid_TE(s, p, o) {
        if (H.complex(s) > 9) return A.kea400_sea(s, p, o);
        else {
            // const t = T.stdDB.calc(H.convert.c(s), p, "pure", true).t;
            // console.log(t);
            
            // const bf = bestFraction(o, p);
            // // console.log("bestFraction sagt: Die besten Optionen haben TOGRE " + bf[1]);
            
            // if (bf[1] === p.c) return K.random(bf[0]);
            // else return A.kea400_sea(s, p, bf[0]);
            
            console.log("Spiele TOGRE-vollständig");
            const t = T.rustyTogre(s, p)[0];
            console.log("TOGRE der aktuellen Stellung: ", t);

            let remis: H.Option[] = [];
            for (let option of o) {
                const t = T.rustyTogre(option.ziel, p.t)[0];
                if (t == p.c) return option;
                else if (t === "R") remis.push(option);
            }
            return remis[0] || o[0];
        }
    },
    trs_mat(s, p, o) {
        let f = K.finalzug(p, o);
        if (f) return f;
        function i (s: H.Numpos, p: H.Player, tiefe: number): number {
            let folgestellungen = H.zieleVonStellung(s, p);
            switch (folgestellungen) {
                case "X": return 13;
                case "O": return -13;
                case "R": return 0;
                default: {
                    if (tiefe) {
                        const trs_werte = folgestellungen.map(pos => i(pos, p.t, tiefe - 1));
                        return (p.x ? Math.max : Math.min).apply(Math, trs_werte);
                    // Jetzt kommt das Entscheidende!
                    } else return s[0].length - s[1].length;
                }
            }
        }
        let map = o.map(option => ({opt: option, score: i(option.ziel, p.t, 4)}))
        console.log(map.map(f => `${f.opt.from} - ${f.opt.to} : ${f.score}`));
        return map.reduce((prev, curr) => {
            if ((p.x && prev.score > curr.score) || (p.o && prev.score < curr.score)) return prev;
            else if ((p.x && prev.score < curr.score) || (p.o && prev.score > curr.score)) return curr;
            else return (Math.random() < 0.5) ? curr : prev;
        }).opt;

    },
    btrs(s, p, o) {
        const result = H.convert.c(H.convert.normalize(H.convert.n(btrs.answer(H.convert.c(s), p.c, 6, 5))));
        const res = o.filter(option => {
            return H.convert.c(H.convert.normalize(option.ziel)) === result;
        });
        if (res.length) return res[0];
        else throw new Error(`BTRS gab keine brauchbare Antwort. ${H.convert.c(H.convert.normalize(H.convert.n(result)))} ist nicht in ${o} enthalten.`);
    }
}

/**
 * 
 * @param o Liste möglicher Optionen für den ziehenden Player p.
 * @param p Der Player, der am Zug ist, gleichzeitig der Klient.
 * @returns [Optionslistenfraktion, TOGRE-Zahl davon]
 */
export function bestFraction (o: H.Option[], p: H.Player): [H.Option[], H.Final] {
    const positiv: H.Option[] = [];
    const neutral: H.Option[] = [];
    const negativ: H.Option[] = [];
    for (let opt of o) {
        // const t = T.stdDB.calc(H.convert.c(opt.ziel), p.t, "pure", true).t;
        const t = T.stdDB.get(H.convert.c(opt.ziel), p.t);
        if (t === p.c) positiv.push(opt);
        if (t === p.t.c) negativ.push(opt);
        else neutral.push(opt);

    }

    const r = positiv.length ? [positiv, p.c] : (neutral.length ? [neutral, "R"] : [negativ, p.t.c]);
    if (! r[0].length) {
        console.error(o, p);
        throw new Error("bestFraction() darf noch kein empty array returnen!");
    } else return r as [H.Option[], H.Final];
}

export const info: {[index in Autocode]: Info} = {
    rt: {
        display: false,
        title: "Random Typenberger",
        description: "Führt einen zufälligen Zug aus.",
        detailKeys: [],
        detailTypes: []
    },
    rtf: {
        display: true,
        title: "Random Typenberger mit Finalfunktion",
        description: "Prüft, ob ein Sieg mit einem Zug möglich ist. Führt sonst einen zufälligen Zug aus."
    },
    sea: {
        display: true,
        title: "Schrittweise entwickelter Kriterienautomat",
        description: "Hier werden schrittweise Kriterien implementiert."
    },
    kea400_sea: {
        display: true,
        title: "KEA400 mit SEA",
        description: "Kriterialempirischer Automat (KEA), der 400 mal SEA gegen sich selbst antreten lässt, um statistische Gewinnchancen auszuwerten."
    },
    kea600_sea: {
        display: true,
        title: "KEA600 mit SEA",
        description: "Kriterialempirischer Automat (KEA), der 600 mal SEA gegen sich selbst antreten lässt, um statistische Gewinnchancen auszuwerten."
    },
    ezza100: {
        display: true,
        title: "Empirischer Zufall-Zufall-Automat (100)",
        description: "Lässt 100 mal rtf gegen sich selbst antreten."
    },
    ezza400: {
        display: true,
        title: "Empirischer Zufall-Zufall-Automat (400)",
        description: "Lässt 400 mal rtf gegen sich selbst antreten."
    },
    hybrid_TE: {
        display: true,
        title: "Hybridautomat: TOGRE+Empirik",
        description: "Spielt zunächst empirisch, später mit TOGRE-vollständig."
    },
    trs_mat: {
        display: true,
        title: "Materieler TRS-Automat",
        description: "Absolut tiefenlimitiertes Scoring auf Grundlage des Figurenüberhangs."
    },
    btrs: {
        display: true,
        title: "Bedingt tiefenlimitiertes Scoring mit optionaler Vollberechnung (TOGRE).",
        description: "Rechnet zB 6 Züge in die Tiefe und beurteilt die dortigen Folgestellungen anhand eines kriterialen Scorings. Wird jedoch eine Komplexitätsgrenze unterschritten, wird TOGRE-vollständig gerechnet."
    }
}

class Spiel {
    stellungen: Array<H.Numpos> = [];
    readonly start: H.Numpos;
    readonly startPlayer: H.Player;
    get len (): number {
        return this.stellungen.length;
    }
    get final (): H.Final | null {
        const z = H.zieleVonStellung(this.last, this.p);
        return (typeof z === "string") ? z : null;
    }
    get p (): H.Player {
        return (this.stellungen.length % 2) ? this.startPlayer : this.startPlayer.t;
    }
    get last (): H.Numpos {
        return this.stellungen[this.stellungen.length - 1];
    }
    constructor (start: H.Numpos, p: H.Player) {
        this.start = start;
        this.startPlayer = p;
        this.add(start);
    }
    add (s: H.Numpos): number {
        return this.stellungen.push(s);
    }
}
export class Stat {
    readonly spiele: Array<Spiel> = [];
    // readonly start: H.Numpos;
    // readonly startPlayer: H.Player;
    /**Die Länge des längsten Spiels */
    readonly maxlen: number;
    /**Die Länge des kürzesten Spiels */
    readonly minlen: number;
    /**Die durchschnittliche Länge der Spiele */
    readonly avlen: number;
    /**Der prozentuale Anteil der Spiele, die X gewinnt */
    readonly fx: number;
    /**Der prozentuale Anteil der Spiele, die O gewinnt */
    readonly fo: number;
    /**Der prozentuale Anteil der Spiele, die im Remis enden */
    readonly fr: number;

    constructor (
        readonly start: H.Numpos,
        readonly startPlayer: H.Player,
        autos: [Autocode, Autocode],
        detail: [any, any],
        spiele: number = 20,
        readonly kommentar?: string
    ) {
        for (spiele; spiele; spiele--) {
            const spiel = new Spiel(this.start, startPlayer);
            while (! spiel.final) {
                // HIER NOCHMAL WAS MACHEN! DIE OPTIONS MÜSSEN DOCH VORBERECHNET WERDEN!!! ODER???
                spiel.add(runSync(spiel.last, spiel.p, autos[spiel.p.i], detail[spiel.p.i]).ziel);
            }
            this.spiele.push(spiel)
        }

        const lens = this.spiele.map(s => s.len)
        this.maxlen = Math.max.apply(null, lens);
        this.minlen = Math.min.apply(null, lens);
        this.avlen = lens.reduce((prev: number, curr: number) => prev + curr) / lens.length;

        const wins = {
            x: this.spiele.filter(s => s.final === "X").length,
            o: this.spiele.filter(s => s.final === "O").length,
            r: this.spiele.filter(s => s.final === "R").length
        }
        this.fx = 100 * wins.x / this.spiele.length;
        this.fo = 100 * wins.o / this.spiele.length;
        this.fr = 100 * wins.r / this.spiele.length;
    }
}

export function runSync (stellung: H.Numpos, p: H.Player, auto: Autocode, detail?: any): H.Option {
    const o = H.getOptions(stellung, p);
    if (typeof o === "string") throw new Error("runSync bzw. ein Automat wurde für eine syntaktisch finale Stellung aufgerufen. Das sollte vermieden werden.");
    const r = A[auto](stellung, p, o, detail);
    if (!r) throw new Error("Der Automat antwortet nicht.");
    return r;
}

export default async function run (stellung: H.Numpos, p: H.Player, auto: Autocode, wartezeit?: number): Promise<H.Option> {
    const o = H.getOptions(stellung, p);
    if (typeof o === "string") throw new Error("run bzw. ein Automat wurde für eine syntaktisch finale Stellung aufgerufen. Das sollte vermieden werden.");
    await wait(wartezeit || 0);
    return later(() => {
        const r = A[auto](stellung, p, o, {});
        if (!r) throw new Error("Der Automat antwortet nicht.");
        return r;
    });
}
