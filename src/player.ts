class Remis {
    readonly remis = true;
    readonly code = "remis";
};
class Both {
    readonly both = true;
    readonly code = "both";
}
class Player {
    static X = new Player(true);
    static O = new Player(false);
    static Remis = new Remis();
    static Both = new Both();

    static toggle (player: Player): Player {
        return (player.x) ? Player.O : Player.X;
    }

    constructor(x: boolean) {
        this.o = !(this.x = x);
        this.code = (x) ? "x" : "o";
    }

    readonly x: boolean;
    readonly o: boolean;
    readonly code: "x" | "o";
    /**Gibt ein `Array` mit allen `Zug`[Zügen] zurück, die in der aktuellen `Brett.stellung` für diesen `Player` möglich sind. */
    zuege (): Zug[] {
        return Array.prototype.concat.apply([], Brett.felder.filter(f => f.fig === this).map(f => Brett.stellung.zieleVon(f.dez).map(dez => new Stellung.Zug(f, Brett.feld(dez)))));
    }
}