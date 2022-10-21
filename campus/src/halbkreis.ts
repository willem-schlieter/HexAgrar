import H from "./core";

class Halbkreis {
    constructor (public kommentar: string) {};
    c = {
        X: new Set() as Set<string>, 
        O: new Set() as Set<string>, 
        B: new Set() as Set<string>
    }

    has (stellung: H.Numpos, p: H.Player) {
        const s = H.convert.c(stellung);
        return (
            this.c[p.c].has(s) ||
            this.c.B.has(s) ||
            this.c[p.c].has(H.convert.c(H.mirror(stellung))) ||
            this.c.B.has(H.convert.c(H.mirror(stellung)))
        );
    }

    add (s: H.Numpos, p: H.Player) {
        // Logisch finale Konstellationen werden gar nicht erst gespeichert.
        if (H.logFin(s, p)) return;

        if (this.has(s, p)) return;
        if (this.has(s, p.t)) {
            this.c[p.t.c].delete(H.convert.c(s));
            this.c[p.t.c].delete(H.convert.c(H.mirror(s)));
            this.c.B.add(H.convert.c(s));
            return;
        }
        this.c[p.c].add(H.convert.c(s));
    }

    stringify (kommentar: string) {
        const so = {
            str_kommentar: kommentar,
            hk_kommentar: this.kommentar,
            len: [this.c.X.size, this.c.O.size, this.c.B.size],
            timestamp: String(new Date()),
            z: {
                X: [...this.c.X],
                O: [...this.c.O],
                B: [...this.c.B]
            }
        }
        return JSON.stringify(so);
    }
}


/** Gibt eine Liste aller Stellung-Player-Paare aus, die reel existieren und eine Komplexität von `grenzwert` haben. */
export default function gener (grenzwert: number, s: string, p: H.Player): Halbkreis {
    if (!s) return gener(grenzwert, "-", H.Player.X);

    const hk = new Halbkreis("Die DB mit allen Stellungen, die im Halbkreis enthalten sind."),
        st = Date.now();

    const schon = new Halbkreis("Die DB, in der Stellungen mit complex > grenzwert gespeichert werden, deren Halbkreisfragment bereits errechnet wurde.");
    
    function rec (s: H.Numpos, p: H.Player): void {
        const c = H.complex(s);
        if (c < grenzwert) throw new Error(`Die Stellung ${H.convert.c(s)} mit dem Player ${p.c} wurde eingegeben. Deren Komplexität liegt mit ${c} unter dem Grenzwert von ${grenzwert}. Das bedeutet, dass sich der geforderte Halbkreis unterhalb der gegebenen Konstellation befindet, weshalb er nicht errechnet werden kann.`);
        else if (c === grenzwert) hk.add(s, p);
        else {
            const z = H.zieleVonStellung(s, p);
            if (typeof z === "string") hk.add(s, p);
            else {
                if (schon.has(s, p)) return;
                z.forEach(zielstellung => rec(zielstellung, p.t));
                if (c > grenzwert) schon.add(s, p);
            }
        }
    }
    rec(H.convert.n(s), p);
    console.log(`In ${Date.now() - st}ms wurde ein Halbkreis folgenden Umfangs generiert: ${hk.c.X.size}-X  ${hk.c.O.size}-O  ${hk.c.B.size}-B`);
    console.log(`Anzahl zusätzl. Berechnungsvermerke: ${schon.c.X.size + schon.c.O.size + schon.c.B.size}`);
    return hk;
}


// const hk: Halbkreis = {
//     X: new Set(), 
//     O: new Set(), 
//     B: new Set()
// }

// function add3 (s: H.Numpos, p: H.Player): void {
//     if (
//         hk[p.c].has(H.convert.c(s)) ||
//         hk.B.has(H.convert.c(s)) ||
//         hk[p.c].has(H.convert.c(H.mirror(s))) ||
//         hk.B.has(H.convert.c(H.mirror(s)))
//     ) return;
//     if (
//         hk[p.t.c].has(H.convert.c(s)) ||
//         hk[p.t.c].has(H.convert.c(H.mirror(s)))
//     ) {
//         hk[p.t.c].delete(H.convert.c(s));
//         hk[p.t.c].delete(H.convert.c(H.mirror(s)));
//         hk.B.add(H.convert.c(s));
//         return;
//     }
//     hk[p.c].add(H.convert.c(s));
// }
// function add2 (s: H.Numpos, p: H.Player): void {
//     let m = H.convert.c(H.mirror(s)) + "/" + p.c;
//     if (hk.B.has(m)) return; // console.log(`Spiegel: ${H.convert.c(s)}/${p.c} angefragt, bereits enthalten: ${m}`);
//     else {
//         // console.log(`KEIN Spiegel: ${H.convert.c(s)}/${p.c} angefragt, ${m} noch nicht enthalten: `, hk.B);
//         hk.B.add(H.convert.c(s) + "/" + p.c);
//     }
// }
// function add (s: H.Numpos, p: H.Player): void {
//     hk.B.add(H.convert.c(s) + "/" + p.c);
// }
