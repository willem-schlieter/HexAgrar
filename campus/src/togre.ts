import H from "./core";
import { TOGREInterface } from "wasm";

const preload_DB_Path = "preload.togredb";

namespace T {
    export interface CalcResult {
        s: H.Code,
        p: "X" | "O",
        optionMethod: "pure" | "logfin" | "preffin", 
        prefdb: boolean,
        t: H.Final,
        time: number,
        db: {
            xnew: number,
            onew: number,
            x: number,
            o: number
        // },
        // times: {
        //     i: number,
        //     get: number,
        //     set: number
        }
    }

    interface RawJsonDB {
        kommentar: string,
        zeitstempel: string,
        eintraege: number,
        zzz: {
            X: {
                X?: string,
                O?: string,
                R?: string
            },
            O: {
                X?: string,
                O?: string,
                R?: string
            }
        }
    }

    export class DB {
        constructor(public info: string = "Für diese Datenbank wurden keine Informationen zur Verfügung gestellt.") {  };
        private c = {
            X: {
                X: new Set<H.Code>(),
                O: new Set<H.Code>(),
                R: new Set<H.Code>()
            },
            O: {
                X: new Set<H.Code>(),
                O: new Set<H.Code>(),
                R: new Set<H.Code>()
            }
        }
        preload () {
            fetch(preload_DB_Path).then(res => {
                if (! res.ok) throw new Error("Fetch-Response not OK: " + res);
                else return res.text();
            }).then(c => {
                const fields = c.split("%%")[1].split("#");
                const keys = ["XX", "XO", "XR", "OX", "OO", "OR"];
                let loaded = 0, error = 0;
                keys.forEach((k, i) => {
                    fields[i].split("/").forEach(code => {
                        if (code.match(H.codePattern)) {
                            this.c[k[0]][k[1]].add(code);
                            loaded ++;
                        } else {
                            console.error("Folgende Stellung konnte nicht aus der Preload-DB geladen werden, weil der Stellungscode ungültig ist: " + code);
                            error ++;
                        }
                    });
                });
                console.info(`Preload von ${loaded} Stellungen erfolgreich. ${error} fehlerhaft.`);
                if (error) console.warn(`Preload: ${error} Stellungscodes fehlerhaft.`);
            })
        }
        get (stellung: H.Code, player: H.Player): H.Final | null {
            // ++ times.get;
            if (this.c[player.c].R.has(stellung)) return "R";
            if (this.c[player.c].X.has(stellung)) return "X";
            if (this.c[player.c].O.has(stellung)) return "O";
            return null;
        }
        set (stellung: H.Code, player: H.Player, togre: H.Final): H.Final {
            // ++ times.set;
            this.c[player.c][togre].add(stellung);
            return togre;
        }
        /** Errechnet die TOGRE-Zahl der gegebenen Stellung und gibt ein `CalcResult` zurück, das Input, Output und relevante Meta-Infos zur Berechnung enthält. (Siehe Interface)
         * 
         * @param optionMethod Gibt an, welche Optionsmethode verwendet werden soll: Pure, logfin oder preffin.
         * @param prefdb Gibt an, ob TOGRE die prefDB Optimierung anwenden soll, die zu einer leichten Reduktion der DB-Belastung und zur Verbesserung der Performance führt.
         * 
        */
        calc (c: H.Code, p: H.Player, optionMethod: "pure" | "logfin" | "preffin", prefdb?: boolean): CalcResult {
            this.optionMethod = optionMethod
            const startStellung = H.convert.n(c),
                zeit = Date.now(),
                xlen = this.len(H.Player.X),
                olen = this.len(H.Player.O);

            const t = this[(prefdb ? "i_prefdb" : "i")](startStellung, p);

            const r: CalcResult = {
                s: c,
                p: p.c,
                optionMethod: optionMethod,
                prefdb: prefdb || false,
                t: t,
                time: Date.now() - zeit,
                db: {
                    x: this.len(H.Player.X),
                    o: this.len(H.Player.O),
                    xnew: 0,
                    onew: 0
                // },
                // times: {
                //     i: times.i,
                //     get: times.get,
                //     set: times.set
                }
            }
            r.db.xnew = r.db.x - xlen;
            r.db.onew = r.db.o - olen;
            return r;
        }
        /** Soll eigentlich mit 3 Threads rechnen, aber Thread 2 und der Main Thread warten auf Thread 1. Keine Ahnung, warum. */
        async calcPara (c: H.Code, p: H.Player, optionMethod: "pure" | "logfin" | "preffin", prefdb?: boolean): Promise<CalcResult> {
            this.optionMethod = optionMethod
            const startStellung = H.convert.n(c),
                zeit = Date.now(),
                xlen = this.len(H.Player.X),
                olen = this.len(H.Player.O);

            const folgestellungen = H.zieleVonStellung(startStellung, p);
            if (typeof folgestellungen != "string") {
                console.log("Starte jetzt den Async Thread.");
                const thread = (async function(db){
                    console.log("Hi aus dem Async Thread.");
                    while (folgestellungen.length) {
                        const f = folgestellungen.shift()!;
                        console.log(`Berechne ${H.convert.c(f)} im async thread.`);
                        db[(prefdb ? "i_prefdb" : "i")](f, p.t);
                    }
                    console.log("Tschüss aus dem Async Thread.");
                })(this);
                console.log("Starte jetzt den Async Thread 2.");
                const thread2 = (async function(db){
                    console.log("Hi aus dem Async Thread 2.");
                    while (folgestellungen.length) {
                        const f = folgestellungen.shift()!;
                        console.log(`Berechne ${H.convert.c(f)} im async thread 2.`);
                        db[(prefdb ? "i_prefdb" : "i")](f, p.t);
                    }
                    console.log("Tschüss aus dem Async Thread 2.");
                })(this);
                console.log("Jetzt der Main Thread.");
                while (folgestellungen.length) {
                    const f = folgestellungen.shift()!;
                    console.log(`Berechne ${H.convert.c(f)} im main thread.`);
                    this[(prefdb ? "i_prefdb" : "i")](f, p.t);                }
                console.log("Main Thread Ende. Warte auf den Async Thread...")
                await thread;
                console.log("Warte auf den Async Thread 2...")
                await thread2;
                console.log("Ende.")
            }
            console.log("TOGRE-Threads ended.")
            const t = this[(prefdb ? "i_prefdb" : "i")](startStellung, p);

            const r: CalcResult = {
                s: c,
                p: p.c,
                optionMethod: optionMethod,
                prefdb: prefdb || false,
                t: t,
                time: Date.now() - zeit,
                db: {
                    x: this.len(H.Player.X),
                    o: this.len(H.Player.O),
                    xnew: 0,
                    onew: 0
                // },
                // times: {
                //     i: times.i,
                //     get: times.get,
                //     set: times.set
                }
            }
            r.db.xnew = r.db.x - xlen;
            r.db.onew = r.db.o - olen;
            return r;
        }

