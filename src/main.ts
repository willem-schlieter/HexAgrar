let $g: typeof document.querySelector = document.querySelector.bind(document),
    $a: typeof document.querySelectorAll = document.querySelectorAll.bind(document),
    $c: typeof document.createElement = document.createElement.bind(document);
;

class Player {
    static X = new Player(true);
    static O = new Player(false);
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
}

Brett.init();
Brett.applyStellung(new Stellung("012345.uvwxyz"));



// Panels.addChangeListener((event) => {
    // if (event.property === "validate") Brett.indicateAmZug = event.value;
// });