        // /** Ermittelt anhand von Kriterien, ob die gegebene Stellung für einen der beiden Player gewonnen ist. */
        // final (s: H.Numpos, p: H.Player): H.Final {
        //     // p ist der Player, der am Zug ist. g ist der Gegner

        //     // Wenn eine Fig von g das Ende erreicht hat:                                       return g
        //     // Wenn p nicht mehr ziehen kann:                                                   return "R"

        //     // Wenn p einen FB hat, der weiter fortgeschritten ist als alle Fig von g:          return p
        //     // Wenn g einen FB hat, der weiter fortgeschritten ist als alle Fig von p:          return g

        // }


        // // interface Option {
        // //     from: number;
        // //     to: number;
        // //     ziel: H.Numpos;
        // // }

        // /** Beurteilt anhand von Kriterien */
        // sinnvoll (option: Option, p: H.Player): true | false {

        // }

        // /** Ermittelt anhand von Kriterien alle sinnvollen Optionen. */
        // relevanteOptionen (optionen: Option[], p: H.Player): Option[] {
            






        //     // 1) 
   
        //     // 2) Gibt es Optionen, FB zu bilden oder zu ziehen, die daraufhin mehr Fortschritt haben als alle Figuren des Gegners? Wenn ja, ziehe den, der daraufhin den größten Fortschritt hat.

        //     // 3) Hat der Gegner FB?
        //         // JA: Gibt es Optionen, die eine Fig ziehen, die daraufhin mehr Fortschritt hat als alle FB des Gegners?
        //             // NEIN:    AUFGEBEN!
        //             // JA:      Hast du grüne Züge?
        //                 // JA:      Schließe alle Nicht-Schlagzüge (auch nicht-schlagende grüne Züge!) aus, deren Fs geringer ist als der des am meisten fortschrittlichen grünen Zuges. (Wir haben also: Alle Schlagzüge sowie den maxFS grünen Zug, auch wenn dieser ein Nicht-Schlagzug ist.)
        //                 // NEIN:  TOGRE-Berechnung möglich?
        //                     // JA: 
        //                     // NEIN: 
        //         // NEIN: 
        // }

        /** Tatsächliche Rekursionsfunktion – nur für internen Gebrauch.*/
        i (s: H.Numpos, p: H.Player): H.Final {
            const code = H.convert.c(s);
            let result: H.Final | null = this.get(H.convert.c(s), p);
            if (result) return result;
            else {
                result = p.t.c;
                const o = this.executeOptionMethod(s, p, false);
                if (typeof o === "string") {
                    result = o;
                } else {
                    // Wichtigste Änderung: Die Optionen werden iterativ gescannt, wobei (NEU:) die Iteration abgebrochen wird, wenn eine TOGRE-positive Option gefunden wird. Dies verbessert die Performance.
                    for (let i = 0; i < o.length; i++) {
                        const kindTogre = this.i(o[i].ziel, p.t);
                        if (kindTogre === p.c) {
                            result = p.c;
                            break;
                        } else if (kindTogre === "R") {
                            result = "R";
                            continue;
                        } else {
                            continue;
                        }
                    }
                }
                return this.set(code, p, result);
            }
        }

        /** Tatsächliche Rekursionsfunktion – nur für internen Gebrauch. – mit prefdb*/
        i_prefdb (s: H.Numpos, p: H.Player): H.Final {
            const code = H.convert.c(s);
            const o = this.executeOptionMethod(s, p, false);
            let result: H.Final = p.t.c;
            if (typeof o === "string") {
                result = o;
            } else {
                // Wichtigste Änderung: Die Optionen werden iterativ gescannt, wobei (NEU:) die Iteration abgebrochen wird, wenn eine TOGRE-positive Option gefunden wird. Dies verbessert die Performance.
                // Zweitwichtigste Änderung: Zunächst werden alle Kind-Stellungen geprüft, die bereits in der DB sind. Erst wenn hier keine positive gefunden wird, werden diejenigen berechnet, die noch nicht in der DB sind.
                const nochtNichtInDB: H.Option[] = [];
                while (o[0]) {
                    const kindTogre = this.get(H.convert.c(o[0].ziel), p.t);
                    if (kindTogre) {
                        if (kindTogre === p.c) {
                            result = p.c;
                            return this.set(code, p, result)
                        } else if (kindTogre === "R") {
                            result = "R";
                            // continue;
                        } else {
                            // continue;
                        }
                    } else {
                        nochtNichtInDB.push(o[0]);
                    }
                    o.shift();
                }
                while (nochtNichtInDB[0]) {
                    const kindTogre = this.i_prefdb(nochtNichtInDB[0].ziel, p.t);
                    nochtNichtInDB.shift();
                    if (kindTogre === p.c) {
                        result = p.c;
                        break;
                    } else if (kindTogre === "R") {
                        result = "R";
                        continue;
                    } else {
                        continue;
                    }
                }
            }
            return this.set(code, p, result);
        }

        optionMethod: "pure" | "logfin" | "preffin" = "pure";
        executeOptionMethod (s: H.Numpos, p: H.Player, includeAll: boolean): H.Option[] | H.Final {
            return ((this.optionMethod === "preffin") ? H.getOptions_preffin : ((this.optionMethod === "logfin") ? H.getOptions_logfin :H.getOptions))(s, p);
        }

        /** LÖSCHT ALLE EINTRÄGE in der Datenbank. */
        clear (): void {
            this.c.X.X.clear();
            this.c.X.O.clear();
            this.c.X.R.clear();
            this.c.O.X.clear();
            this.c.O.O.clear();
            this.c.O.R.clear();
        }
        /** Gibt die Anzahl der Einträge in der Datenbank zurück. Die Zählung kann durch Parameter beschränkt werden.
         * @param player Wenn angegeben, werden nur Einträge für diesen Player gezählt.
         * @param togre Wenn angegeben, werden nur Einträge mit dieser TOGRE-Zahl gezählt.
         */
        len(player?: H.Player, togre?: H.Final): number {
            if (player) {
                if (togre) return this.c[player.c][togre].size;
                else return this.c[player.c]["X"].size + this.c[player.c]["O"].size + this.c[player.c]["R"].size;
            } else if (togre) return this.len(H.Player.X, togre) + this.len(H.Player.O, togre);
            else return this.len(H.Player.X) + this.len(H.Player.O);
        }

        stringify (kommentar: string): string {
            const c = {
                X: {
                    X: [] as string[],
                    O: [] as string[],
                    R: [] as string[]
                },
                O: {
                    X: [] as string[],
                    O: [] as string[],
                    R: [] as string[]
                }
            }
            this.c.X.X.forEach(v => c.X.X.push(v));
            this.c.X.R.forEach(v => c.X.R.push(v));
            this.c.X.O.forEach(v => c.X.O.push(v));
            this.c.O.X.forEach(v => c.O.X.push(v));
            this.c.O.R.forEach(v => c.O.R.push(v));
            this.c.O.O.forEach(v => c.O.O.push(v));
            const r: RawJsonDB = {
                kommentar: kommentar,
                zeitstempel: String(new Date()),
                eintraege: this.len(),
                zzz: {
                    X: {
                        X: c.X.X.join(","),
                        O: c.X.O.join(","),
                        R: c.X.R.join(",")
                    }, O: {
                        X: c.O.X.join(","),
                        O: c.O.O.join(","),
                        R: c.O.R.join(",")
                    }
                }
            }
            return JSON.stringify(r);
        }

    }

    export const stdDB = new DB("Die Standard-Datenbank, die im Namensraum T gesichert wird.");
}
export default T;

export namespace RustyT {
    let wasm_interface: TOGREInterface | null = null;

    /** Muss aufgerufen werden, bevor RustyTogre verwendet werden kann! */
    export function init () {
        fetch("preload.togredb").then(res => {
            if (! res.ok) {
                console.error(res);
                throw new Error("Fetch-Response not OK.");
            }
            else return res.text();
        }).then(c => {
            console.log("preload.togredb Inhalt: ", c);
            wasm_interface = TOGREInterface.new(c, 3, true, true);
        });
    }

    /** Rückgabe: [Ergebnis, Anzahl Einträge] */
    export function calc (s: H.Numpos, p: H.Player): [H.Final, number] {
        if (! wasm_interface) { throw new Error("RustyTpgreDB wurde noch nicht geladen."); }
        const before = wasm_interface.len();
        return [["O", "R", "X"][wasm_interface.calc(H.convert.c(s), p.c) + 1] as H.Final, wasm_interface.len() - before];
    }
}